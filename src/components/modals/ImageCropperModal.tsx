import { useState, useEffect, useRef } from "react";

export function ImageCropperModal({ imageSrc, onCrop, onCancel }: { imageSrc: string, onCrop: (b64: string) => void, onCancel: () => void }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const minDim = Math.min(img.width, img.height);
      const scale = (120 / minDim) * zoom;
      const w = img.width * scale;
      const h = img.height * scale;
      const cx = (120 - w) / 2 + offset.x;
      const cy = (120 - h) / 2 + offset.y;
      ctx.drawImage(img, cx, cy, w, h);
    };
    img.src = imageSrc;
  }, [imageSrc, zoom, offset]);

  const handlePointerDown = (e: any) => { setDragging(true); setDragStart({ x: (e.touches ? e.touches[0].clientX : e.clientX) - offset.x, y: (e.touches ? e.touches[0].clientY : e.clientY) - offset.y }); };
  const handlePointerMove = (e: any) => { if (dragging) setOffset({ x: (e.touches ? e.touches[0].clientX : e.clientX) - dragStart.x, y: (e.touches ? e.touches[0].clientY : e.clientY) - dragStart.y }); };
  const handlePointerUp = () => setDragging(false);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="animate-bounceIn" style={{ background: "#1C1917", padding: 24, borderRadius: 16, textAlign: "center", width: 300 }}>
        <h3 style={{ margin: "0 0 16px 0", color: "#FAF5EF" }}>Crop Profile Image</h3>
        <div style={{ width: 120, height: 120, border: "2px dashed #b45309", borderRadius: "50%", margin: "0 auto", overflow: "hidden", cursor: dragging ? "grabbing" : "grab", touchAction: "none" }} onMouseDown={handlePointerDown} onMouseMove={handlePointerMove} onMouseUp={handlePointerUp} onMouseLeave={handlePointerUp} onTouchStart={handlePointerDown} onTouchMove={handlePointerMove} onTouchEnd={handlePointerUp}>
          <canvas ref={canvasRef} width={120} height={120} style={{ display: "block", margin: "0 auto" }} />
        </div>
        <div style={{ margin: "20px 0" }}><label style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 8 }}>Zoom Image</label><input type="range" min="1" max="3" step="0.05" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} style={{ width: "100%" }} /></div>
        <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 16 }}>Drag image inside the circle to adjust</p>
        <div style={{ display: "flex", gap: 10 }}><button onClick={onCancel} style={{ flex: 1, padding: "10px", border: "1px solid rgba(212, 175, 55, 0.2)", background: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>Cancel</button><button onClick={() => { if(canvasRef.current) onCrop(canvasRef.current.toDataURL("image/jpeg", 0.6)); }} className="btn-primary" style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600 }}>Apply & Save</button></div>
      </div>
    </div>
  );
}
