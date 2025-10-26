from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
import os
import openai
from dotenv import load_dotenv
from PIL import Image
import pytesseract
import io
import base64

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter()

pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_PATH")

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

@router.post("/translate-image")
async def translate_image(
    file: UploadFile = File(...),
    target_lang: str = Form(...),
    context: str = Form("neutral")
):
    try:
        image_data = await file.read()
        
        image = Image.open(io.BytesIO(image_data))
        
        extracted_text = pytesseract.image_to_string(image, lang='eng')
        
        if not extracted_text.strip():
            return {"error": "No text found in the image"}
        
        prompt = f"Translate this into {target_lang} with {context} tone:\n{extracted_text.strip()}"
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5
        )
        translation = response.choices[0].message.content.strip()
        
        return {
            "extracted_text": extracted_text.strip(),
            "translation": translation
        }
        
    except Exception as e:
        return {"error": f"Failed to process image: {str(e)}"}
