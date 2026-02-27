from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import capture, search

app = FastAPI(
    title="ContextOS API",
    description="Personal context engine backend",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(capture.router)
app.include_router(search.router)

@app.get("/")
async def root():
    return {"status": "ContextOS API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "0.1.0"}
