'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LearningProgress {
  completed_lessons: number;
  total_lessons: number;
  progress_percent: number;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  date_joined?: string;
  learning_progress?: LearningProgress;
  certificate_status?: string;
}

interface Course {
  course_id: number;
  title: string;
  description: string;
}

const BUBBLES = [
  { w: 300, h: 300, top: -80, left: -100 },
  { w: 150, h: 150, top: 60, right: 40 },
  { w: 400, h: 400, top: 400, right: -150 },
  { w: 100, h: 100, top: 600, left: 80 },
  { w: 200, h: 200, bottom: 100, left: -60 },
  { w: 120, h: 120, bottom: 80, right: 100 },
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/login'); return; }

    const fetchData = async () => {
      try {
        const profileRes = await fetch('process.env.NEXT_PUBLIC_API_URL/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error('Failed to load profile');
        setProfile(await profileRes.json());

        const coursesRes = await fetch('process.env.NEXT_PUBLIC_API_URL/courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (coursesRes.ok) {
          const data = await coursesRes.json();
          setCourses(data.map((c: any) => ({ course_id: c.id, title: c.title, description: c.description })));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const firstName = profile?.name?.split(' ')[0] || profile?.email?.split('@')[0] || 'Member';
  const lastName = profile?.name?.split(' ').slice(1).join(' ') || '';
  const username = profile?.email?.split('@')[0] || 'user';
  const progress = profile?.learning_progress;
  const progressPercent = progress ? Math.round(progress.progress_percent) : 0;

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

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "64px 24px 80px" }}>

        {loading ? (
          <p style={{ color: "#7F77DD" }}>Loading profile...</p>
        ) : error ? (
          <div style={{ background: "rgba(255,255,255,0.55)", borderRadius: 20, padding: 24 }}>
            <p style={{ color: "#A32D2D", fontSize: 14 }}>{error}</p>
          </div>
        ) : !profile ? (
          <p style={{ color: "#7F77DD" }}>No profile data found. Please log in again.</p>
        ) : (
          <>
            {/* Profile card */}
            <div style={{
              background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)",
              borderRadius: 24, padding: "32px 28px", marginBottom: 28,
              display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 24,
            }}>
              {/* Avatar + info */}
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "#534AB7", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, fontWeight: 500, flexShrink: 0,
                }}>
                  {firstName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 500, color: "#26215C", margin: "0 0 4px" }}>
                    {firstName} {lastName}
                  </h1>
                  <p style={{ fontSize: 13, color: "#7F77DD", margin: "0 0 2px" }}>@{username}</p>
                  <p style={{ fontSize: 13, color: "#7F77DD", margin: 0 }}>
                    {profile.role === 'admin' ? 'Admin' : 'Member'}
                    {profile.date_joined ? ` · Joined ${profile.date_joined}` : ''}
                  </p>
                </div>
              </div>

              {/* Right side: progress + CTA */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                {progress && (
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#7F77DD", margin: "0 0 6px" }}>
                      Learning progress
                    </p>
                    <p style={{ fontSize: 13, color: "#534AB7", margin: "0 0 8px" }}>
                      {progress.completed_lessons} of {progress.total_lessons} lessons · {progressPercent}%
                    </p>
                    <div style={{ width: 180, height: 6, background: "rgba(180,160,240,0.2)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${progressPercent}%`, background: "#534AB7", borderRadius: 99, transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                )}
                <Link href="/courses" style={{
                  fontSize: 13, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
                  padding: "9px 20px", borderRadius: 12, textDecoration: "none",
                  background: "#534AB7", color: "#fff",
                  boxShadow: "0 4px 14px rgba(83,74,183,0.25)",
                }}>
                  View courses
                </Link>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(180,160,240,0.25)", marginBottom: 32 }} />

            {/* Courses section */}
            <section>
              <h2 style={{ fontSize: 22, fontWeight: 500, color: "#26215C", margin: "0 0 6px" }}>
                Your courses
              </h2>
              <p style={{ fontSize: 14, color: "#7F77DD", margin: "0 0 24px" }}>
                Continue where you left off, or discover something new.
              </p>

              {courses.length === 0 ? (
                <div style={{ background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 20, padding: "28px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                  <p style={{ fontSize: 14, color: "#534AB7", margin: 0 }}>You're not enrolled in any courses yet.</p>
                  <Link href="/courses" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", padding: "9px 20px", borderRadius: 12, textDecoration: "none", background: "#534AB7", color: "#fff" }}>
                    Explore courses
                  </Link>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                  {courses.slice(0, 6).map(course => (
                    <Link key={course.course_id} href={`/courses/${course.course_id}`} style={{
                      display: "block", textDecoration: "none",
                      background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)",
                      borderRadius: 20, padding: "22px 20px",
                    }}>
                      <h3 style={{ fontSize: 16, fontWeight: 500, color: "#3C3489", margin: "0 0 8px" }}>
                        {course.title}
                      </h3>
                      <p style={{ fontSize: 13, color: "#534AB7", margin: 0, lineHeight: 1.6,
                        overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const,
                      }}>
                        {course.description}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Footer strip */}
            <div style={{ marginTop: 80, textAlign: "center" }}>
              <div style={{ height: 1, background: "rgba(180,160,240,0.25)", marginBottom: 32 }} />
              <p style={{ fontSize: 13, color: "#7F77DD", margin: 0 }}>
                Built to support endometriosis awareness · Free for everyone
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
