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

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // 1) User profile
        const profileRes = await fetch(
          'https://cs3028.onrender.com/api/user/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!profileRes.ok) {
          throw new Error('Failed to load profile');
        }

        const profileData = await profileRes.json();
        setProfile(profileData);

        // 2) Courses (for now, treat all as "current courses")
        const coursesRes = await fetch('https://cs3028.onrender.com/courses', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (coursesRes.ok) {
          const data = await coursesRes.json();
          const mapped = data.map((c: any) => ({
            course_id: c.id,
            title: c.title,
            description: c.description,
          }));
          setCourses(mapped);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const firstName =
    profile?.name?.split(' ')[0] ||
    (profile?.email ? profile.email.split('@')[0] : 'Member');
  const lastName = profile?.name?.split(' ').slice(1).join(' ') || '';
  const username =
    profile?.email?.split('@')[0] ||
    profile?.name?.toLowerCase().replace(/\s+/g, '') ||
    'user';

  return (
    <main className="min-h-screen container mx-auto p-4">
      <div className="rounded-3xl bg-white/90 shadow-lg p-6 md:p-10">
        {loading ? (
          <p className="text-gray-600">Loading profile…</p>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
            <p className="text-sm text-gray-600 mt-2">
              Please check that the backend is running and try refreshing the
              page.
            </p>
          </div>
        ) : !profile ? (
          <p className="text-gray-600">
            No profile data found. Please log in again.
          </p>
        ) : (
          <>
            {/* Top section: avatar + name + basic info */}
            <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                {/* Avatar (initial) */}
                <div className="h-20 w-20 rounded-full bg-fuchsia-600 text-white flex items-center justify-center text-2xl font-semibold">
                  {firstName.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {firstName} {lastName}
                  </h1>
                  <p className="text-sm text-gray-500">@{username}</p>
                  <p className="text-sm text-gray-500">
                    {profile.role === 'admin' ? 'Admin' : 'Member'}
                    {profile.date_joined
                      ? ` · Joined ${profile.date_joined}`
                      : null}
                  </p>
                </div>
              </div>

              {/* Right-side: stats + CTA */}
              <div className="flex flex-col items-start md:items-end gap-2">
                {profile.learning_progress && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-800">
                      Learning progress
                    </p>
                    <p>
                      {profile.learning_progress.completed_lessons} of{' '}
                      {profile.learning_progress.total_lessons} lessons ·{' '}
                      {profile.learning_progress.progress_percent}%
                    </p>
                  </div>
                )}

                {/* 🔗 SAME path as header: /courses */}
                <Link
                  href="/courses"
                  className="mt-2 inline-flex items-center px-4 py-2 rounded-xl bg-fuchsia-600 text-white text-sm font-medium hover:bg-fuchsia-700 transition"
                >
                  View course catalogue
                </Link>
              </div>
            </section>

            {/* "Your current courses" */}
            <section>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                Your current courses
              </h2>

              {courses.length === 0 ? (
                <div className="rounded-2xl bg-fuchsia-50 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <p className="text-gray-700">
                    You’re not enrolled in any courses yet.
                  </p>
                  <Link
                    href="/courses"
                    className="inline-flex items-center px-4 py-2 rounded-xl bg-fuchsia-600 text-white text-sm font-medium hover:bg-fuchsia-700 transition"
                  >
                    Explore courses
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Continue where you left off, or discover something new.
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    {courses.slice(0, 6).map((course) => (
                      <Link
                        key={course.course_id}
                        href={`/courses/${course.course_id}`} // 🔗 same as ModulesPage
                        className="block rounded-2xl bg-fuchsia-50 hover:bg-fuchsia-100 transition shadow-sm hover:shadow-md p-5"
                      >
                        <h3 className="text-lg font-semibold text-fuchsia-700 mb-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {course.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
