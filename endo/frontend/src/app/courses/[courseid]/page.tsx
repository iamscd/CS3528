"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProgressDots from "@/app/components/ProgressDots";

interface Lesson { id: number; title: string; }
interface Module { id: number; title: string; description?: string; }
interface Course { id: number; title: string; description: string; image_url?: string | null; }

const BUBBLES = [
  { w: 300, h: 300, top: -80, left: -100 },
  { w: 150, h: 150, top: 60, right: 40 },
  { w: 80, h: 80, top: 300, left: 200 },
  { w: 400, h: 400, top: 400, right: -150 },
  { w: 100, h: 100, top: 600, left: 80 },
  { w: 200, h: 200, bottom: 200, left: -60 },
  { w: 120, h: 120, bottom: 80, right: 100 },
];

export default function CoursePage() {
  const { courseid } = useParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleLessons, setModuleLessons] = useState<{ [key: number]: Lesson[] }>({});
  const [moduleProgress, setModuleProgress] = useState<{ [key: number]: number }>({});
  const [openModule, setOpenModule] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    fetch("http://127.0.0.1:5000/courses", { headers })
      .then(r => r.ok && r.json()).then(d => d && setCourses(d)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!courseid) return;
    const token = localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const fetchData = async () => {
      setLoading(true);
      try {
        const courseRes = await fetch(`http://127.0.0.1:5000/courses/${courseid}`, { headers });
        if (!courseRes.ok) throw new Error("Course not found");
        setCourse(await courseRes.json());

        const modulesRes = await fetch(`http://127.0.0.1:5000/courses/${courseid}/modules`, { headers });
        const modulesData: Module[] = modulesRes.ok ? await modulesRes.json() : [];
        setModules(modulesData);

        const lessonsObj: { [key: number]: Lesson[] } = {};
        const progressObj: { [key: number]: number } = {};

        await Promise.all(modulesData.map(async (module) => {
          const lr = await fetch(`http://127.0.0.1:5000/modules/${module.id}/lessons`, { headers });
          const ld: Lesson[] = lr.ok ? await lr.json() : [];
          lessonsObj[module.id] = ld;
          if (!ld.length) { progressObj[module.id] = 0; return; }
          const pr = await Promise.all(ld.map(l =>
            fetch(`http://127.0.0.1:5000/lessons/${l.id}/progress`, { headers }).then(r => r.json())
          ));
          progressObj[module.id] = pr.filter(p => p.is_completed).length / ld.length;
        }));

        setModuleLessons(lessonsObj);
        setModuleProgress(progressObj);
        if (modulesData.length > 0) setOpenModule(modulesData[0].id);
      } catch { setCourse(null); } finally { setLoading(false); }
    };
    fetchData();
  }, [courseid]);

  if (loading) return <main style={{ minHeight: "100vh", background: "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#7F77DD" }}>Loading...</p></main>;
  if (!course) return <main style={{ minHeight: "100vh", background: "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#7F77DD" }}>Course not found.</p></main>;

  const completedModules = modules.filter(m => moduleProgress[m.id] === 1).length;

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

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "64px 24px 80px", display: "flex", gap: 32 }}>

        {/* Sidebar */}
        <aside style={{ width: 200, flexShrink: 0 }}>
          <div style={{ background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 20, padding: "20px 16px", position: "sticky", top: 88 }}>
            <Link href="/courses" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#7F77DD", textDecoration: "none", display: "block", marginBottom: 12 }}>
              ← All courses
            </Link>
            <div style={{ height: "0.5px", background: "rgba(180,160,240,0.25)", marginBottom: 12 }} />
            {courses.map(c => (
              <Link key={c.id} href={`/courses/${c.id}`} style={{
                display: "block", padding: "7px 10px", borderRadius: 10, fontSize: 13,
                color: String(c.id) === String(courseid) ? "#26215C" : "#7F77DD",
                fontWeight: String(c.id) === String(courseid) ? 500 : 400,
                background: String(c.id) === String(courseid) ? "rgba(180,160,240,0.2)" : "transparent",
                textDecoration: "none", marginBottom: 2,
              }}>{c.title}</Link>
            ))}
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1 }}>
          <header style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 500, color: "#26215C", margin: "0 0 12px" }}>
              {course.title}
            </h1>
            {course.image_url && (
              <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 20 }}>
                <img src={course.image_url} alt={course.title} style={{ width: "100%", height: 280, objectFit: "cover" }} />
              </div>
            )}
            <p style={{ fontSize: 15, color: "#534AB7", lineHeight: 1.7, margin: 0 }}>{course.description}</p>
          </header>

          <div style={{ height: "0.5px", background: "rgba(180,160,240,0.25)", marginBottom: 32 }} />

          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 500, color: "#26215C", margin: 0 }}>Modules</h2>
              <ProgressDots total={modules.length} completed={completedModules} />
              <span style={{ fontSize: 12, color: "#7F77DD" }}>{completedModules}/{modules.length} completed</span>
            </div>

            {modules.length === 0 ? (
              <p style={{ color: "#7F77DD", fontSize: 14 }}>No modules yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {modules.map(module => {
                  const lessons = moduleLessons[module.id] || [];
                  const progress = moduleProgress[module.id] || 0;
                  const completed = progress === 1;
                  const isOpen = openModule === module.id;

                  return (
                    <div key={module.id} style={{ background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 16, overflow: "hidden" }}>
                      <button onClick={() => setOpenModule(isOpen ? null : module.id)} style={{
                        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer",
                      }}>
                        <span style={{ fontSize: 15, fontWeight: 500, color: completed ? "#3B6D11" : "#3C3489" }}>
                          {completed ? "✓ " : ""}{module.title}
                        </span>
                        <span style={{ fontSize: 12, color: "#7F77DD" }}>{isOpen ? "▲" : "▼"}</span>
                      </button>

                      {isOpen && (
                        <div style={{ borderTop: "0.5px solid rgba(180,160,240,0.2)", padding: "12px 20px 16px" }}>
                          {lessons.length === 0 ? (
                            <p style={{ fontSize: 13, color: "#7F77DD" }}>No lessons yet.</p>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {lessons.map(lesson => (
                                <Link key={lesson.id} href={`/courses/${courseid}/${module.id}/${lesson.id}`} style={{
                                  display: "block", padding: "10px 14px", borderRadius: 10,
                                  background: "rgba(180,160,240,0.1)", border: "0.5px solid rgba(180,160,240,0.2)",
                                  fontSize: 14, color: "#534AB7", textDecoration: "none", fontWeight: 400,
                                }}>
                                  {lesson.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}