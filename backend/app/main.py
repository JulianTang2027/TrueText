from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.translate import router as translate_router

app = FastAPI(title="Contextual Translator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for MVP, allow all
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(translate_router)
