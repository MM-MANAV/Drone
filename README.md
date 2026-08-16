# Trinetra Drone Dashboard

## Trinetra Drone Architecture21`

![Trinetra Drone RAG Architecture](assets/Architecture.png)

This is the dashboard for the Trinetra Drone project.

## Features
- Real-time flight telemetry
- Live camera feed
- Sensor data visualization
- Chatbot integration (Offline RAG)

## Running
Use `uv run uvicorn src.app.main:app --reload` to start the server.

## RAG Chatbot Setup (Offline)
The dashboard now includes a local RAG (Retrieval-Augmented Generation) chatbot.

### Prerequisites
1. **Install Ollama**: Download from [ollama.com](https://ollama.com).
2. **Pull the Model**: Run the following command in your terminal:
   ```bash
   ollama run llama3.2:1b
   ```
   *Note: You can change the model in `src/app/rag_pipeline.py` if needed.*

### Knowledge Base
- **Documents**: Place your PDF, TXT, or CSV files in the `data/documents/` folder.
- **Upload**: You can also upload files via the API endpoint `/upload-document`.
- **Initialization**: The system initializes the vector store on startup using `sentence-transformers` (all-MiniLM-L6-v2).

uv run uvicorn src.app.main:app --host 0.0.0.0 --port 8000 --reload# Drone_Dashboard
