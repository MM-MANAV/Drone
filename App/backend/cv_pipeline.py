from typing import Dict, Any, Optional
import os
from datetime import datetime
import re
import cv2
import numpy as np

# YOLOv8 for high-accuracy human detection
# Upgrading to 'Small' model for better accuracy in room environments
try:
    from ultralytics import YOLO
    # Using 's' (small) instead of 'n' (nano) for significantly better detection
    # Updated paths to point to the new 'Data/models' directory
    # Current file is in App/backend/
    SERVER_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # This is App/
    PROJ_ROOT = os.path.dirname(SERVER_DIR) # This is project root
    model = YOLO(os.path.join(PROJ_ROOT, 'Data', 'models', 'WALDO30-Y8M.pt')) 
    model_basic = YOLO(os.path.join(PROJ_ROOT, 'Data', 'models', 'yolov8m.pt'))
    model_version3 = YOLO(os.path.join(PROJ_ROOT, 'Data', 'models', 'version3.pt'))
except ImportError:
    model = None
    model_basic = None
    model_version3 = None

# Optional: Tesseract for voltage extraction
try:
    import pytesseract
except ImportError:
    pytesseract = None

# Cache with a default starting state (e.g., full battery 25.2V)
# We use a slow discharge simulation if real OCR data isn't available
_last_voltage = 25.2

def calculate_battery_percentage(voltage: float) -> float:
    """
    Calculate battery percentage based on voltage.
    Formula: Percent = (V-18)/7.2 * 100
    Range: 18V (0%) to 25.2V (100%)
    Returns exact float value.
    """
    if voltage is None:
        return 0.0
    if voltage >= 25.2:
        return 100.0
    if voltage <= 18.0:
        return 0.0
    
    # Precise formula: Percent = (V-18)/7.2 * 100
    percentage = (voltage - 18.0) / 7.2 * 100.0
    return round(percentage, 2)

def extract_telemetry(frame: np.ndarray) -> Dict[str, Any]:
    """
    Extract voltage and GPS from the OSD.
    Returns a dict with voltage, lat, and lon.
    """
    global _last_voltage
    data = {"voltage": _last_voltage, "lat": None, "lon": None}
    
    if pytesseract is None:
        # Simulation: Slow discharge
        if _last_voltage > 18.2:
            _last_voltage -= 0.005 # Slower for more "realism"
        data["voltage"] = round(_last_voltage, 2)
        return data

    try:
        # 1. Voltage ROI (Top Left)
        h, w = frame.shape[:2]
        v_roi = frame[0:int(h*0.15), 0:int(w*0.30)]
        
        # 2. GPS ROI (Bottom area)
        gps_roi = frame[int(h*0.75):h, 0:w]
        
        # Helper for OCR
        def get_text(img, config):
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            gray = cv2.resize(gray, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
            thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
            return pytesseract.image_to_string(thresh, config=config)

        # Voltage OCR
        v_config = r'--oem 3 --psm 7 -c tessedit_char_whitelist=0123456789.V'
        v_text = get_text(v_roi, v_config)
        v_match = re.search(r'(\d{1,2}\.\d{1,2})', v_text)
        if v_match:
            v_val = float(v_match.group(1))
            if 10.0 <= v_val <= 26.0:
                _last_voltage = v_val
                data["voltage"] = v_val

        # GPS OCR (Look for Lat/Lon patterns)
        gps_config = r'--oem 3 --psm 11' # Sparse text
        gps_text = get_text(gps_roi, gps_config)
        
        # Pattern: Lat 19.2282 Lon 72.8639 or similar
        lat_match = re.search(r'Lat\s*[:]?\s*(-?\d{1,3}\.\d+)', gps_text, re.I)
        lon_match = re.search(r'L[on|ng]\s*[:]?\s*(-?\d{1,3}\.\d+)', gps_text, re.I)
        
        if lat_match: data["lat"] = float(lat_match.group(1))
        if lon_match: data["lon"] = float(lon_match.group(1))

    except Exception:
        pass
        
    # Safety discharge if OCR missed
    if data["voltage"] == _last_voltage and _last_voltage > 18.2:
        _last_voltage -= 0.005
        data["voltage"] = round(_last_voltage, 2)
        
    return data

def extract_osd_text(frame: np.ndarray) -> list[str]:
    """
    Extract ALL visible text from the drone camera feed OSD using OCR.
    Returns a list of non-empty text lines found in the frame.
    Falls back to telemetry-derived text if pytesseract is unavailable.
    """
    lines: list[str] = []

    if pytesseract is not None:
        try:
            h, w = frame.shape[:2]

            # --- Strategy: Process multiple ROIs for best results ---
            rois = [
                ("TOP",    frame[0:int(h*0.15), :]),           # Top bar (status, ARMED/DISARMED)
                ("BOTTOM", frame[int(h*0.75):h, :]),           # Bottom bar (ALT, VEL, BATT, COORDS)
                ("MID",    frame[int(h*0.30):int(h*0.60), int(w*0.25):int(w*0.75)]),  # Center (DISARMED text)
            ]

            for label, roi in rois:
                if roi.size == 0:
                    continue
                # Preprocess: grayscale → upscale → adaptive threshold (white text on dark bg)
                gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
                gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

                # For white text on dark background, invert
                _, thresh_inv = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)
                _, thresh_norm = cv2.threshold(gray, 80, 255, cv2.THRESH_BINARY_INV)

                for thresh in [thresh_inv, thresh_norm]:
                    config = r'--oem 3 --psm 6'
                    text = pytesseract.image_to_string(thresh, config=config)
                    for line in text.strip().split('\n'):
                        cleaned = line.strip()
                        # Filter: keep lines with meaningful content (>= 2 chars, not all special chars)
                        if len(cleaned) >= 2 and any(c.isalnum() for c in cleaned):
                            if cleaned not in lines:
                                lines.append(cleaned)

            return lines if lines else ["[OCR] No text detected in frame"]

        except Exception as e:
            return [f"[OCR ERROR] {str(e)}"]

    # --- Fallback: Synthesize OSD text from extract_telemetry data ---
    try:
        telem = extract_telemetry(frame)
        voltage = telem.get("voltage", 0)
        percentage = calculate_battery_percentage(voltage)
        lat = telem.get("lat")
        lon = telem.get("lon")

        lines.append(f"ALT: ---  VEL: ---  BATT: {percentage:.1f}% ({voltage:.2f}V)")
        if lat is not None and lon is not None:
            lines.append(f"COORDS: {lat:.4f}° N, {lon:.4f}° W")
        else:
            lines.append("COORDS: 0.0000° N, 0.0000° W")
        lines.append("[FALLBACK] pytesseract not installed — showing extracted telemetry only")
    except Exception:
        lines.append("[FALLBACK] Unable to extract OSD data")

    return lines

