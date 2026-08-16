from fastapi import FastAPI, Request, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import json
import uuid
from typing import Optional
from datetime import datetime
from contextlib import asynccontextmanager
from .rag_pipeline import query_rag, reload_pipeline, init_rag_pipeline
from .cv_pipeline import detect_humans, calculate_battery_percentage, extract_osd_text
import base64
import serial
import serial.tools.list_ports
import threading

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize RAG pipeline on startup
    init_rag_pipeline()
    yield

app = FastAPI(title="Agricultural Drone Dashboard & RAG API", lifespan=lifespan)

# Allow your dashboard frontend origin and others
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Mount static files
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

# Set up templates
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

# Mount detections folder for frontend access
PROJ_ROOT = os.path.dirname(os.path.dirname(BASE_DIR))
DETECTIONS_DIR = os.path.join(PROJ_ROOT, "Data", "storage", "detections")
os.makedirs(DETECTIONS_DIR, exist_ok=True)
app.mount("/detections", StaticFiles(directory=DETECTIONS_DIR), name="detections")

# --- ESP-NOW GPS SERIAL INTERFACE ---
gps_data = {
    "lat": 0.0,
    "lng": 0.0,
    "hdop": 99.99,
    "moves_left": 10,
    "last_update": datetime.now().isoformat()
}
raw_serial_logs = []
osd_text_logs = []

SERIAL_PORT = os.getenv("SERIAL_PORT", "COM3")
BAUD_RATE = 115200

# --- Serial thread management: supports hot-switching COM ports at runtime ---
_serial_stop_event = threading.Event()
_serial_thread: threading.Thread | None = None
_active_port: str = SERIAL_PORT
_port_connected: bool = False

def read_serial(port: str, stop_event: threading.Event):
    """Read ESP-NOW serial stream until stop_event is set."""
    global gps_data, _port_connected
    try:
        ser = serial.Serial(port, BAUD_RATE, timeout=1)
        _port_connected = True
        print(f"[SERIAL] Connected to {port} @ {BAUD_RATE} baud")
        while not stop_event.is_set():
            if ser.in_waiting:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if not line:
                    continue
                
                timestamp = datetime.now().strftime("%H:%M:%S")
                raw_serial_logs.append(f"[{timestamp}] {line}")
                if len(raw_serial_logs) > 100:
                    raw_serial_logs.pop(0)

                # Parsing logic for new format
                try:
                    if "Latitude :" in line:
                        gps_data["lat"] = float(line.split("Latitude :")[1].strip())
                    elif "Longitude:" in line:
                        gps_data["lng"] = float(line.split("Longitude:")[1].strip())
                    elif "Moves Left:" in line:
                        gps_data["moves_left"] = int(line.split("Moves Left:")[1].strip())
                    elif "HDOP:" in line:
                        gps_data["hdop"] = float(line.split("HDOP:")[1].strip())
                    
                    # Legacy fallback
                    elif "Lat:" in line:
                        gps_data["lat"] = float(line.split("Lat:")[1].split()[0])
                    elif "Lng:" in line:
                        gps_data["lng"] = float(line.split("Lng:")[1].split()[0])
                        
                    gps_data["last_update"] = datetime.now().isoformat()
                except (ValueError, IndexError):
                    continue
        ser.close()
        print(f"[SERIAL] Disconnected from {port}")
    except Exception as e:
        print(f"[SERIAL] Error on {port}: {e}")
    finally:
        _port_connected = False

def start_serial_thread(port: str):
    """Stop running serial thread and start a fresh one on `port`."""
    global _serial_stop_event, _serial_thread, _active_port, _port_connected
    _serial_stop_event.set()
    if _serial_thread and _serial_thread.is_alive():
        _serial_thread.join(timeout=3)
    _port_connected = False
    _serial_stop_event = threading.Event()
    _active_port = port
    _serial_thread = threading.Thread(
        target=read_serial, args=(port, _serial_stop_event), daemon=True
    )
    _serial_thread.start()

# Auto-start on the configured port at startup
start_serial_thread(SERIAL_PORT)

# --- COM Port API endpoints ---

