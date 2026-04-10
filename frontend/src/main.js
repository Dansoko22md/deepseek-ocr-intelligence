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
    const { ocrText: text, structured } = await api.process(file);
    ocrText.value = text || "";
    jsonOut.value = structured ? JSON.stringify(structured, null, 2) : "";
  } catch (e) {
    ocrText.value = `Erreur de traitement: ${e?.message || e}`;
  } finally {
    setBusy(false);
  }
});

init();
