"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Course {
  id: number;
  title: string;
  description: string;
}

interface CourseModuleProgress {
  totalModules: number;
  completedModules: number;
}

const BUBBLES = [
  { w: 300, h: 300, top: -80,  left: -100 },
  { w: 150, h: 150, top: 60,   right: 40  },
  { w: 80,  h: 80,  top: 300,  left: 200  },
  { w: 400, h: 400, top: 400,  right: -150},
  { w: 100, h: 100, top: 600,  left: 80   },
  { w: 60,  h: 60,  top: 800,  right: 300 },
  { w: 200, h: 200, bottom: 200, left: -60},
  { w: 120, h: 120, bottom: 80,  right: 100},
  { w: 50,  h: 50,  bottom: 300, left: 350},
];

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<{ [key: number]: CourseModuleProgress }>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const fetchCourses = async () => {
      try {
        const res = await fetch("process.env.NEXT_PUBLIC_API_URL/courses", { headers });
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        const sliced = data.slice(0, 3);
        setCourses(sliced);

        const newProgress: { [key: number]: CourseModuleProgress } = {};
        await Promise.all(
          sliced.map(async (course: any) => {
            const modulesRes = await fetch(
              `process.env.NEXT_PUBLIC_API_URL/courses/${course.id}/modules`,
              { headers }
            );
            const modules = modulesRes.ok ? await modulesRes.json() : [];
            newProgress[course.id] = { totalModules: modules.length, completedModules: 0 };
          })
        );
        setProgressMap(newProgress);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#f0eeff", position: "relative", overflowX: "hidden" }}>
      {BUBBLES.map((b, i) => (
        <div
          key={i}
          style={{
            position: "fixed",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.35)",
            border: "1px solid rgba(255,255,255,0.55)",
            width: b.w,
            height: b.h,
            top:    (b as any).top    !== undefined ? (b as any).top    : "auto",
            bottom: (b as any).bottom !== undefined ? (b as any).bottom : "auto",
            left:   (b as any).left   !== undefined ? (b as any).left   : "auto",
            right:  (b as any).right  !== undefined ? (b as any).right  : "auto",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "80px 24px 80px" }}>

        {/* ===== Hero ===== */}
        <section style={{ textAlign: "center", marginBottom: 80 }}>
          <span style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 500,
            padding: "5px 14px",
            borderRadius: 20,
            background: "rgba(255,255,255,0.7)",
            color: "#534AB7",
            border: "0.5px solid rgba(180,160,240,0.4)",
            marginBottom: 20,
          }}>
            Endometriosis awareness
          </span>

          <h1 style={{
            fontSize: "clamp(32px, 6vw, 52px)",
            fontWeight: 500,
            color: "#26215C",
            margin: "0 0 16px",
            lineHeight: 1.2,
          }}>
            Knowledge is the first step
          </h1>

          <p style={{
            fontSize: 17,
            color: "#534AB7",
            maxWidth: 480,
            margin: "0 auto 32px",
            lineHeight: 1.7,
          }}>
            Structured courses to help you understand, manage, and navigate endometriosis.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
            <Link href="/courses" style={{
              background: "#534AB7",
              color: "#fff",
              fontSize: 15,
              fontWeight: 500,
              padding: "12px 32px",
              borderRadius: 14,
              boxShadow: "0 4px 20px rgba(83,74,183,0.35)",
              textDecoration: "none",
            }}>
              Get started
            </Link>
            <Link href="/courses" style={{
              background: "rgba(255,255,255,0.7)",
              color: "#534AB7",
              fontSize: 15,
              fontWeight: 500,
              padding: "12px 32px",
              borderRadius: 14,
              border: "0.5px solid rgba(180,160,240,0.5)",
              textDecoration: "none",
            }}>
              Browse courses
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, maxWidth: 420, margin: "0 auto" }}>
            {[
              { num: courses.length || "—", label: "Courses" },
              { num: 48, label: "Lessons" },
              { num: "Free", label: "Always" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.55)",
                border: "0.5px solid rgba(255,255,255,0.8)",
                borderRadius: 16,
                padding: "16px 8px",
              }}>
                <p style={{ fontSize: 26, fontWeight: 500, color: "#3C3489", margin: "0 0 4px" }}>{s.num}</p>
                <p style={{ fontSize: 12, color: "#7F77DD", margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Divider ===== */}
        <div style={{ height: 1, background: "rgba(180,160,240,0.25)", marginBottom: 64 }} />

        {/* ===== Featured Courses ===== */}
        <section>
          <h2 style={{ fontSize: 30, fontWeight: 500, color: "#26215C", margin: "0 0 8px" }}>
            Featured courses
          </h2>
          <p style={{ fontSize: 15, color: "#7F77DD", margin: "0 0 36px" }}>
            Start with one of our most popular learning paths.
          </p>

          {loading ? (
            <p style={{ color: "#7F77DD" }}>Loading...</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {courses.map((course) => {
                const progress = progressMap[course.id] || { totalModules: 0, completedModules: 0 };
                return (
                  <div key={course.id} style={{
                    background: "rgba(255,255,255,0.55)",
                    border: "0.5px solid rgba(255,255,255,0.8)",
                    borderRadius: 20,
                    padding: "24px 20px 20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 16,
                  }}>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 500, color: "#3C3489", margin: "0 0 8px" }}>
                        {course.title}
                      </h3>
                      <p style={{ fontSize: 13, color: "#534AB7", margin: "0 0 16px", lineHeight: 1.6 }}>
                        {course.description}
                      </p>
                      <p style={{ fontSize: 12, color: "#7F77DD", margin: 0 }}>
                        {progress.totalModules === 0
                          ? "No modules yet"
                          : `${progress.completedModules} of ${progress.totalModules} modules completed`}
                      </p>
                    </div>
                    <Link href={`/courses/${course.id}`} style={{
                      display: "block",
                      textAlign: "center",
                      background: isLoggedIn ? "#534AB7" : "rgba(255,255,255,0.7)",
                      color: isLoggedIn ? "#fff" : "#534AB7",
                      fontSize: 14,
                      fontWeight: 500,
                      padding: "10px 20px",
                      borderRadius: 12,
                      border: isLoggedIn ? "none" : "0.5px solid rgba(180,160,240,0.5)",
                      textDecoration: "none",
                      boxShadow: isLoggedIn ? "0 4px 14px rgba(83,74,183,0.25)" : "none",
                    }}>
                      {isLoggedIn ? "Continue" : "Preview"}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ===== Footer strip ===== */}
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
