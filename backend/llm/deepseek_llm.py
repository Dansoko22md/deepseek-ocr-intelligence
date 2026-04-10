from transformers import AutoTokenizer, AutoModelForCausalLM
from typing import Dict

class DeepSeekLLM:
    def __init__(self, model_name: str = "deepseek-ai/deepseek-coder-1.3b-instruct"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)

    def clean_and_structure(self, text: str) -> str:
        prompt = f"""
Clean and structure this OCR text into JSON:
{text}
"""
        inputs = self.tokenizer(prompt, return_tensors="pt")
        outputs = self.model.generate(**inputs, max_new_tokens=200)
        result = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return result
