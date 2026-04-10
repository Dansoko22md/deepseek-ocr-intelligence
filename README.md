# deepseek-ocr-intelligence

![Demo](demo.gif)

An intelligent OCR system powered by DeepSeek models that extracts, understands, and structures text from images and documents. The system combines Optical Character Recognition (OCR) with Large Language Models (LLMs) to deliver clean, structured, and actionable data.

## 🎯 Project concept

👉 **Intelligent pipeline:**
`Image` → `OCR` → `Text` → `DeepSeek` → `Structured Output`

## 🧠 Models used

- **Hugging Face** (platform)
- **DeepSeek AI**
- **Model:** `deepseek-ai/deepseek-coder-1.3b-instruct` (free)
- **Role:**
  - Clean OCR text
  - Correct recognition errors
  - Structure data into JSON format

## 🧱 Architecture

- `backend/` : FastAPI, Tesseract OCR, Hugging Face integration
- `frontend/` : Vanilla JS, API service, upload UI

## ⚙️ Tech stack

- **Python** (FastAPI)
- **Tesseract OCR** (pytesseract)
- **Hugging Face Transformers**
- **DeepSeek Coder 1.3B**
- **Frontend** (JS/HTML/CSS)

## 🔥 Features

1. **OCR Extraction**: Image → Raw text
2. **Intelligent cleaning (DeepSeek)**: Automatic correction (e.g. "Totl: 12O.OO USD" → "Total: 120.00 USD")
3. **JSON structuring**: Automatic extraction of key fields
4. **Document types**: Invoices, receipts, scanned documents

## 🚀 Technical pipeline

### 📌 1. OCR (pytesseract)
```python
import pytesseract
from PIL import Image

text = pytesseract.image_to_string(Image.open("receipt.png"))
```

### 📌 2. DeepSeek via Hugging Face
```python
from transformers import AutoTokenizer, AutoModelForCausalLM

model_name = "deepseek-ai/deepseek-coder-1.3b-instruct"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

prompt = f"Clean and structure this OCR text into JSON:\n{text}"
inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=200)

result = tokenizer.decode(outputs[0])
```

## 🖥️ Frontend (Usage)

The frontend is located in the `/frontend` folder. It allows you to upload an image and see in real time the raw extraction and the JSON result.

1. Start the backend (see below)
2. Open `frontend/index.html` (via Live Server or `py -m http.server 5500`)
3. Configure the API base URL if needed (default: `http://localhost:8000`)

## 🛠️ Installation & setup

### Backend
1. Install dependencies:
```bash
    cd backend
    pip install -r requirements.txt
```
2. Start the API:
```bash
    uvicorn api.main:app --reload
```
3. Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend
```bash
cd frontend
py -m http.server 5500
```
Open [http://localhost:5500](http://localhost:5500)

---
🚀 **AI Engineer / Data Engineer project** — OCR + LLM (DeepSeek + Hugging Face)