from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from ocr.ocr_engine import OCREngine
from llm.deepseek_llm import DeepSeekLLM

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. Change this for production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ocr_engine = OCREngine()
deepseek_llm = DeepSeekLLM()

@app.post("/ocr")
async def process_ocr(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    text = ocr_engine.extract_text(temp_path)
    os.remove(temp_path)
    return {"text": text}

@app.post("/clean-structure")
async def clean_and_structure(payload: dict):
    text = payload.get("text", "")
    llm_output = deepseek_llm.clean_and_structure(text)
    
    # Simple JSON extraction logic for the demonstration
    # In a real app, you'd want something more robust
    import json
    import re
    
    # Try to find JSON block in the output
    json_match = re.search(r'\{.*\}', llm_output, re.DOTALL)
    structured_data = None
    if json_match:
        try:
            structured_data = json.loads(json_match.group(0))
        except:
            pass
            
    return {
        "cleaned_text": llm_output,
        "structured": structured_data
    }
