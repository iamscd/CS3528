"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QuizSection } from "@/app/components/QuizSection";

interface Quiz {
  id: number;
  question: string;
  options: string[];
  correct_option: string;
  correct_numeric_answer?: [number, number, number] | null;
  type: "multiple-choice";
}
interface RawQuiz {
  id: number;
  question: string;
  options: string[] | string;
  correct_option: string;
  correct_numeric_answer?: [number, number, number] | null;
}
interface Lesson {
  id: number;
  title: string;
  content_type: string;
  text_content: string;
  content_url?: string | null;
  media_kind?: "image" | "video" | null;
  module_id?: number;
}

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

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();

  const lessonIdParam = Array.isArray(params.lessonid) ? params.lessonid[0] : params.lessonid;
  const moduleIdParam = Array.isArray(params.moduleid) ? params.moduleid[0] : params.moduleid;
  const courseIdParam = Array.isArray(params.courseid) ? params.courseid[0] : params.courseid;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [moduleLessons, setModuleLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  // Edit lesson state
  const [editingLesson, setEditingLesson] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editMediaFile, setEditMediaFile] = useState<File | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);

  // Edit quiz state
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [editQuizQuestion, setEditQuizQuestion] = useState("");
  const [editQuizOptions, setEditQuizOptions] = useState<string[]>(["", ""]);
  const [editQuizCorrect, setEditQuizCorrect] = useState("");
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Add quiz state
  const [addingQuiz, setAddingQuiz] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const [newCorrect, setNewCorrect] = useState("");
  const [savingNewQuiz, setSavingNewQuiz] = useState(false);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  useEffect(() => {
    if (!lessonIdParam) return;
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }

    const fetchLessonData = async () => {
      setLoading(true);
      try {
        const lessonRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonIdParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!lessonRes.ok) throw new Error("Lesson not found");
        const lessonData: Lesson = await lessonRes.json();
        setLesson(lessonData);
        setEditTitle(lessonData.title);
        setEditContent(lessonData.text_content || "");

        const quizRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${lessonIdParam}/quizzes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (quizRes.ok) {
          const rawQuizzes: RawQuiz[] = await quizRes.json();
          setQuizzes(rawQuizzes.map(q => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
            type: "multiple-choice",
          })));
        }

        if (moduleIdParam) {
          const moduleRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/modules/${moduleIdParam}/lessons`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (moduleRes.ok) setModuleLessons(await moduleRes.json());
        }
      } catch (err) {
        console.error(err);
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLessonData();
  }, [lessonIdParam, moduleIdParam, router]);

  const saveLesson = async () => {
    if (!lesson) return;
    setSavingLesson(true);
    const token = localStorage.getItem("access_token");
    try {
      const payload = new FormData();
      payload.append("title", editTitle);
      payload.append("content_type", lesson.content_type);
      if (lesson.content_type === "text") payload.append("text_content", editContent);
      if (editMediaFile) payload.append("media", editMediaFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${lesson.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });
      if (!res.ok) throw new Error("Failed to save");
      const updated = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${lesson.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLesson(await updated.json());
      setEditingLesson(false);
      setEditMediaFile(null);
    } catch { alert("Failed to save lesson"); } finally { setSavingLesson(false); }
  };

  const removeMedia = async () => {
    if (!lesson || !confirm("Remove this media?")) return;
    const token = localStorage.getItem("access_token");
    const payload = new FormData();
    payload.append("title", lesson.title);
    payload.append("content_type", "text");
    payload.append("text_content", lesson.text_content || "");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${lesson.id}`, {
      method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: payload,
    });
    if (res.ok) setLesson(prev => prev ? { ...prev, content_url: null, media_kind: null } : prev);
    else alert("Failed to remove media");
  };

  const startEditQuiz = (q: Quiz) => {
    setEditingQuizId(q.id);
    setEditQuizQuestion(q.question);
    setEditQuizOptions([...q.options]);
    setEditQuizCorrect(q.correct_option);
  };

  const saveQuiz = async (quizId: number) => {
    setSavingQuiz(true);
    const token = localStorage.getItem("access_token");
    try {
      // Delete old and recreate — simplest approach since there's no PUT /quizzes/:id
      const delRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!delRes.ok) throw new Error("Failed to delete old question");

      const createRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: Number(lessonIdParam),
          question: editQuizQuestion,
          options: editQuizOptions,
          correct_option: editQuizCorrect,
        }),
      });
      if (!createRes.ok) throw new Error("Failed to create updated question");
      const { question_id } = await createRes.json();

      setQuizzes(prev => prev.map(q => q.id === quizId ? {
        ...q, id: question_id, question: editQuizQuestion,
        options: editQuizOptions, correct_option: editQuizCorrect,
      } : q));
      setEditingQuizId(null);
    } catch { alert("Failed to save question"); } finally { setSavingQuiz(false); }
  };

  const deleteQuiz = async (quizId: number) => {
    if (!confirm("Delete this question?")) return;
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setQuizzes(prev => prev.filter(q => q.id !== quizId));
    else alert("Failed to delete question");
  };

  const addQuiz = async () => {
    if (!newQuestion || !newCorrect) return alert("Fill in the question and correct answer");
    setSavingNewQuiz(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: Number(lessonIdParam),
          question: newQuestion,
          options: newOptions,
          correct_option: newCorrect,
        }),
      });
      if (!res.ok) throw new Error();
      const { question_id } = await res.json();
      setQuizzes(prev => [...prev, { id: question_id, question: newQuestion, options: newOptions, correct_option: newCorrect, type: "multiple-choice" }]);
      setNewQuestion(""); setNewOptions(["", ""]); setNewCorrect(""); setAddingQuiz(false);
    } catch { alert("Failed to add question"); } finally { setSavingNewQuiz(false); }
  };

  if (!lessonIdParam || loading) return (
    <main style={{ minHeight: "100vh", background: "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#7F77DD" }}>Loading...</p>
    </main>
  );
  if (!lesson) return (
    <main style={{ minHeight: "100vh", background: "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#7F77DD" }}>Lesson not found.</p>
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

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "64px 24px 80px", display: "flex", gap: 28 }}>

        {/* Sidebar */}
        {moduleLessons.length > 0 && (
          <aside style={{ width: 200, flexShrink: 0 }}>
            <div style={{ background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 20, padding: "20px 16px", position: "sticky", top: 88 }}>
              <Link href={`/courses/${courseIdParam}`} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#7F77DD", textDecoration: "none", display: "block", marginBottom: 12 }}>
                ← Course
              </Link>
              <div style={{ height: "0.5px", background: "rgba(180,160,240,0.25)", marginBottom: 12 }} />
              {moduleLessons.map(l => (
                <Link key={l.id} href={`/courses/${courseIdParam}/${moduleIdParam}/${l.id}`} style={{
                  display: "block", padding: "7px 10px", borderRadius: 10, fontSize: 13,
                  color: String(l.id) === String(lessonIdParam) ? "#26215C" : "#7F77DD",
                  fontWeight: String(l.id) === String(lessonIdParam) ? 500 : 400,
                  background: String(l.id) === String(lessonIdParam) ? "rgba(180,160,240,0.2)" : "transparent",
                  textDecoration: "none", marginBottom: 2,
                }}>{l.title}</Link>
              ))}
            </div>
          </aside>
        )}

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Lesson card */}
          <div style={{ background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 24, padding: "32px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <button onClick={() => router.back()} style={{
                fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                padding: "7px 14px", borderRadius: 10, border: "0.5px solid rgba(180,160,240,0.4)",
                background: "transparent", color: "#534AB7", cursor: "pointer",
              }}>← Back</button>

              {role === "admin" && !editingLesson && (
                <button onClick={() => setEditingLesson(true)} style={{
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                  padding: "7px 14px", borderRadius: 10, border: "0.5px solid rgba(83,74,183,0.3)",
                  background: "transparent", color: "#534AB7", cursor: "pointer",
                }}>Edit lesson</button>
              )}
            </div>

            {editingLesson ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Title</label>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={inputStyle} />
                </div>
                {lesson.content_type === "text" && (
                  <div>
                    <label style={labelStyle}>Content</label>
                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={6} style={{ ...inputStyle, resize: "vertical" }} />
                  </div>
                )}
                {(lesson.media_kind === "image" || lesson.media_kind === "video") && (
                  <div>
                    <label style={labelStyle}>Replace {lesson.media_kind}</label>
                    <input type="file" accept={lesson.media_kind === "image" ? "image/*" : "video/*"} onChange={e => setEditMediaFile(e.target.files?.[0] ?? null)} style={{ fontSize: 13, color: "#534AB7" }} />
                    <button onClick={removeMedia} style={{ marginTop: 8, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 8, border: "0.5px solid rgba(163,45,45,0.3)", background: "transparent", color: "#A32D2D", cursor: "pointer" }}>
                      Remove {lesson.media_kind}
                    </button>
                  </div>
                )}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={saveLesson} disabled={savingLesson} style={{
                    fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                    padding: "9px 20px", borderRadius: 10, border: "none",
                    background: "#534AB7", color: "#fff", cursor: "pointer",
                    opacity: savingLesson ? 0.6 : 1,
                  }}>{savingLesson ? "Saving..." : "Save"}</button>
                  <button onClick={() => { setEditingLesson(false); setEditTitle(lesson.title); setEditContent(lesson.text_content || ""); }} style={{
                    fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                    padding: "9px 20px", borderRadius: 10, border: "0.5px solid rgba(180,160,240,0.4)",
                    background: "transparent", color: "#7F77DD", cursor: "pointer",
                  }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 500, color: "#26215C", margin: "0 0 20px" }}>{lesson.title}</h1>
                {lesson.text_content && (
                  <div style={{ fontSize: 15, color: "#534AB7", lineHeight: 1.8 }}>{lesson.text_content}</div>
                )}
                {lesson.media_kind === "image" && lesson.content_url && (
                  <img src={lesson.content_url} alt={lesson.title} style={{ marginTop: 24, width: "100%", maxHeight: 480, borderRadius: 16, objectFit: "contain", background: "rgba(255,255,255,0.6)" }} />
                )}
                {lesson.media_kind === "video" && lesson.content_url && (
                  <video src={lesson.content_url} controls style={{ marginTop: 24, width: "100%", maxHeight: 480, borderRadius: 16, background: "#000" }} />
                )}
              </>
            )}
          </div>

          {/* Quiz for students */}
          {quizzes.length > 0 && <QuizSection quizzes={quizzes} lessonId={lessonIdParam} />}

          {/* Admin quiz management */}
          {role === "admin" && (
            <div style={{ background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 24, padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#7F77DD", margin: 0 }}>
                  Manage quiz questions
                </p>
                <button onClick={() => setAddingQuiz(v => !v)} style={{
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                  padding: "7px 14px", borderRadius: 10, border: "0.5px solid rgba(83,74,183,0.3)",
                  background: addingQuiz ? "#534AB7" : "transparent",
                  color: addingQuiz ? "#fff" : "#534AB7", cursor: "pointer",
                }}>{addingQuiz ? "Cancel" : "+ Add question"}</button>
              </div>

              {/* Add new question form */}
              {addingQuiz && (
                <div style={{ background: "rgba(180,160,240,0.08)", borderRadius: 16, padding: 20, marginBottom: 16, border: "0.5px solid rgba(180,160,240,0.2)" }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>Question</label>
                    <input value={newQuestion} onChange={e => setNewQuestion(e.target.value)} placeholder="Enter question text" style={inputStyle} />
                  </div>
                  {newOptions.map((o, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <label style={labelStyle}>Option {i + 1}</label>
                      <input value={o} onChange={e => setNewOptions(prev => prev.map((x, idx) => idx === i ? e.target.value : x))} placeholder={`Option ${i + 1}`} style={inputStyle} />
                    </div>
                  ))}
                  <button onClick={() => setNewOptions(prev => [...prev, ""])} style={{ fontSize: 12, color: "#7F77DD", background: "transparent", border: "none", cursor: "pointer", marginBottom: 12 }}>
                    + Add option
                  </button>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Correct answer</label>
                    <select value={newCorrect} onChange={e => setNewCorrect(e.target.value)} style={inputStyle}>
                      <option value="">Select correct answer</option>
                      {newOptions.map((o, i) => <option key={i} value={o}>{o || `Option ${i + 1}`}</option>)}
                    </select>
                  </div>
                  <button onClick={addQuiz} disabled={savingNewQuiz} style={{
                    fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                    padding: "9px 20px", borderRadius: 10, border: "none",
                    background: "#534AB7", color: "#fff", cursor: "pointer",
                    opacity: savingNewQuiz ? 0.6 : 1,
                  }}>{savingNewQuiz ? "Saving..." : "Save question"}</button>
                </div>
              )}

              {/* Existing questions */}
              {quizzes.length === 0 ? (
                <p style={{ fontSize: 13, color: "#7F77DD" }}>No questions yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {quizzes.map(q => (
                    <div key={q.id} style={{ background: "rgba(180,160,240,0.08)", borderRadius: 14, border: "0.5px solid rgba(180,160,240,0.2)", overflow: "hidden" }}>
                      {editingQuizId === q.id ? (
                        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                          <div>
                            <label style={labelStyle}>Question</label>
                            <input value={editQuizQuestion} onChange={e => setEditQuizQuestion(e.target.value)} style={inputStyle} />
                          </div>
                          {editQuizOptions.map((o, i) => (
                            <div key={i}>
                              <label style={labelStyle}>Option {i + 1}</label>
                              <input value={o} onChange={e => setEditQuizOptions(prev => prev.map((x, idx) => idx === i ? e.target.value : x))} style={inputStyle} />
                            </div>
                          ))}
                          <div>
                            <label style={labelStyle}>Correct answer</label>
                            <select value={editQuizCorrect} onChange={e => setEditQuizCorrect(e.target.value)} style={inputStyle}>
                              <option value="">Select correct answer</option>
                              {editQuizOptions.map((o, i) => <option key={i} value={o}>{o || `Option ${i + 1}`}</option>)}
                            </select>
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => saveQuiz(q.id)} disabled={savingQuiz} style={{
                              fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                              padding: "7px 16px", borderRadius: 8, border: "none",
                              background: "#534AB7", color: "#fff", cursor: "pointer", opacity: savingQuiz ? 0.6 : 1,
                            }}>{savingQuiz ? "Saving..." : "Save"}</button>
                            <button onClick={() => setEditingQuizId(null)} style={{
                              fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                              padding: "7px 16px", borderRadius: 8, border: "0.5px solid rgba(180,160,240,0.4)",
                              background: "transparent", color: "#7F77DD", cursor: "pointer",
                            }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 14, color: "#3C3489", flex: 1 }}>{q.question}</span>
                          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                            <button onClick={() => startEditQuiz(q)} style={{
                              fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                              padding: "6px 12px", borderRadius: 8, border: "0.5px solid rgba(83,74,183,0.3)",
                              background: "transparent", color: "#534AB7", cursor: "pointer",
                            }}>Edit</button>
                            <button onClick={() => deleteQuiz(q.id)} style={{
                              fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                              padding: "6px 12px", borderRadius: 8, border: "0.5px solid rgba(163,45,45,0.3)",
                              background: "transparent", color: "#A32D2D", cursor: "pointer",
                            }}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
