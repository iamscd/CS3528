"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LessonContentType = "text" | "image" | "video";

interface Quiz {
  id: number; question: string; type: "multiple_choice" | "numeric";
  options: string[]; correctAnswer: string; correctNumericAnswer: number | null;
}
interface Lesson {
  id: number; title: string; content: string; contentType: LessonContentType;
  mediaFile: File | null; quiz: Quiz[];
}
interface Module {
  id: number; title: string; description: string; lessons: Lesson[]; open: boolean;
}
type ModuleUpdateValue = string | boolean;
type LessonUpdateValue = string | File | null;
type QuestionUpdateValue = string | number | null;

const BUBBLES = [
  { w: 300, h: 300, top: -80, left: -100 },
  { w: 150, h: 150, top: 60, right: 40 },
  { w: 400, h: 400, top: 400, right: -150 },
  { w: 200, h: 200, bottom: 100, left: -60 },
  { w: 80, h: 80, top: 300, left: 200 },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14,
  border: "0.5px solid rgba(180,160,240,0.4)", background: "rgba(255,255,255,0.7)",
  color: "#26215C", outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
  textTransform: "uppercase", color: "#7F77DD", display: "block", marginBottom: 6,
};

export default function ModuleCreatorPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseImage, setCourseImage] = useState<File | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (!storedToken) { router.push("/login"); return; }
    setToken(storedToken);
    fetch("http://127.0.0.1:5000/api/user/profile", { headers: { Authorization: `Bearer ${storedToken}` } })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { if (data.role !== "admin") router.push("/"); })
      .catch(() => router.push("/login"))
      .finally(() => setCheckingAuth(false));
  }, [router]);

  const addModule = () => setModules(prev => [...prev, { id: Date.now(), title: "", description: "", lessons: [], open: true }]);
  const updateModule = (id: number, key: keyof Module, value: ModuleUpdateValue) =>
    setModules(prev => prev.map(m => m.id === id ? { ...m, [key]: value } : m));
  const removeModule = (id: number) => setModules(prev => prev.filter(m => m.id !== id));

  const addLesson = (moduleId: number) => setModules(prev => prev.map(m =>
    m.id === moduleId ? { ...m, lessons: [...m.lessons, { id: Date.now(), title: "", content: "", contentType: "text", mediaFile: null, quiz: [] }] } : m
  ));
  const updateLesson = (mid: number, lid: number, key: keyof Lesson, value: LessonUpdateValue) =>
    setModules(prev => prev.map(m => m.id === mid ? { ...m, lessons: m.lessons.map(l => l.id === lid ? { ...l, [key]: value } : l) } : m));
  const removeLesson = (mid: number, lid: number) =>
    setModules(prev => prev.map(m => m.id === mid ? { ...m, lessons: m.lessons.filter(l => l.id !== lid) } : m));

  const addQuestion = (mid: number, lid: number) => setModules(prev => prev.map(m =>
    m.id === mid ? { ...m, lessons: m.lessons.map(l => l.id === lid ? {
      ...l, quiz: [...l.quiz, { id: Date.now(), question: "", type: "multiple_choice", options: ["", "", "", ""], correctAnswer: "", correctNumericAnswer: null }]
    } : l) } : m
  ));
  const updateQuestion = (mid: number, lid: number, qid: number, key: string, value: QuestionUpdateValue) =>
    setModules(prev => prev.map(m => m.id === mid ? { ...m, lessons: m.lessons.map(l => l.id === lid ? { ...l, quiz: l.quiz.map(q => q.id === qid ? { ...q, [key]: value } : q) } : l) } : m));
  const updateOption = (mid: number, lid: number, qid: number, index: number, value: string) =>
    setModules(prev => prev.map(m => m.id === mid ? { ...m, lessons: m.lessons.map(l => l.id === lid ? { ...l, quiz: l.quiz.map(q => q.id === qid ? { ...q, options: q.options.map((o, i) => i === index ? value : o) } : q) } : l) } : m));
  const addOption = (mid: number, lid: number, qid: number) =>
    setModules(prev => prev.map(m => m.id === mid ? { ...m, lessons: m.lessons.map(l => l.id === lid ? { ...l, quiz: l.quiz.map(q => q.id === qid ? { ...q, options: [...q.options, ""] } : q) } : l) } : m));
  const removeOption = (mid: number, lid: number, qid: number, index: number, optionValue: string) =>
    setModules(prev => prev.map(m => m.id === mid ? { ...m, lessons: m.lessons.map(l => l.id === lid ? { ...l, quiz: l.quiz.map(q => q.id === qid ? {
      ...q,
      options: q.options.filter((_, i) => i !== index),
      correctAnswer: q.correctAnswer === optionValue ? "" : q.correctAnswer,
    } : q) } : l) } : m));

  const validate = () => {
    if (!title || !description) return "Course title and description required";
    for (const m of modules) {
      if (!m.title) return "Each module must have a title";
      for (const l of m.lessons) {
        if (!l.title) return "Each lesson must have a title";
        if (l.contentType === "text" && !l.content.trim()) return "Text lessons need content";
        if (l.contentType !== "text" && !l.mediaFile) return "Image/video lessons need a file";
        for (const q of l.quiz) {
          if (!q.question) return "Every question needs text";
          if (q.type === "multiple_choice" && !q.correctAnswer) return "Multiple choice needs a correct answer";
          if (q.type === "numeric" && q.correctNumericAnswer === null) return "Numeric questions need an answer";
        }
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!token) return;
    const error = validate();
    if (error) return alert(error);
    setSaving(true);
    try {
      const coursePayload = new FormData();
      coursePayload.append("title", title);
      coursePayload.append("description", description);
      if (courseImage) coursePayload.append("image", courseImage);

      const courseRes = await fetch("http://127.0.0.1:5000/courses", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: coursePayload });
      if (!courseRes.ok) throw new Error("Failed to create course");
      const { course_id: courseId } = await courseRes.json();

      for (const moduleItem of modules) {
        const moduleRes = await fetch("http://127.0.0.1:5000/modules", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ title: moduleItem.title, description: moduleItem.description, course_id: courseId }) });
        if (!moduleRes.ok) throw new Error(`Failed to create module "${moduleItem.title}"`);
        const { module_id: moduleId } = await moduleRes.json();

        for (const lesson of moduleItem.lessons) {
          const lessonPayload = new FormData();
          lessonPayload.append("title", lesson.title);
          lessonPayload.append("module_id", String(moduleId));
          lessonPayload.append("content_type", lesson.contentType);
          if (lesson.contentType === "text") lessonPayload.append("text_content", lesson.content);
          if (lesson.mediaFile) lessonPayload.append("media", lesson.mediaFile);

          const lessonRes = await fetch("http://127.0.0.1:5000/lessons", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: lessonPayload });
          if (!lessonRes.ok) throw new Error(`Failed to create lesson "${lesson.title}"`);
          const { lesson_id: lessonId } = await lessonRes.json();

          for (const q of lesson.quiz) {
            const payload: Record<string, unknown> = { lesson_id: lessonId, question: q.question };
            if (q.type === "multiple_choice") { payload.options = q.options; payload.correct_option = q.correctAnswer; }
            else { payload.correct_numeric_answer = q.correctNumericAnswer; }
            const quizRes = await fetch("http://127.0.0.1:5000/quizzes", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (!quizRes.ok) throw new Error(`Failed to create quiz for "${lesson.title}"`);
          }
        }
      }

      alert("Course saved successfully!");
      setTitle(""); setDescription(""); setCourseImage(null); setModules([]);
      router.push("/courses");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving the course.");
    } finally {
      setSaving(false);
    }
  };

  if (checkingAuth) return (
    <main style={{ minHeight: "100vh", background: "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#7F77DD" }}>Checking access...</p>
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

      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "64px 24px 80px" }}>

        <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 500, color: "#26215C", margin: "0 0 8px" }}>Create a course</h1>
        <p style={{ fontSize: 14, color: "#7F77DD", margin: "0 0 40px" }}>Fill in the details below to build your course.</p>

        {/* Course details card */}
        <div style={{ background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 24, padding: "28px 24px", marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#534AB7", margin: "0 0 20px" }}>Course details</p>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Title</label>
            <input placeholder="e.g. Understanding Endometriosis" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Description</label>
            <textarea placeholder="What will students learn?" value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={labelStyle}>Course image (optional)</label>
            <input type="file" accept="image/*" onChange={e => setCourseImage(e.target.files?.[0] ?? null)} style={{ fontSize: 13, color: "#534AB7" }} />
          </div>
        </div>

        {/* Modules */}
        {modules.map((m, mIdx) => (
          <div key={m.id} style={{ background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 24, padding: "24px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#534AB7", margin: 0 }}>Module {mIdx + 1}</p>
              <button onClick={() => removeModule(m.id)} style={{ fontSize: 12, color: "#A32D2D", background: "transparent", border: "none", cursor: "pointer" }}>Remove</button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Module title</label>
              <input placeholder="e.g. Introduction" value={m.title} onChange={e => updateModule(m.id, "title", e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Module description</label>
              <textarea placeholder="Brief overview of this module" value={m.description} onChange={e => updateModule(m.id, "description", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            {/* Lessons */}
            {m.lessons.map((l, lIdx) => (
              <div key={l.id} style={{ background: "rgba(180,160,240,0.08)", border: "0.5px solid rgba(180,160,240,0.2)", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#7F77DD", margin: 0 }}>Lesson {lIdx + 1}</p>
                  <button onClick={() => removeLesson(m.id, l.id)} style={{ fontSize: 12, color: "#A32D2D", background: "transparent", border: "none", cursor: "pointer" }}>Remove</button>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={labelStyle}>Lesson title</label>
                  <input placeholder="e.g. What is endometriosis?" value={l.title} onChange={e => updateLesson(m.id, l.id, "title", e.target.value)} style={inputStyle} />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={labelStyle}>Content type</label>
                  <select value={l.contentType} onChange={e => updateLesson(m.id, l.id, "contentType", e.target.value as LessonContentType)} style={inputStyle}>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                {l.contentType === "text" ? (
                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Content</label>
                    <textarea placeholder="Write the lesson content..." value={l.content} onChange={e => updateLesson(m.id, l.id, "content", e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
                  </div>
                ) : (
                  <div style={{ marginBottom: 10 }}>
                    <label style={labelStyle}>Upload {l.contentType}</label>
                    <input type="file" accept={l.contentType === "image" ? "image/*" : "video/*"} onChange={e => updateLesson(m.id, l.id, "mediaFile", e.target.files?.[0] ?? null)} style={{ fontSize: 13, color: "#534AB7" }} />
                  </div>
                )}

                {/* Quiz questions */}
                {l.quiz.map((q, qIdx) => (
                  <div key={q.id} style={{ background: "rgba(255,255,255,0.6)", borderRadius: 12, padding: "14px", marginBottom: 10, border: "0.5px solid rgba(180,160,240,0.2)" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#7F77DD", margin: "0 0 10px" }}>Question {qIdx + 1}</p>

                    <div style={{ marginBottom: 8 }}>
                      <input placeholder="Question text" value={q.question} onChange={e => updateQuestion(m.id, l.id, q.id, "question", e.target.value)} style={inputStyle} />
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <select value={q.type} onChange={e => updateQuestion(m.id, l.id, q.id, "type", e.target.value)} style={{ ...inputStyle, width: "auto" }}>
                        <option value="multiple_choice">Multiple choice</option>
                        <option value="numeric">Numeric answer</option>
                      </select>
                    </div>

                    {q.type === "multiple_choice" && (
                      <>
                        {q.options.map((o, i) => (
                          <div key={i} style={{ marginBottom: 8, display: "flex", gap: 8 }}>
                            <input
                              placeholder={`Option ${i + 1}`}
                              value={o}
                              onChange={e => updateOption(m.id, l.id, q.id, i, e.target.value)}
                              style={{ ...inputStyle, flex: 1 }}
                            />
                            {q.options.length > 2 && (
                              <button
                                onClick={() => removeOption(m.id, l.id, q.id, i, o)}
                                style={{
                                  fontSize: 11, fontWeight: 700, padding: "0 10px", borderRadius: 8, flexShrink: 0,
                                  border: "0.5px solid rgba(163,45,45,0.3)", background: "transparent",
                                  color: "#A32D2D", cursor: "pointer",
                                }}
                              >✕</button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(m.id, l.id, q.id)}
                          style={{ fontSize: 12, color: "#7F77DD", background: "transparent", border: "none", cursor: "pointer", marginBottom: 10 }}
                        >+ Add option</button>
                        <div style={{ marginTop: 4 }}>
                          <label style={labelStyle}>Correct answer</label>
                          <select value={q.correctAnswer} onChange={e => updateQuestion(m.id, l.id, q.id, "correctAnswer", e.target.value)} style={inputStyle}>
                            <option value="">Select correct answer</option>
                            {q.options.map((o, i) => <option key={i} value={o}>{o || `Option ${i + 1}`}</option>)}
                          </select>
                        </div>
                      </>
                    )}

                    {q.type === "numeric" && (
                      <div>
                        <label style={labelStyle}>Correct numeric answer</label>
                        <input type="number" placeholder="0" value={q.correctNumericAnswer ?? ""} onChange={e => updateQuestion(m.id, l.id, q.id, "correctNumericAnswer", Number(e.target.value))} style={{ ...inputStyle, width: 160 }} />
                      </div>
                    )}
                  </div>
                ))}

                <button onClick={() => addQuestion(m.id, l.id)} style={{
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                  padding: "6px 14px", borderRadius: 8, border: "0.5px solid rgba(180,160,240,0.4)",
                  background: "transparent", color: "#7F77DD", cursor: "pointer",
                }}>+ Add question</button>
              </div>
            ))}

            <button onClick={() => addLesson(m.id)} style={{
              fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "8px 16px", borderRadius: 10, border: "0.5px solid rgba(83,74,183,0.3)",
              background: "transparent", color: "#534AB7", cursor: "pointer", width: "100%",
            }}>+ Add lesson</button>
          </div>
        ))}

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
          <button onClick={addModule} style={{
            fontSize: 13, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
            padding: "12px", borderRadius: 12, border: "0.5px solid rgba(83,74,183,0.3)",
            background: "rgba(255,255,255,0.55)", color: "#534AB7", cursor: "pointer",
          }}>+ Add module</button>

          <button onClick={handleSubmit} disabled={saving} style={{
            fontSize: 13, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
            padding: "14px", borderRadius: 12, border: "none",
            background: saving ? "rgba(83,74,183,0.5)" : "#534AB7",
            color: "#fff", cursor: saving ? "not-allowed" : "pointer",
            boxShadow: "0 4px 18px rgba(83,74,183,0.3)",
          }}>{saving ? "Saving..." : "Save course"}</button>
        </div>

      </div>
    </main>
  );
}