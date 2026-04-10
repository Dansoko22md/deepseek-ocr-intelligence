import pytesseract
from PIL import Image
from typing import Optional
import os
import sys

class OCREngine:
    def __init__(self, lang: str = 'eng'):
        self.lang = lang
        self._setup_tesseract()

    def _setup_tesseract(self):
        # On Windows, pytesseract needs to know the path to the tesseract executable
        if sys.platform == 'win32':
            # Check for standard installation paths
            username = os.environ.get('USERNAME') or os.environ.get('USER') or 'User'
            standard_paths = [
                r'C:\Program Files\Tesseract-OCR\tesseract.exe',
                fr'C:\Users\{username}\AppData\Local\Tesseract-OCR\tesseract.exe',
                r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
                r'C:\Tesseract-OCR\tesseract.exe', # Some custom installs
            ]
            
            # Also check environment variable
            env_path = os.getenv('TESSERACT_PATH')
            if env_path:
                standard_paths.insert(0, env_path)

            for path in standard_paths:
                if os.path.exists(path):
                    pytesseract.pytesseract.tesseract_cmd = path
                    print(f"DEBUG: Tesseract found and set to: {path}")
                    return
            
            print("Warning: Tesseract not found in standard Windows paths.")
            print(f"DEBUG: Checked paths: {standard_paths}")
            print("Please install Tesseract-OCR and add it to your PATH or set TESSERACT_PATH env var.")

    def extract_text(self, image_path: str, lang: Optional[str] = None) -> str:
        lang = lang or self.lang
        
        # If tesseract is not found, return a mock message instead of crashing
        if sys.platform == 'win32' and not pytesseract.pytesseract.tesseract_cmd:
            return f"[MOCK OCR] Tesseract not found. File: {os.path.basename(image_path)}. Please install Tesseract-OCR."
            
        try:
            image = Image.open(image_path)
            return pytesseract.image_to_string(image, lang=lang)
        except Exception as e:
            if "tesseract" in str(e).lower():
                return f"[ERROR OCR] Tesseract error: {str(e)}. Ensure it's installed."
            raise e
