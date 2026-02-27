# contextos

# Terminal 1 — Backend
cd /workspaces/contextos/apps/api
source venv/bin/activate
ollama serve &
python -m uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd /workspaces/contextos/apps/web
npm run dev
