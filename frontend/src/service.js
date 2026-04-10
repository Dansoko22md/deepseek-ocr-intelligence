const DEFAULT_BASE_URL =
  (typeof window !== "undefined" &&
    window.localStorage.getItem("ocr_api_base_url")) ||
  "http://localhost:8000";

export class OcrApi {
  constructor(baseUrl = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async uploadImage(file) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${this.baseUrl}/ocr`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      throw new Error((await res.text()) || `HTTP ${res.status}`);
    }
    const data = await res.json();
    if (typeof data.text !== "string") {
      const text = data.ocr_text || data.result || "";
      return { text };
    }
    return data;
  }

  async cleanAndStructure(text) {
    const res = await fetch(`${this.baseUrl}/clean-structure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      throw new Error((await res.text()) || `HTTP ${res.status}`);
    }
    const data = await res.json();
    const cleaned_text = data.cleaned_text || data.cleanedText || data.text || text;
    
    // Correction ajoutée ici : on vérifie data.result en priorité
    const structured = data.result || data.structured || data.json || data.data || null;
    
    return { cleaned_text, structured };
  }

  // Cette méthode est gardée au cas où tu en aurais besoin ailleurs, 
  // mais main.js utilise maintenant les deux méthodes ci-dessus séparément.
  async process(file) {
    const { text } = await this.uploadImage(file);
    try {
      const { cleaned_text, structured } = await this.cleanAndStructure(text);
      return { ocrText: cleaned_text, structured };
    } catch {
      return { ocrText: text, structured: null };
    }
  }
}