def detect_humans(frame_bytes: bytes, mission_id: str = "default", model_name: str = "WALDO30-Y8M") -> Dict[str, Any]:
    """
    Detect humans in a frame using YOLOv8 Small.
    Returns detection count and metadata.
    """
    # Decode image
    nparr = np.frombuffer(frame_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if frame is None:
        return {"human_count": 0, "status": "error", "message": "Invalid image data"}

    # Extract Telemetry from Feed
    telemetry_data = extract_telemetry(frame)
    voltage = telemetry_data["voltage"]
    percentage = calculate_battery_percentage(voltage)
    gps_lat = telemetry_data["lat"]
    gps_lon = telemetry_data["lon"]

    human_count = 0
    detections = []
    
    # Select active model
    if model_name == "WALDO30-Y8M":
        active_model = model
    elif model_name == "version3":
        active_model = model_version3
    else:
        active_model = model_basic

    if active_model:
        # WALDO30-Y8M: try class 1 first (person in WALDO labeling),
        # fall back to class 0 if no detections (in case COCO-style indexing).
        # Standard COCO yolov8: class 0 = person.
        # Confidence lowered to 0.35 to detect humans in difficult aerial conditions.
        if model_name == "WALDO30-Y8M":
            results = active_model.predict(source=frame, classes=[1], conf=0.35, imgsz=640, verbose=False)
            if len(results) > 0 and len(results[0].boxes) == 0:
                # Fallback: WALDO may use class 0 for person
                results = active_model.predict(source=frame, classes=[0], conf=0.35, imgsz=640, verbose=False)
        elif model_name == "version3":
            results = active_model.predict(source=frame, classes=[0], conf=0.35, imgsz=640, verbose=False)
        else:
            results = active_model.predict(source=frame, classes=[0], conf=0.35, imgsz=640, verbose=False)

        if len(results) > 0:
            boxes = results[0].boxes
            human_count = len(boxes)
            
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                detections.append({
                    "x": int(x1),
                    "y": int(y1),
                    "w": int(x2 - x1),
                    "h": int(y2 - y1),
                    "conf": round(float(box.conf[0]), 2)
                })

    # Save image with boxes if humans are detected for visual confirmation
    if human_count > 0:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        # Save to the same directory the backend mounts at /detections
        PROJ_ROOT_CV = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        save_dir = os.path.join(PROJ_ROOT_CV, "Data", "storage", "detections", mission_id)
        os.makedirs(save_dir, exist_ok=True)
        filename = f"human_detected_{timestamp}.jpg"
        filepath = os.path.join(save_dir, filename)
        
        save_frame = frame.copy()
        for d in detections:
            cv2.rectangle(save_frame, (d['x'], d['y']), (d['x'] + d['w'], d['y'] + d['h']), (0, 255, 0), 2)
            cv2.putText(save_frame, f"Person {d['conf']}", (d['x'], d['y'] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        cv2.imwrite(filepath, save_frame)
        saved_path = filepath
    else:
        saved_path = None

    return {
        "human_count": human_count,
        "status": "success",
        "saved_image": saved_path,
        "voltage": voltage,
        "percentage": percentage,
        "lat": gps_lat,
        "lon": gps_lon,
        "detections": detections
    }