@app.get("/list-ports")
async def list_ports():
    """Return all available serial/COM ports detected on this machine."""
    ports = serial.tools.list_ports.comports()
    return [
        {
            "port": p.device,
            "description": p.description,
            "hwid": p.hwid,
            "active": p.device == _active_port
        }
        for p in sorted(ports, key=lambda x: x.device)
    ]

class SetPortRequest(BaseModel):
    port: str

@app.post("/set-port")
async def set_port(request: SetPortRequest):
    """Switch the active serial port. Restarts the serial reader thread."""
    if not request.port:
        raise HTTPException(status_code=400, detail="Port name is required")
    start_serial_thread(request.port)
    return {
        "status": "connecting",
        "port": request.port,
        "message": f"Serial reader switching to {request.port}"
    }

@app.get("/port-status")
async def port_status():
    """Return current active port and whether it is connected."""
    return {
        "active_port": _active_port,
        "connected": _port_connected
    }

@app.get("/gps")
async def get_gps():
    return gps_data

@app.get("/serial-logs")
async def get_serial_logs():
    return {"logs": raw_serial_logs}

@app.get("/feed-osd-logs")
async def get_feed_osd_logs():
    """Return the latest OSD text lines extracted from the video feed via OCR."""
    return {"logs": osd_text_logs}

