"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SoftButton from "@/app/components/SoftButton";
import SoftDropdown from "@/app/components/SoftDropdown";

interface Quiz {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  quiz: Quiz[];
}

interface Module {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
  open: boolean;
}

export default function ModuleCreatorPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  /* ==================== Auth Check ==================== */
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);

    fetch("http://127.0.0.1:5000/api/user/profile", {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data.role !== "admin") router.push("/");
      })
      .catch(() => router.push("/login"))
      .finally(() => setCheckingAuth(false));
  }, [router]);

  /* ==================== Module & Lesson Handlers ==================== */
  const addModule = () =>
    setModules((prev) => [
      ...prev,
      { id: Date.now(), title: "", description: "", lessons: [], open: true },
    ]);

  const updateModule = (id: number, key: string, value: any) =>
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, [key]: value } : m)));

  const removeModule = (id: number) =>
    setModules((prev) => prev.filter((m) => m.id !== id));

  const addLesson = (moduleId: number) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: [...m.lessons, { id: Date.now(), title: "", content: "", quiz: [] }],
            }
          : m
      )
    );

  const updateLesson = (mid: number, lid: number, key: string, value: any) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === mid
          ? {
              ...m,
              lessons: m.lessons.map((l) => (l.id === lid ? { ...l, [key]: value } : l)),
            }
          : m
      )
    );

  const removeLesson = (mid: number, lid: number) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === mid ? { ...m, lessons: m.lessons.filter((l) => l.id !== lid) } : m
      )
    );

  /* ==================== Quiz Handlers ==================== */
  const addQuestion = (mid: number, lid: number) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === mid
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lid
                  ? {
                      ...l,
                      quiz: [
                        ...l.quiz,
                        { id: Date.now(), question: "", options: ["", ""], correctAnswer: "" },
                      ],
                    }
                  : l
              ),
            }
          : m
      )
    );

  const updateQuestion = (mid: number, lid: number, qid: number, key: string, value: any) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === mid
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lid
                  ? {
                      ...l,
                      quiz: l.quiz.map((q) => (q.id === qid ? { ...q, [key]: value } : q)),
                    }
                  : l
              ),
            }
          : m
      )
    );

  const addOption = (mid: number, lid: number, qid: number) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === mid
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lid
                  ? {
                      ...l,
                      quiz: l.quiz.map((q) =>
                        q.id === qid ? { ...q, options: [...q.options, ""] } : q
                      ),
                    }
                  : l
              ),
            }
          : m
      )
    );

  const updateOption = (mid: number, lid: number, qid: number, index: number, value: string) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === mid
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lid
                  ? {
                      ...l,
                      quiz: l.quiz.map((q) =>
                        q.id === qid ? { ...q, options: q.options.map((o, i) => (i === index ? value : o)) } : q
                      ),
                    }
                  : l
              ),
            }
          : m
      )
    );

  const removeOption = (mid: number, lid: number, qid: number, index: number) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === mid
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lid
                  ? {
                      ...l,
                      quiz: l.quiz.map((q) => {
                        if (q.id === qid) {
                          const newOptions = q.options.filter((_, i) => i !== index);
                          return {
                            ...q,
                            options: newOptions,
                            correctAnswer: newOptions.includes(q.correctAnswer) ? q.correctAnswer : "",
                          };
                        }
                        return q;
                      }),
                    }
                  : l
              ),
            }
          : m
      )
    );

  const removeQuestion = (mid: number, lid: number, qid: number) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === mid
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lid ? { ...l, quiz: l.quiz.filter((q) => q.id !== qid) } : l
              ),
            }
          : m
      )
    );

  /* ==================== Validation ==================== */
  const validate = () => {
    if (!title || !description) return "Course title and description required";
    for (const m of modules) {
      if (!m.title) return "Each module must have a title";
      for (const l of m.lessons) {
        if (!l.title) return "Each lesson must have a title";
        for (const q of l.quiz) {
          if (!q.correctAnswer) return "Each quiz question needs a correct answer";
          if (!q.options.includes(q.correctAnswer)) return "Correct answer must match an option";
        }
      }
    }
    return null;
  };

  /* ==================== Submit ==================== */
  const handleSubmit = async () => {
    if (!token) return;

    const error = validate();
    if (error) return alert(error);

    try {
      // Create course
      const courseRes = await fetch("http://127.0.0.1:5000/courses", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!courseRes.ok) throw new Error("Failed to create course");
      const courseData = await courseRes.json();
      const courseId = courseData.course_id;

      // Create modules, lessons, quizzes
      for (const module of modules) {
        const moduleRes = await fetch("http://127.0.0.1:5000/modules", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ title: module.title, description: module.description, course_id: courseId }),
        });
        const moduleData = await moduleRes.json();
        const moduleId = moduleData.module_id;

        for (const lesson of module.lessons) {
          const lessonRes = await fetch("http://127.0.0.1:5000/lessons", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              title: lesson.title,
              module_id: moduleId,
              text_content: lesson.content,
              content_type: "text",
            }),
          });
          const lessonData = await lessonRes.json();
          const lessonId = lessonData.lesson_id;

          for (const q of lesson.quiz) {
            await fetch("http://127.0.0.1:5000/quizzes", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                lesson_id: lessonId,
                question: q.question,
                options: q.options,
                correct_option: q.correctAnswer,
              }),
            });
          }
        }
      }

      alert("Course saved successfully!");
      setTitle("");
      setDescription("");
      setModules([]);
    } catch (err) {
      alert("Error saving course");
      console.error(err);
    }
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-fuchsia-50">
        <p>Checking access...</p>
      </main>
    );
  }

  /* ==================== Render ==================== */
  return (
    <main className="min-h-screen bg-[#efefef] px-6 md:px-10 py-10">
      <section className="max-w-4xl mx-auto space-y-6">

        {/* Course Info */}
        <div className="rounded-3xl p-6 md:p-10 bg-[#efefef] shadow-[-12px_12px_24px_rgba(0,0,0,0.2),12px_-12px_24px_rgba(255,255,255,0.9)] space-y-4">
          <input
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded"
          />
          <textarea
            placeholder="Course Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded"
          />
        </div>

        {/* Modules */}
        {modules.map((m) => (
          <SoftDropdown
            key={m.id}
            label={m.title || "Untitled Module"}
            items={m.lessons.map((l) => ({
              content: (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <strong>{l.title || "Untitled Lesson"}</strong>
                    <SoftButton width="w-auto" onClick={() => removeLesson(m.id, l.id)}>
                      Remove Lesson
                    </SoftButton>
                  </div>

                  <input
                    placeholder="Lesson Title"
                    value={l.title}
                    onChange={(e) => updateLesson(m.id, l.id, "title", e.target.value)}
                    className="w-full border rounded p-2"
                  />
                  <textarea
                    placeholder="Lesson Content"
                    value={l.content}
                    onChange={(e) => updateLesson(m.id, l.id, "content", e.target.value)}
                    className="w-full border rounded p-2"
                  />

                  {/* Quiz Section */}
                  {l.quiz.map((q) => (
                    <div key={q.id} className="rounded-lg border p-3 space-y-2 bg-white">
                      <input
                        placeholder="Question"
                        value={q.question}
                        onChange={(e) => updateQuestion(m.id, l.id, q.id, "question", e.target.value)}
                        className="w-full border rounded p-2"
                      />
                      {q.options.map((o, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input
                            value={o}
                            onChange={(e) => updateOption(m.id, l.id, q.id, i, e.target.value)}
                            className="flex-1 border rounded p-2"
                          />
                          <SoftButton width="w-auto" onClick={() => removeOption(m.id, l.id, q.id, i)}>
                            x
                          </SoftButton>
                        </div>
                      ))}
                      <SoftButton width="w-auto" onClick={() => addOption(m.id, l.id, q.id)}>
                        Add Option
                      </SoftButton>
                      <select
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion(m.id, l.id, q.id, "correctAnswer", e.target.value)}
                        className="w-full border rounded p-2"
                      >
                        <option value="">Correct Answer</option>
                        {q.options.map((o, i) => (
                          <option key={i} value={o}>{o || `Option ${i + 1}`}</option>
                        ))}
                      </select>
                      <SoftButton width="w-auto" onClick={() => removeQuestion(m.id, l.id, q.id)}>
                        Remove Question
                      </SoftButton>
                    </div>
                  ))}
                  <SoftButton width="w-auto" onClick={() => addQuestion(m.id, l.id)}>
                    Add Question
                  </SoftButton>
                </div>
              ),
            }))}
          />
        ))}

        <SoftButton width="w-full" onClick={addModule}>
          Add Module
        </SoftButton>

        <SoftButton width="w-full" onClick={handleSubmit}>
          Save Course
        </SoftButton>
      </section>
    </main>
  );
}