"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QuizSection } from "@/app/components/QuizSection";

interface Quiz { id: number; question: string; options: string[]; correct_option: string; correct_numeric_answer?: [number, number, number] | null; type: "multiple-choice"; }
interface RawQuiz { id: number; question: string; options: string[] | string; correct_option: string; correct_numeric_answer?: [number, number, number] | null; }
interface Lesson { id: number; title: string; content_type: string; text_content: string; content_url?: string | null; media_kind?: "image" | "video" | null; module_id?: number; }
interface Course { id: number; title: string; }

const BUBBLES = [
  { w: 300, h: 300, top: -80, left: -100 },
  { w: 150, h: 150, top: 60, right: 40 },
  { w: 400, h: 400, top: 400, right: -150 },
  { w: 200, h: 200, bottom: 100, left: -60 },
];

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

  useEffect(() => {
    if (!lessonIdParam) return;
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }

    const fetchLessonData = async () => {
      setLoading(true);
      try {
        const lessonRes = await fetch(`http://127.0.0.1:5000/lessons/${lessonIdParam}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!lessonRes.ok) throw new Error("Lesson not found");
        setLesson(await lessonRes.json());

        const quizRes = await fetch(`http://127.0.0.1:5000/lessons/${lessonIdParam}/quizzes`, { headers: { Authorization: `Bearer ${token}` } });
        if (quizRes.ok) {
          const rawQuizzes: RawQuiz[] = await quizRes.json();
          setQuizzes(rawQuizzes.map(q => ({ ...q, options: Array.isArray(q.options) ? q.options : JSON.parse(q.options), type: "multiple-choice" })));
        }

        if (moduleIdParam) {
          const moduleRes = await fetch(`http://127.0.0.1:5000/modules/${moduleIdParam}/lessons`, { headers: { Authorization: `Bearer ${token}` } });
          if (moduleRes.ok) setModuleLessons(await moduleRes.json());
        }
      } catch (err) { console.error(err); setLesson(null); } finally { setLoading(false); }
    };
    fetchLessonData();
  }, [lessonIdParam, moduleIdParam, router]);

  if (!lessonIdParam || loading) return <main style={{ minHeight: "100vh", background: "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#7F77DD" }}>Loading...</p></main>;
  if (!lesson) return <main style={{ minHeight: "100vh", background: "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#7F77DD" }}>Lesson not found.</p></main>;

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

        {/* Sidebar — lesson list */}
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
          <div style={{ background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 24, padding: "32px 28px" }}>
            <button onClick={() => router.back()} style={{
              fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "7px 14px", borderRadius: 10, border: "0.5px solid rgba(180,160,240,0.4)",
              background: "transparent", color: "#534AB7", cursor: "pointer", marginBottom: 24,
            }}>← Back</button>

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
          </div>

          {quizzes.length > 0 && <QuizSection quizzes={quizzes} lessonId={lessonIdParam} />}
        </div>
      </div>
    </main>
  );
}