@app.get("/", response_class=HTMLResponse)
async def read_dashboard(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    sources: list[str]
    session_id: str

CHAT_HISTORY_FILE = os.path.join(PROJ_ROOT, "Data", "storage", "chat_history.json")

def load_chat_history() -> dict:
    if os.path.exists(CHAT_HISTORY_FILE):
        try:
            with open(CHAT_HISTORY_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_chat_history(history: dict):
    os.makedirs(os.path.dirname(CHAT_HISTORY_FILE), exist_ok=True)
    with open(CHAT_HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4)

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    session_id = request.session_id or str(uuid.uuid4())
    history_db = load_chat_history()
    
    if session_id not in history_db:
        history_db[session_id] = {
            "id": session_id,
            "created_at": datetime.now().isoformat(),
            "messages": []
        }
    
    session = history_db[session_id]
    
    try:
        # Pass conversation context to RAG
        result = query_rag(request.message, history=session["messages"])
        
        # Save context
        session["messages"].append({
            "role": "user", 
            "content": request.message, 
            "timestamp": datetime.now().isoformat()
        })
        session["messages"].append({
            "role": "assistant", 
            "content": result["answer"], 
            "timestamp": datetime.now().isoformat()
        })
        save_chat_history(history_db)
        
        return ChatResponse(
            answer=result["answer"], 
            sources=result["sources"],
            session_id=session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/sessions")
async def get_sessions():
    db = load_chat_history()
    sessions = []
    for sid, session_data in db.items():
        title = "New Chat"
        if session_data.get("messages"):
            first_user_msg = next((msg["content"] for msg in session_data["messages"] if msg["role"] == "user"), "New Chat")
            title = first_user_msg[:30] + "..." if len(first_user_msg) > 30 else first_user_msg
            
        sessions.append({
            "id": sid,
            "title": title,
            "created_at": session_data.get("created_at")
        })
    return sorted(sessions, key=lambda x: x["created_at"], reverse=True)

@app.get("/chat/sessions/{session_id}")
async def get_session(session_id: str):
    db = load_chat_history()
    if session_id not in db:
        raise HTTPException(status_code=404, detail="Session not found")
    return db[session_id]

@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.pdf', '.txt', '.csv')):
        raise HTTPException(status_code=400, detail="Only PDF, TXT, CSV allowed")
    
    # Ensure data/documents exists
    # Assuming data folder is in project root, which is two levels up from this file?
    # No, we used absolute/relative paths in rag_pipeline. 
    # Let's match rag_pipeline's expectation.
    # rag_pipeline expects "data/documents" relative to CWD.
    file_path = os.path.join(PROJ_ROOT, "Data", "storage", "documents", file.filename)
    
    # Ensure directory exists just in case
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    # Rebuild vector store
    # We clear the DB specifically if we want full rebuild, but Chroma append is better?
    # User's code did: os.system("rm -rf data/chroma_db/*")
    # We will do that to be safe as per user instructions for "small datasets"
    db_path = os.path.join(PROJ_ROOT, "Data", "storage", "chroma_db")
    if os.path.exists(db_path):
        shutil.rmtree(db_path)
        os.makedirs(db_path)

    reload_pipeline()
    
    return {"message": f"Uploaded {file.filename} and updated knowledge base"}

class TelemetryRequest(BaseModel):
    voltage: float

@app.post("/telemetry/battery")
async def get_battery_status(request: TelemetryRequest):
    """
    API to calculate battery percentage from voltage.
    24V = 100%, 18V = 0%
    """
    percentage = calculate_battery_percentage(request.voltage)
    return {
        "voltage": request.voltage,
        "percentage": percentage,
        "status": "Critical" if percentage < 20 else "Healthy"
    }

class DetectionRequest(BaseModel):
    image_base64: str  # Base64 encoded frame
    voltage: Optional[float] = None
    mission_id: Optional[str] = "default"
    model_name: Optional[str] = "WALDO30-Y8M"

@app.post("/analyze-feed")
async def analyze_feed(request: DetectionRequest):
    """
    API to detect humans and process telemetry from the video feed.
    Also extracts OSD text from the frame via OCR.
    """
    try:
        # Extract image bytes from base64
        header, encoded = request.image_base64.split(",", 1) if "," in request.image_base64 else (None, request.image_base64)
        image_bytes = base64.b64decode(encoded)
        
        # Human detection (now extracts voltage from the feed)
        detection_result = detect_humans(image_bytes, mission_id=request.mission_id or "default", model_name=request.model_name or "WALDO30-Y8M")
        
        # Extracted telemetry from the feed
        battery_data = {
            "voltage": detection_result.get("voltage"),
            "percentage": detection_result.get("percentage")
        }

        # --- OSD Text Extraction via OCR ---
        osd_lines = []
        try:
            import numpy as np_osd
            import cv2 as cv2_osd
            nparr = np_osd.frombuffer(image_bytes, np_osd.uint8)
            frame = cv2_osd.imdecode(nparr, cv2_osd.IMREAD_COLOR)
            if frame is not None:
                osd_lines = extract_osd_text(frame)
        except Exception as osd_err:
            osd_lines = [f"[OSD ERROR] {str(osd_err)}"]

        if osd_lines:
            timestamp = datetime.now().strftime("%H:%M:%S")
            for line in osd_lines:
                osd_text_logs.append(f"[{timestamp}] {line}")
            # Keep last 200 entries
            while len(osd_text_logs) > 200:
                osd_text_logs.pop(0)
            
        return {
            "detections": detection_result,
            "telemetry": battery_data,
            "osd_text": osd_lines,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Analysis failed: {str(e)}")

@app.get("/list-detections/{mission_id}")
async def list_detections(mission_id: str):
    """
    List all detected human images for a specific mission.
    """
    path = os.path.join(DETECTIONS_DIR, mission_id)
    if not os.path.exists(path):
        return []
    
    files = [f for f in os.listdir(path) if f.endswith(('.jpg', '.jpeg', '.png'))]
    # Sort by creation time (newest first)
    files.sort(key=lambda x: os.path.getmtime(os.path.join(path, x)), reverse=True)
    
    # Return full URLs
    return [{"filename": f, "url": f"/detections/{mission_id}/{f}"} for f in files]

@app.get("/list-missions-with-detections")
async def list_missions_with_detections():
    """
    List all missions that have at least one captured image.
    """
    if not os.path.exists(DETECTIONS_DIR):
        return []
    
    missions = []
    for d in os.listdir(DETECTIONS_DIR):
        if os.path.isdir(os.path.join(DETECTIONS_DIR, d)):
            # Count files
            files = os.listdir(os.path.join(DETECTIONS_DIR, d))
            img_count = len([f for f in files if f.endswith(('.jpg', '.jpeg', '.png'))])
            if img_count > 0:
                missions.append({
                    "id": d,
                    "count": img_count
                })
    return missions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
