import React, { useRef, useState, useEffect } from "react";
import { Camera, Upload, Check, ShoppingCart, RefreshCw, Wrench } from "lucide-react";
import { api } from "../api/client";
import { formatPriceWithUnit } from "../data/products";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export default function SmartRecommendPage({ onAddToCart, onProductClick, onGoHome }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function reset() {
    setFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleFileChange(e) {
    const picked = e.target.files && e.target.files[0];
    if (!picked) return;
    setResult(null);
    setError("");
    if (!ALLOWED.includes(picked.type)) {
      setError("Please choose a JPG, PNG or WEBP photo.");
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError("This photo is larger than 5 MB. Please choose a smaller one.");
      return;
    }
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const form = new FormData();
      form.append("image", file);
      const data = await api.post("/api/smart-recommend", form, { isForm: true });
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(e, id) {
    e.stopPropagation();
    onAddToCart(id);
    setAddedId(id);
    setTimeout(() => setAddedId(null), 1200);
  }

  const recognized = result && result.recognized_item;
  const products = (result && result.recommended_products) || [];
  const notRecognized = result && !recognized;

  return (
    <div className="smart-page">
      <button className="btn btn-outline btn-sm smart-back" onClick={onGoHome}>
        ← Back to store
      </button>

      <h2 className="section-title">Find the right tool from a photo</h2>
      <p className="smart-intro">
        Take or upload a photo of the problem (a loose screw, bare wires, a rusted padlock, a spot to drill…)
        and we will suggest the tools you need.
      </p>

      <div className="smart-upload-card">
        {previewUrl ? (
          <img src={previewUrl} alt="Your photo" className="smart-preview" />
        ) : (
          <div className="smart-placeholder">
            <Camera size={40} />
            <span>No photo selected</span>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <div className="smart-actions">
          <button className="btn btn-outline" onClick={() => fileRef.current && fileRef.current.click()} disabled={loading}>
            <Upload size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />
            {file ? "Choose another photo" : "Choose a photo"}
          </button>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={!file || loading}>
            {loading ? "Analysing your photo…" : "Find tools"}
          </button>
        </div>

        {error && <p className="smart-error">{error}</p>}
      </div>

      {notRecognized && (
        <div className="smart-result-card">
          <p className="smart-notice">
            {result.message || "We couldn't recognise the problem in this photo. Please try a clearer, closer photo."}
          </p>
          <button className="btn btn-outline" onClick={reset}>
            <RefreshCw size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />
            Try another photo
          </button>
        </div>
      )}

      {recognized && (
        <section className="smart-result-card">
          <span className="smart-eyebrow">We think the problem is</span>
          <h3 className="smart-problem">{recognized.display_name}</h3>
          <p className="smart-confidence">Match confidence: {Math.round(recognized.confidence * 100)}%</p>

          <h4 className="smart-subtitle">Recommended tools</h4>
          {products.length === 0 && <p className="empty-state">No tools are linked to this problem yet.</p>}
          <div className="product-grid">
            {products.map((p) => (
              <div
                key={p.id}
                className="product-card"
                role="button"
                tabIndex={0}
                onClick={() => onProductClick(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onProductClick(p.id);
                }}
                style={{ overflow: "hidden" }}
              >
                <span
                  className="thumb"
                  style={{
                    width: "100%",
                    height: "160px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px 8px 0 0",
                  }}
                >
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Wrench size={26} className="thumb-icon" />
                  )}
                </span>
                <span className="product-name">{p.name}</span>
                <span className="product-price">{formatPriceWithUnit(Number(p.price), p.unit)}</span>
                <button className="btn btn-primary btn-sm quick-add-btn" onClick={(e) => handleAdd(e, p.id)}>
                  {addedId === p.id ? (
                    <>
                      <Check size={14} /> Added
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={14} /> Add to Cart
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <button className="btn btn-outline smart-again" onClick={reset}>
            <RefreshCw size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />
            Try another photo
          </button>
        </section>
      )}
    </div>
  );
}