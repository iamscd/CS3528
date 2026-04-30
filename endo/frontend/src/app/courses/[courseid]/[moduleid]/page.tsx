"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Lesson { id: number; title: string; }
interface Module { id: number; title: string; description?: string; course_id?: number; }

const BUBBLES = [
  { w: 300, h: 300, top: -80, left: -100 },
  { w: 150, h: 150, top: 60, right: 40 },
  { w: 400, h: 400, top: 300, right: -150 },
  { w: 200, h: 200, bottom: 100, left: -60 },
];

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();
  const moduleid = Array.isArray(params.moduleid) ? params.moduleid[0] : params.moduleid;
  const courseid = Array.isArray(params.courseid) ? params.courseid[0] : params.courseid;

  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!moduleid) return;
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }

    const fetchData = async () => {
      try {
        const moduleRes = await fetch(`process.env.NEXT_PUBLIC_API_URL/modules/${moduleid}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!moduleRes.ok) throw new Error("Module not found");
        const moduleData = await moduleRes.json();

        const lessonsRes = await fetch(`process.env.NEXT_PUBLIC_API_URL/modules/${moduleid}/lessons`, { headers: { Authorization: `Bearer ${token}` } });
        const lessonsData = lessonsRes.ok ? await lessonsRes.json() : [];

        setModule(moduleData);
        setLessons(lessonsData);

        const progressResults = await Promise.all(
          lessonsData.map((lesson: Lesson) =>
            fetch(`process.env.NEXT_PUBLIC_API_URL/lessons/${lesson.id}/progress`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
          )
        );
        setCompletedLessons(progressResults.map((p, idx) => p.is_completed ? lessonsData[idx].id : null).filter(Boolean) as number[]);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [moduleid, router]);

  const progressPercent = lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0;

  if (loading) return <main style={{ minHeight: "100vh", background: "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#7F77DD" }}>Loading...</p></main>;
  if (error || !module) return <main style={{ minHeight: "100vh", background: "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#A32D2D" }}>{error || "Module not found."}</p></main>;

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
        <div style={{ marginBottom: 32, display: "flex", gap: 10 }}>
          <button onClick={() => router.back()} style={{
            fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            padding: "8px 16px", borderRadius: 10, border: "0.5px solid rgba(180,160,240,0.4)",
            background: "rgba(255,255,255,0.55)", color: "#534AB7", cursor: "pointer",
          }}>← Back</button>
          {courseid && (
            <Link href={`/courses/${courseid}`} style={{
              fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "8px 16px", borderRadius: 10, border: "0.5px solid rgba(180,160,240,0.4)",
              background: "rgba(255,255,255,0.55)", color: "#534AB7", textDecoration: "none",
            }}>Course overview</Link>
          )}
        </div>

        <div style={{ background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 24, padding: "32px 28px" }}>
          <header style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 500, color: "#26215C", margin: "0 0 8px" }}>{module.title}</h1>
            {module.description && <p style={{ fontSize: 15, color: "#534AB7", lineHeight: 1.7, margin: 0 }}>{module.description}</p>}
          </header>

          {/* Progress bar */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ height: 6, background: "rgba(180,160,240,0.2)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPercent}%`, background: "#534AB7", borderRadius: 99, transition: "width 0.4s ease" }} />
            </div>
            <p style={{ fontSize: 12, color: "#7F77DD", margin: "6px 0 0" }}>{completedLessons.length}/{lessons.length} lessons completed</p>
          </div>

          <div style={{ height: "0.5px", background: "rgba(180,160,240,0.25)", marginBottom: 24 }} />

          <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#7F77DD", margin: "0 0 16px" }}>Lessons</h2>

          {lessons.length === 0 ? (
            <p style={{ fontSize: 14, color: "#7F77DD" }}>No lessons available yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {lessons.map(lesson => {
                const isCompleted = completedLessons.includes(lesson.id);
                return (
                  <Link key={lesson.id} href={`/courses/${courseid}/${moduleid}/${lesson.id}`} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 18px", borderRadius: 14, textDecoration: "none",
                    background: isCompleted ? "rgba(59,109,17,0.08)" : "rgba(180,160,240,0.1)",
                    border: `0.5px solid ${isCompleted ? "rgba(59,109,17,0.2)" : "rgba(180,160,240,0.25)"}`,
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 400, color: isCompleted ? "#3B6D11" : "#3C3489" }}>
                      {isCompleted ? "✓ " : ""}{lesson.title}
                    </span>
                    <span style={{ fontSize: 12, color: isCompleted ? "#3B6D11" : "#7F77DD" }}>
                      {isCompleted ? "Done" : "Start →"}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
