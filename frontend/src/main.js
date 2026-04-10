import { OcrApi } from "./service.js";

const api = new OcrApi();

const $ = (sel) => document.querySelector(sel);
const fileInput = $("#file");
const processBtn = $("#process");
const ocrText = $("#ocr-text");
const jsonOut = $("#json");
const baseUrlInput = $("#base-url");

function setBusy(busy) {
  processBtn.toggleAttribute("disabled", busy);
  processBtn.textContent = busy ? "Traitement..." : "Upload & Process";
}

function init() {
  const saved = window.localStorage.getItem("ocr_api_base_url");
  if (saved) {
    baseUrlInput.value = saved;
    api.baseUrl = saved;
  } else {
    baseUrlInput.value = api.baseUrl;
  }
}

$("#save-base")?.addEventListener("click", () => {
  const v = baseUrlInput.value.trim().replace(/\/+$/, "");
  window.localStorage.setItem("ocr_api_base_url", v);
  api.baseUrl = v;
});

processBtn.addEventListener("click", async () => {
  ocrText.value = "";
  jsonOut.value = "";
  const file = fileInput.files?.[0];
  
  if (!file) {
    ocrText.value = "Veuillez choisir un fichier";
    return;
  }
  
  setBusy(true);
  
  try {
    // Étape 1 : OCR (Rapide)
    ocrText.value = "Extraction du texte en cours (rapide)...";
    const { text } = await api.uploadImage(file);
    
    // Affichage immédiat du texte brut
    ocrText.value = text || "";
    jsonOut.value = "Analyse IA en cours pour structurer le JSON (cela peut prendre 10 à 20 secondes)...";

    // Étape 2 : Structuration (Lente)
    const { cleaned_text, structured } = await api.cleanAndStructure(text);
    
    // Affichage final
    ocrText.value = cleaned_text || text;
    jsonOut.value = structured ? JSON.stringify(structured, null, 2) : "Aucun JSON généré.";
    
  } catch (e) {
    // Gestion des erreurs
    ocrText.value = `Erreur de traitement: ${e?.message || e}`;
    
    // Si l'erreur survient pendant l'étape 2
    if (jsonOut.value.includes("Analyse IA en cours")) {
      jsonOut.value = "Erreur lors de la structuration du JSON.";
    }
  } finally {
    setBusy(false);
  }
});

init();