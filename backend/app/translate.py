from fastapi import APIRouter
from pydantic import BaseModel
import os
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter()

class TranslationRequest(BaseModel):
    text: str
    target_lang: str
    context: str = "neutral"

@router.post("/translate")

def translate(req: TranslationRequest):
    prompt = f"Translate this into {req.target_lang} with {req.context} tone:\n{req.text}"
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )
    translation = response.choices[0].message.content.strip()
    return {"translation": translation}
