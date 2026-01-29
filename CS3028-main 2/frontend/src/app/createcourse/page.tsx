"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);

    fetch("https://cs3028.onrender.com/api/user/profile", {
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
      { id: Date.now(), title: "", description: "", lessons: [], open: true },
    ]);

  const updateModule = (id: number, key: string, value: any) =>
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, [key]: value } : m)));

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
                      quiz: [...l.quiz, { id: Date.now(), question: "", options: ["", ""], correctAnswer: "" }],
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

  const handleSubmit = async () => {
    if (!token) return;

    const error = validate();
    if (error) return alert(error);

    // Create course
    const courseRes = await fetch("https://cs3028.onrender.com/courses", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (!courseRes.ok) return alert("Failed to create course");
    const courseData = await courseRes.json();
    const courseId = courseData.course_id;

    // Create modules, lessons, quizzes
    for (const module of modules) {
      const moduleRes = await fetch("https://cs3028.onrender.com/modules", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: module.title, description: module.description, course_id: courseId }),
      });
      const moduleData = await moduleRes.json();
      const moduleId = moduleData.module_id;

      for (const lesson of module.lessons) {
        const lessonRes = await fetch("https://cs3028.onrender.com/lessons", {
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
          await fetch("https://cs3028.onrender.com/quizzes", {
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
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-fuchsia-50">
        <p>Checking access</p>
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
            <div className="flex justify-between mb-2">
              <button onClick={() => toggleModule(m.id)}>{m.open ? "Hide" : "Show"}</button>
              <button className="text-red-600" onClick={() => removeModule(m.id)}>Remove</button>
            </div>

            <input
              placeholder="Module Title"
              value={m.title}
              onChange={(e) => updateModule(m.id, "title", e.target.value)}
              className="w-full border rounded p-2 mb-2"
            />

            <textarea
              placeholder="Module Description"
              value={m.description}
              onChange={(e) => updateModule(m.id, "description", e.target.value)}
              className="w-full border rounded p-2 mb-3"
            />

            {m.open &&
              m.lessons.map((l) => (
                <div key={l.id} className="bg-white p-3 rounded border mb-3">
                  <div className="flex justify-between mb-2">
                    <strong>Lesson</strong>
                    <button className="text-red-600" onClick={() => removeLesson(m.id, l.id)}>Remove</button>
                  </div>

                  <input
                    placeholder="Lesson Title"
                    value={l.title}
                    onChange={(e) => updateLesson(m.id, l.id, "title", e.target.value)}
                    className="w-full border rounded p-2 mb-2"
                  />

                  <textarea
                    placeholder="Lesson Content"
                    value={l.content}
                    onChange={(e) => updateLesson(m.id, l.id, "content", e.target.value)}
                    className="w-full border rounded p-2 mb-2"
                  />

                  {l.quiz.map((q) => (
                    <div key={q.id} className="mb-3 border-t pt-3">
                      <input
                        placeholder="Question"
                        value={q.question}
                        onChange={(e) => updateQuestion(m.id, l.id, q.id, "question", e.target.value)}
                        className="w-full border p-2 rounded mb-2"
                      />

                      {q.options.map((o, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <input
                            value={o}
                            onChange={(e) => updateOption(m.id, l.id, q.id, i, e.target.value)}
                            className="flex-1 border p-2 rounded"
                          />
                          <button onClick={() => removeOption(m.id, l.id, q.id, i)} className="text-red-600">x</button>
                        </div>
                      ))}

                      <button onClick={() => addOption(m.id, l.id, q.id)} className="text-sm mb-2">Add Option</button>

                      <select
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion(m.id, l.id, q.id, "correctAnswer", e.target.value)}
                        className="w-full border p-2 rounded mb-2"
                      >
                        <option value="">Correct Answer</option>
                        {q.options.map((o, i) => (
                          <option key={i} value={o}>{o || `Option ${i + 1}`}</option>
                        ))}
                      </select>

                      <button onClick={() => removeQuestion(m.id, l.id, q.id)} className="text-red-600 text-sm">Remove Question</button>
                    </div>
                  ))}

                  <button onClick={() => addQuestion(m.id, l.id)}>Add Question</button>
                </div>
              ))}

            <button onClick={() => addLesson(m.id)}>Add Lesson</button>
          </div>
        ))}

        <button onClick={addModule} className="block w-full bg-fuchsia-600 text-white py-3 rounded mb-4">Add Module</button>

        <button onClick={handleSubmit} className="block w-full bg-green-600 text-white py-3 rounded">Save Course</button>
      </section>
    </main>
  );
}
