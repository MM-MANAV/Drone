# Trinetra Drone Dashboard — Run Guide

Complete step-by-step instructions to run the backend API server and frontend GUI from CMD.

---

## Prerequisites

Make sure the following are installed before proceeding:

| Tool | Purpose | Install |
|------|---------|---------|
| Python >= 3.9 | Backend runtime | https://python.org |
| `uv` | Python package manager | `pip install uv` |
| Node.js >= 18 | Frontend runtime | https://nodejs.org |
| npm | Frontend package manager | Comes with Node.js |
| Ollama (optional) | Local RAG chatbot | https://ollama.com |

---

## Project Structure

```
C:\Users\manav\OneDrive\Desktop\Drone Disaster GUI Final\Drone\Disaster\
│
├── App\
│   ├── backend\
│   │   ├── cv_pipeline.py   ← Computer Vision pipeline (human detection, telemetry)
│   │   ├── main.py          ← FastAPI backend (COM port + API)
│   │   └── rag_pipeline.py  ← Local RAG chatbot pipeline
│   └── frontend\            ← Next.js frontend (GUI)
├── Data\                    ← Storage for documents, detections, and vector store
├── Setup\                   ← Environment & model setup scripts
├── pyproject.toml           ← Python project config
├── requirements.txt         ← Python dependencies
├── README.md                ← Project overview
└── self_readme.md           ← This file
```

---

## Step 1 — Open CMD and Navigate to Project Root

```cmd
cd "C:\Users\manav\OneDrive\Desktop\Drone Disaster GUI Final\Drone\Disaster"
```

---

## Step 2 — Start the Backend (FastAPI + Serial/COM Port)

### Default (port 8000, COM3):

```cmd
uv run uvicorn App.backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### On a custom backend port (e.g., port 8080):

```cmd
uv run uvicorn App.backend.main:app --host 0.0.0.0 --port 8080 --reload
```

> **Note:** If you change the backend port, you must also update the frontend proxy config.  
> Open `App\frontend\next.config.mjs` and change `http://localhost:8000` to `http://localhost:8080`.

### Change the Serial/COM Port (ESP-NOW telemetry input):

The backend reads from `COM3` by default. To use a different COM port, set the environment variable before running:

```cmd
set SERIAL_PORT=COM5
uv run uvicorn App.backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Replace `COM5` with your actual COM port (check Device Manager → Ports).

---

## Step 3 — Start the Frontend GUI (Next.js)

Open a **second CMD window** and run:

```cmd
cd "C:\Users\manav\OneDrive\Desktop\Drone Disaster GUI Final\Drone\Disaster\App\frontend"
npm run dev
```

The dashboard will be available at: **http://localhost:3000**

### Run Frontend on a Custom Port (e.g., 3001):

```cmd
cd "C:\Users\manav\OneDrive\Desktop\Drone Disaster GUI Final\Drone\Disaster\App\frontend"
npm run dev -- --port 3001
```

---

## Step 4 — (Optional) Start Ollama for RAG Chatbot

Open a **third CMD window** and run:

```cmd
ollama run llama3.2:1b
```

The chatbot inside the dashboard will use this local LLM to answer questions based on documents placed in `Data\storage\documents\`.

---

## Quick Reference — All Commands

### Terminal 1 (Backend):
```cmd
cd "C:\Users\manav\OneDrive\Desktop\Drone Disaster GUI Final\Drone\Disaster"
set SERIAL_PORT=COM3
uv run uvicorn App.backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2 (Frontend GUI):
```cmd
cd "C:\Users\manav\OneDrive\Desktop\Drone Disaster GUI Final\Drone\Disaster\App\frontend"
npm run dev
```

### Terminal 3 (Ollama — optional):
```cmd
ollama run llama3.2:1b
```

---

## Default Ports Summary

| Service | Default URL | How to Change |
|---------|-------------|---------------|
| Backend API | http://localhost:8000 | `--port <number>` in uvicorn command |
| Frontend GUI | http://localhost:3000 | `-- --port <number>` in npm run dev |
| Ollama LLM | http://localhost:11434 | Ollama config (optional) |

---

## Useful API Endpoints (Backend)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/gps` | GET | Live GPS data from COM port |
| `/list-ports` | GET | Available COM ports |
| `/set-port` | POST | Switch active COM port |
| `/port-status` | GET | Current COM port status |
| `/telemetry/battery` | POST | Calculate battery percentage from voltage |
| `/analyze-feed` | POST | Human detection on video frame |
| `/list-detections/{mission_id}` | GET | Captured human detection images |
| `/list-missions-with-detections` | GET | All missions with captured data |
| `/chat` | POST | RAG chatbot query |
| `/upload-document` | POST | Add document to knowledge base |
| `/docs` | GET | Auto-generated Swagger API docs |

---

## Troubleshooting

**Backend fails to start:**
- Make sure `uv` is installed: `pip install uv`
- Make sure you're in the project root (`C:\Users\manav\OneDrive\Desktop\Drone Disaster GUI Final\Drone\Disaster`)
- Ensure the module import is specified as `App.backend.main:app`

**Serial/COM port error:**
- Check Device Manager for the correct port name
- Set `set SERIAL_PORT=COMx` before running the backend
- The backend will still run without a COM port; GPS data just stays at 0.0

**Frontend not connecting to backend:**
- Make sure the backend is running first on port 8000
- If you changed the backend port, update `App\frontend\next.config.mjs`

**`npm run dev` fails:**
- Run `npm install` inside the `App\frontend\` folder first:
  ```cmd
  cd "C:\Users\manav\OneDrive\Desktop\Drone Disaster GUI Final\Drone\Disaster\App\frontend"
  npm install
  npm run dev
  ```
