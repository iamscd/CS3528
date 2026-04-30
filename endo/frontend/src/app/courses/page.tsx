"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Course {
  course_id: number;
  title: string;
  description: string;
}

interface CourseModuleProgress {
  totalModules: number;
  completedModules: number;
}

type ViewMode = "grid" | "list";

const BUBBLES = [
  { w: 300, h: 300, top: -80,  left: -100 },
  { w: 150, h: 150, top: 60,   right: 40  },
  { w: 80,  h: 80,  top: 300,  left: 200  },
  { w: 400, h: 400, top: 400,  right: -150},
  { w: 100, h: 100, top: 600,  left: 80   },
  { w: 60,  h: 60,  top: 800,  right: 300 },
  { w: 200, h: 200, bottom: 200, left: -60},
  { w: 120, h: 120, bottom: 80,  right: 100},
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<{ [key: number]: CourseModuleProgress }>({});
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("grid");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
    setRole(localStorage.getItem("role"));

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const fetchCoursesAndProgress = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses", { headers });
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();

        const mapped: Course[] = data.map((c: any) => ({
          course_id: c.id,
          title: c.title,
          description: c.description,
        }));
        setCourses(mapped);

        const newProgress: { [key: number]: CourseModuleProgress } = {};
        await Promise.all(
          mapped.map(async (course) => {
            const modulesRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/courses/${course.course_id}/modules`,
              { headers }
            );
            const modules = modulesRes.ok ? await modulesRes.json() : [];
            let completedModules = 0;

            for (const module of modules) {
              const lessonsRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/modules/${module.id}/lessons`,
                { headers }
              );
              const lessons = lessonsRes.ok ? await lessonsRes.json() : [];
              if (!lessons.length) continue;

              const progressChecks = await Promise.all(
                lessons.map((lesson: any) =>
                  fetch(`${process.env.NEXT_PUBLIC_API_URL}/lessons/${lesson.id}/progress`, { headers }).then((r) => r.json())
                )
              );
              if (progressChecks.every((p) => p.is_completed)) completedModules++;
            }

            newProgress[course.course_id] = { totalModules: modules.length, completedModules };
          })
        );
        setProgressMap(newProgress);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndProgress();
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#f0eeff", position: "relative", overflowX: "hidden" }}>

      {/* Background bubbles */}
      {BUBBLES.map((b, i) => (
        <div key={i} style={{
          position: "absolute",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.35)",
          border: "1px solid rgba(255,255,255,0.55)",
          width: b.w, height: b.h,
          top:    (b as any).top    !== undefined ? (b as any).top    : "auto",
          bottom: (b as any).bottom !== undefined ? (b as any).bottom : "auto",
          left:   (b as any).left   !== undefined ? (b as any).left   : "auto",
          right:  (b as any).right  !== undefined ? (b as any).right  : "auto",
          pointerEvents: "none", zIndex: 0,
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "64px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 500, color: "#26215C", margin: "0 0 8px" }}>
              Browse courses
            </h1>
            <p style={{ fontSize: 15, color: "#7F77DD", margin: 0 }}>
              Explore interactive lessons at your own pace.
            </p>
          </div>

          {/* View toggle + admin button */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {role === "admin" && (
              <Link href="/createcourse" style={{
                fontSize: 13, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", color: "#fff", background: "#534AB7",
                padding: "8px 16px", borderRadius: 10, textDecoration: "none",
                boxShadow: "0 2px 10px rgba(83,74,183,0.25)", marginRight: 8,
              }}>
                + New course
              </Link>
            )}
            {(["grid", "list"] as ViewMode[]).map((v) => (
              <button key={v} onClick={() => setView(v)} style={{
                fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase", padding: "8px 16px", borderRadius: 10,
                border: "0.5px solid rgba(180,160,240,0.4)", cursor: "pointer",
                background: view === v ? "rgba(83,74,183,0.15)" : "rgba(255,255,255,0.55)",
                color: view === v ? "#26215C" : "#7F77DD",
                boxShadow: view === v ? "inset 2px 2px 6px rgba(0,0,0,0.08)" : "none",
              }}>
                {v === "grid" ? "Grid" : "List"}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(180,160,240,0.25)", marginBottom: 40 }} />

        {/* Content */}
        {loading ? (
          <p style={{ color: "#7F77DD" }}>Loading...</p>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: view === "grid" ? "repeat(auto-fit, minmax(260px, 1fr))" : "1fr",
            gap: 20,
          }}>
            {courses.map((course) => {
              const progress = progressMap[course.course_id] || { totalModules: 0, completedModules: 0 };
              const completed = progress.totalModules > 0 && progress.completedModules === progress.totalModules;

              return (
                <div key={course.course_id} style={{
                  background: "rgba(255,255,255,0.55)",
                  border: "0.5px solid rgba(255,255,255,0.8)",
                  borderRadius: 20,
                  padding: "24px 20px 20px",
                  display: "flex",
                  flexDirection: view === "grid" ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: view === "list" ? "center" : "stretch",
                  gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 500, color: "#3C3489", margin: "0 0 8px" }}>
                      {course.title}
                    </h3>
                    {view === "grid" && (
                      <p style={{ fontSize: 13, color: "#534AB7", margin: "0 0 16px", lineHeight: 1.6 }}>
                        {course.description}
                      </p>
                    )}
                    <p style={{ fontSize: 12, color: "#7F77DD", margin: 0 }}>
                      {progress.totalModules === 0
                        ? "No modules yet"
                        : `${progress.completedModules} of ${progress.totalModules} modules completed`}
                    </p>
                  </div>

                  <div style={{ flexShrink: 0, display: "flex", gap: 8, alignItems: "center" }}>
                    {role === "admin" && (
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!confirm(`Delete "${course.title}"?`)) return;
                          const token = localStorage.getItem("access_token");
                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${course.course_id}`, {
                            method: "DELETE",
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (res.ok) setCourses(prev => prev.filter(c => c.course_id !== course.course_id));
                          else alert("Failed to delete course");
                        }}
                        style={{
                          fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                          padding: "9px 16px", borderRadius: 12, border: "0.5px solid rgba(163,45,45,0.3)",
                          background: "transparent", color: "#A32D2D", cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    )}
                    <Link href={`/courses/${course.course_id}`} style={{
                      display: "inline-block",
                      fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: completed ? "#3C3489" : isLoggedIn ? "#fff" : "#534AB7",
                      background: completed ? "rgba(180,160,240,0.2)" : isLoggedIn ? "#534AB7" : "rgba(255,255,255,0.7)",
                      padding: "9px 20px", borderRadius: 12,
                      border: isLoggedIn && !completed ? "none" : "0.5px solid rgba(180,160,240,0.5)",
                      textDecoration: "none",
                      boxShadow: isLoggedIn && !completed ? "0 4px 14px rgba(83,74,183,0.25)" : "none",
                      pointerEvents: isLoggedIn ? "auto" : "none",
                      opacity: isLoggedIn ? 1 : 0.6,
                    }}>
                      {completed ? "Completed" : isLoggedIn ? "Continue" : "Preview"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer strip */}
        <div style={{ marginTop: 80, textAlign: "center" }}>
          <div style={{ height: 1, background: "rgba(180,160,240,0.25)", marginBottom: 32 }} />
          <p style={{ fontSize: 13, color: "#7F77DD", margin: 0 }}>
            Built to support endometriosis awareness · Free for everyone
          </p>
        </div>

      </div>
    </main>
  );
}
