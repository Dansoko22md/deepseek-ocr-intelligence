import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState(null);
  const [ocrText, setOcrText]     = useState('');
  const [jsonResult, setJsonResult] = useState('');
  const [loading, setLoading]     = useState(false);
  const [phase, setPhase]         = useState('idle'); // idle | ocr | json | done
  const [copied, setCopied]       = useState('');
  const fileInputRef = useRef();

  const handleFileChange = (e) => applyFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    applyFile(e.dataTransfer.files[0]);
  };

  const applyFile = (f) => {
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPreview(null);
    setOcrText('');
    setJsonResult('');
    setPhase('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setOcrText('');
    setJsonResult('');
    setPhase('ocr');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const ocrRes = await axios.post('/ocr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setOcrText(ocrRes.data.text);
      setPhase('json');

      const cleanRes = await axios.post('/clean-structure', { text: ocrRes.data.text });
      const raw = cleanRes.data.result;
      setJsonResult(typeof raw === 'object' ? JSON.stringify(raw, null, 2) : raw);
      setPhase('done');
    } catch (err) {
      setOcrText('Error processing file.');
      setJsonResult('');
      setPhase('done');
    }
    setLoading(false);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 1500);
    });
  };

  const truncateName = (name) => name.length > 24 ? name.slice(0, 21) + '...' : name;

  const getOcrStep = (idx) => {
    if (phase === 'json' || phase === 'done') return 'done';
    if (phase === 'ocr') { if (idx === 0) return 'done'; if (idx === 1) return 'active'; }
    return 'pending';
  };

  const getJsonStep = (idx) => {
    if (phase === 'done') return 'done';
    if (phase === 'json') { if (idx === 0) return 'done'; if (idx === 1) return 'active'; }
    return 'pending';
  };

  const ocrProgress  = phase === 'ocr' ? 60 : (phase === 'json' || phase === 'done') ? 100 : 0;
  const jsonProgress = phase === 'json' ? 60 : phase === 'done' ? 100 : 0;

  return (
    <div className="page">
      <span className="badge"><span className="badge-dot" />AI-powered OCR</span>
      <h1>Extract &amp; structure<br />text from images</h1>
      <p className="sub">Upload an image — get clean text and JSON instantly</p>

      {/* Top row: dropzone + preview */}
      <div className="top-row">
        <div
          className={`dropzone${file ? ' has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" accept="image/*,.pdf" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
          <div className="up-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 16.5V19a1 1 0 001 1h14a1 1 0 001-1v-2.5M12 4v10m-4-4 4-4 4 4" />
            </svg>
          </div>
          <div className="up-label">Drop an image or click to browse</div>
          <div className="up-hint">PNG, JPG, WEBP, PDF — up to 20 MB</div>
          {file && (
            <div className="file-pill" onClick={(e) => e.stopPropagation()}>
              <span className="file-dot" />
              <span>{truncateName(file.name)}</span>
              <span className="file-clear" onClick={(e) => { e.stopPropagation(); resetAll(); }}>×</span>
            </div>
          )}
        </div>

        <div className={`preview-box ${loading ? 'is-processing' : ''}`}>
          {preview ? (
            <>
              <img 
                src={preview} 
                className={`preview-img ${loading ? 'dimmed' : ''}`} 
                alt="preview" 
              />
              <span className="preview-tag">Preview</span>
              
              {/* UI du Scanner animé */}
              {loading && (
                <div className="scanner-ui">
                  <div className="scanner-grid"></div>
                  <div className="scanner-beam"></div>
                  <div className="scanning-badge">
                    <span className="scanning-dot" />
                    {phase === 'ocr' ? 'Analyse OCR en cours...' : 'Structuration des données...'}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="preview-empty">
              <div className="preview-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <div className="preview-empty-label">Image preview</div>
            </div>
          )}
        </div>
      </div>

      <div className="btn-row">
        <button className="btn-main" onClick={handleUpload} disabled={loading || !file}>
          {loading && <span className="spinner" />}
          {loading ? 'Processing...' : 'Process image'}
        </button>
        {phase === 'done' && (
          <button className="btn-reset" onClick={resetAll}>Reset</button>
        )}
      </div>

      {phase !== 'idle' && (
        <div className="results-grid">
          {/* OCR */}
          <div className="r-card">
            <div className="r-prog"><div className="r-fill" style={{ width: `${ocrProgress}%` }} /></div>
            <div className="r-head">
              <div className="r-label">
                <span className="r-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F5E642" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 8h10M7 12h6M7 16h8" />
                  </svg>
                </span>
                OCR text
              </div>
              <button className="copy-btn" onClick={() => copyToClipboard(ocrText, 'ocr')}>
                {copied === 'ocr' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="step-row">
              {['Reading', 'Extracting', 'Done'].map((label, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="arr">›</span>}
                  <span className={`step ${getOcrStep(i)}`}>{label}</span>
                </React.Fragment>
              ))}
            </div>
            <div className="r-body">
              {ocrText
                ? <pre className="r-text">{ocrText}</pre>
                : <div className="empty">Output will appear here...</div>}
            </div>
          </div>

          {/* JSON */}
          <div className="r-card">
            <div className="r-prog"><div className="r-fill" style={{ width: `${jsonProgress}%` }} /></div>
            <div className="r-head">
              <div className="r-label">
                <span className="r-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F5E642" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" />
                  </svg>
                </span>
                Structured JSON
              </div>
              <button className="copy-btn" onClick={() => copyToClipboard(jsonResult, 'json')}>
                {copied === 'json' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {(phase === 'json' || phase === 'done') && (
              <div className="step-row">
                {['Parsing', 'Structuring', 'Done'].map((label, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="arr">›</span>}
                    <span className={`step ${getJsonStep(i)}`}>{label}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
            <div className="r-body">
              {jsonResult
                ? <pre className="r-text">{jsonResult}</pre>
                : <div className="empty">Output will appear here...</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;