"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Quiz {
  id: number;
  question: string;
  type: "multiple_choice" | "numeric";
  options: string[];
  correctAnswer: string;
  correctNumericAnswer: number | null;
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

  const addModule = () =>
    setModules((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "",
        description: "",
        lessons: [],
        open: true,
      },
    ]);

  const updateModule = (id: number, key: string, value: any) =>
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [key]: value } : m))
    );

  const removeModule = (id: number) =>
    setModules((prev) => prev.filter((m) => m.id !== id));

  const toggleModule = (id: number) =>
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, open: !m.open } : m))
    );

  const addLesson = (moduleId: number) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: [
                ...m.lessons,
                { id: Date.now(), title: "", content: "", quiz: [] },
              ],
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
              lessons: m.lessons.map((l) =>
                l.id === lid ? { ...l, [key]: value } : l
              ),
            }
          : m
      )
    );

  const removeLesson = (mid: number, lid: number) =>
    setModules((prev) =>
      prev.map((m) =>
        m.id === mid
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lid) }
          : m
      )
    );

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
                        {
                          id: Date.now(),
                          question: "",
                          type: "multiple_choice",
                          options: ["", ""],
                          correctAnswer: "",
                          correctNumericAnswer: null,
                        },
                      ],
                    }
                  : l
              ),
            }
          : m
      )
    );

  const updateQuestion = (
    mid: number,
    lid: number,
    qid: number,
    key: string,
    value: any
  ) =>
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
                        q.id === qid ? { ...q, [key]: value } : q
                      ),
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
                        q.id === qid
                          ? { ...q, options: [...q.options, ""] }
                          : q
                      ),
                    }
                  : l
              ),
            }
          : m
      )
    );

  const updateOption = (
    mid: number,
    lid: number,
    qid: number,
    index: number,
    value: string
  ) =>
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
                        q.id === qid
                          ? {
                              ...q,
                              options: q.options.map((o, i) =>
                                i === index ? value : o
                              ),
                            }
                          : q
                      ),
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
                l.id === lid
                  ? { ...l, quiz: l.quiz.filter((q) => q.id !== qid) }
                  : l
              ),
            }
          : m
      )
    );

  const validate = () => {
    if (!title || !description) return "Course title and description required";

    for (const m of modules) {
      if (!m.title) return "Each module must have a title";

      for (const l of m.lessons) {
        if (!l.title) return "Each lesson must have a title";

        for (const q of l.quiz) {
          if (!q.question) return "Every question must have text";

          if (q.type === "multiple_choice") {
            if (!q.correctAnswer)
              return "Multiple choice questions need a correct answer";
          }

          if (q.type === "numeric") {
            if (q.correctNumericAnswer === null)
              return "Numeric questions need an answer";
          }
        }
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!token) return;

    const error = validate();
    if (error) return alert(error);

    const courseRes = await fetch("http://127.0.0.1:5000/courses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description }),
    });

    const courseData = await courseRes.json();
    const courseId = courseData.course_id;

    for (const module of modules) {
      const moduleRes = await fetch("http://127.0.0.1:5000/modules", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: module.title,
          description: module.description,
          course_id: courseId,
        }),
      });

      const moduleData = await moduleRes.json();
      const moduleId = moduleData.module_id;

      for (const lesson of module.lessons) {
        const lessonRes = await fetch("http://127.0.0.1:5000/lessons", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
          const payload: any = {
            lesson_id: lessonId,
            question: q.question,
          };

          if (q.type === "multiple_choice") {
            payload.options = q.options;
            payload.correct_option = q.correctAnswer;
          } else {
            payload.correct_numeric_answer = q.correctNumericAnswer;
          }

          await fetch("http://127.0.0.1:5000/quizzes", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        }
      }
    }

    alert("Course saved successfully!");
    setTitle("");
    setDescription("");
    setModules([]);
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Checking access...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-fuchsia-50 to-white p-8">
      <section className="max-w-4xl mx-auto bg-white shadow p-6 rounded-2xl">
        <input
          placeholder="Course Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 border rounded mb-3"
        />

        <textarea
          placeholder="Course Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border rounded mb-6"
        />

        {modules.map((m) => (
          <div key={m.id} className="border rounded p-4 mb-4 bg-fuchsia-50">
            <input
              placeholder="Module Title"
              value={m.title}
              onChange={(e) => updateModule(m.id, "title", e.target.value)}
              className="w-full border rounded p-2 mb-2"
            />

            {m.lessons.map((l) => (
              <div key={l.id} className="bg-white p-3 rounded border mb-3">
                <input
                  placeholder="Lesson Title"
                  value={l.title}
                  onChange={(e) =>
                    updateLesson(m.id, l.id, "title", e.target.value)
                  }
                  className="w-full border rounded p-2 mb-2"
                />

                {l.quiz.map((q) => (
                  <div key={q.id} className="border-t pt-3 mt-3">
                    <input
                      placeholder="Question"
                      value={q.question}
                      onChange={(e) =>
                        updateQuestion(
                          m.id,
                          l.id,
                          q.id,
                          "question",
                          e.target.value
                        )
                      }
                      className="w-full border p-2 rounded mb-2"
                    />

                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateQuestion(
                          m.id,
                          l.id,
                          q.id,
                          "type",
                          e.target.value
                        )
                      }
                      className="border p-2 rounded mb-2"
                    >
                      <option value="multiple_choice">
                        Multiple Choice
                      </option>
                      <option value="numeric">Numeric Answer</option>
                    </select>

                    {q.type === "multiple_choice" && (
                      <>
                        {q.options.map((o, i) => (
                          <input
                            key={i}
                            value={o}
                            onChange={(e) =>
                              updateOption(
                                m.id,
                                l.id,
                                q.id,
                                i,
                                e.target.value
                              )
                            }
                            className="w-full border p-2 rounded mb-2"
                          />
                        ))}

                        <select
                          value={q.correctAnswer}
                          onChange={(e) =>
                            updateQuestion(
                              m.id,
                              l.id,
                              q.id,
                              "correctAnswer",
                              e.target.value
                            )
                          }
                          className="w-full border p-2 rounded"
                        >
                          <option value="">Correct Answer</option>
                          {q.options.map((o, i) => (
                            <option key={i} value={o}>
                              {o || `Option ${i + 1}`}
                            </option>
                          ))}
                        </select>
                      </>
                    )}

                    {q.type === "numeric" && (
                      <input
                        type="number"
                        placeholder="Correct Numeric Answer"
                        value={q.correctNumericAnswer ?? ""}
                        onChange={(e) =>
                          updateQuestion(
                            m.id,
                            l.id,
                            q.id,
                            "correctNumericAnswer",
                            Number(e.target.value)
                          )
                        }
                        className="w-full border p-2 rounded"
                      />
                    )}
                  </div>
                ))}

                <button onClick={() => addQuestion(m.id, l.id)}>
                  Add Question
                </button>
              </div>
            ))}

            <button onClick={() => addLesson(m.id)}>Add Lesson</button>
          </div>
        ))}

        <button
          onClick={addModule}
          className="block w-full bg-fuchsia-600 text-white py-3 rounded mb-4"
        >
          Add Module
        </button>

        <button
          onClick={handleSubmit}
          className="block w-full bg-green-600 text-white py-3 rounded"
        >
          Save Course
        </button>
      </section>
    </main>
  );
}