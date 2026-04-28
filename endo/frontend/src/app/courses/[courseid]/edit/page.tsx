"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const BUBBLES = [
  { w: 300, h: 300, top: -80, left: -100 },
  { w: 150, h: 150, top: 60, right: 40 },
  { w: 400, h: 400, top: 400, right: -150 },
  { w: 200, h: 200, bottom: 100, left: -60 },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14,
  border: "0.5px solid rgba(180,160,240,0.4)", background: "rgba(255,255,255,0.7)",
  color: "#26215C", outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
  textTransform: "uppercase" as const, color: "#7F77DD", display: "block", marginBottom: 6,
};

export default function EditCoursePage() {
  const { courseid } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    if (!token || role !== "admin") { router.push("/"); return; }

    fetch(`http://127.0.0.1:5000/courses/${courseid}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setTitle(data.title || "");
        setDescription(data.description || "");
        setCurrentImageUrl(data.image_url || null);
      })
      .catch(() => router.push("/courses"))
      .finally(() => setLoading(false));
  }, [courseid, router]);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("access_token");
    try {
      const payload = new FormData();
      payload.append("title", title);
      payload.append("description", description);
      if (newImageFile) payload.append("image", newImageFile);

      const res = await fetch(`http://127.0.0.1:5000/courses/${courseid}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });
      if (!res.ok) throw new Error("Failed to save");
      router.push(`/courses/${courseid}`);
    } catch { alert("Failed to save course"); } finally { setSaving(false); }
  };

  const handleRemoveImage = async () => {
    if (!confirm("Remove the course image?")) return;
    setRemovingImage(true);
    const token = localStorage.getItem("access_token");
    try {
      const payload = new FormData();
      payload.append("title", title);
      payload.append("description", description);
      payload.append("image_url", "");
      const res = await fetch(`http://127.0.0.1:5000/courses/${courseid}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });
      if (!res.ok) throw new Error();
      setCurrentImageUrl(null);
      setNewImageFile(null);
    } catch { alert("Failed to remove image"); } finally { setRemovingImage(false); }
  };

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#7F77DD" }}>Loading...</p>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#f0eeff", position: "relative", overflowX: "hidden" }}>
      {BUBBLES.map((b, i) => (
        <div key={i} style={{
          position: "absolute", borderRadius: "50%",
          background: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.55)",
          width: b.w, height: b.h,
          top: (b as any).top ?? "auto", bottom: (b as any).bottom ?? "auto",
          left: (b as any).left ?? "auto", right: (b as any).right ?? "auto",
          pointerEvents: "none", zIndex: 0,
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "64px 24px 80px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 500, color: "#26215C", margin: 0 }}>
            Edit course
          </h1>
          <Link href={`/courses/${courseid}`} style={{
            fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "8px 16px", borderRadius: 10, border: "0.5px solid rgba(180,160,240,0.4)",
            background: "rgba(255,255,255,0.55)", color: "#7F77DD", textDecoration: "none",
          }}>← Back</Link>
        </div>

        <div style={{ background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 24, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

          <div>
            <label style={labelStyle}>Course title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={labelStyle}>Course image</label>
            {currentImageUrl && !newImageFile && (
              <div style={{ marginBottom: 12 }}>
                <img src={currentImageUrl} alt="Current" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, marginBottom: 10 }} />
                <button onClick={handleRemoveImage} disabled={removingImage} style={{
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                  padding: "7px 14px", borderRadius: 8, border: "0.5px solid rgba(163,45,45,0.3)",
                  background: "transparent", color: "#A32D2D", cursor: "pointer",
                  opacity: removingImage ? 0.6 : 1,
                }}>{removingImage ? "Removing..." : "Remove image"}</button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={e => setNewImageFile(e.target.files?.[0] ?? null)}
              style={{ fontSize: 13, color: "#534AB7" }}
            />
            {newImageFile && (
              <p style={{ fontSize: 12, color: "#7F77DD", marginTop: 6 }}>
                New image selected: {newImageFile.name}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={handleSave} disabled={saving} style={{
              fontSize: 13, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
              padding: "12px 28px", borderRadius: 12, border: "none",
              background: "#534AB7", color: "#fff", cursor: "pointer",
              boxShadow: "0 4px 14px rgba(83,74,183,0.25)", opacity: saving ? 0.6 : 1,
            }}>{saving ? "Saving..." : "Save changes"}</button>
            <Link href={`/courses/${courseid}`} style={{
              fontSize: 13, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
              padding: "12px 28px", borderRadius: 12, border: "0.5px solid rgba(180,160,240,0.4)",
              background: "transparent", color: "#7F77DD", textDecoration: "none",
            }}>Cancel</Link>
          </div>
        </div>
      </div>
    </main>
  );
}