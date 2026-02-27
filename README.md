# contextos

cd apps/api
source venv/bin/activate
ollama serve &
python -m uvicorn main:app --reload --port 8000
