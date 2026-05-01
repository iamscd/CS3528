"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BUBBLES = [
  { w: 300, h: 300, top: -80, left: -100 },
  { w: 150, h: 150, top: 60, right: 40 },
  { w: 400, h: 400, top: 500, right: -150 },
  { w: 200, h: 200, bottom: 100, left: -60 },
  { w: 80, h: 80, top: 300, left: 200 },
];

interface FAQItem {
  q: string;
  a: string;
}

interface Section {
  id: string;
  title: string;
  icon: string;
  adminOnly?: boolean;
  items: FAQItem[];
}

const SECTIONS: Section[] = [
  {
    id: "getting-started",
    title: "Getting started",
    icon: "🚀",
    items: [
      { q: "How do I create an account?", a: "Click 'Sign up' in the top navigation bar. Fill in your name, email and password and you're ready to go." },
      { q: "How do I log in?", a: "Click 'Log in' in the navigation bar and enter your email and password." },
      { q: "I forgot my password. What do I do?", a: "Contact the platform administrator to reset your password." },
    ]
  },
  {
    id: "courses",
    title: "Courses & lessons",
    icon: "📚",
    items: [
      { q: "How do I start a course?", a: "Go to the Courses page, find a course you'd like to take, and click 'Continue'. This takes you to the course overview where you can see all modules and lessons." },
      { q: "How do I complete a lesson?", a: "Open a lesson by clicking on it. Read through the content and answer any quiz questions at the bottom. Once all quiz questions are answered correctly the lesson is marked as complete." },
      { q: "How do I track my progress?", a: "Your progress is shown on the course page as a progress bar and module completion dots. You can also see your overall progress on your Profile page." },
      { q: "Can I revisit lessons I've already completed?", a: "Yes — completed lessons stay accessible. You can go back and re-read them or review quiz answers at any time." },
    ]
  },
  {
    id: "contact",
    title: "Contact us",
    icon: "📬",
    items: [
      { q: "Website", a: "https://monikagostic.com/" },
      { q: "Address", a: "32 Badger Rise, Blackburn, Aberdeen AB21 0JY" },
      { q: "Phone", a: "07514 774536" },
    ]
  },
  {
    id: "profile",
    title: "Your profile",
    icon: "👤",
    items: [
      { q: "Where can I see my enrolled courses?", a: "Your Profile page shows all available courses and your overall learning progress." },
      { q: "How do I log out?", a: "Click 'LOG OUT' in the top navigation bar." },
    ]
  },
  {
    id: "admin-courses",
    title: "Managing courses (Admin)",
    icon: "⚙️",
    adminOnly: true,
    items: [
      { q: "How do I create a new course?", a: "Click '+ New course' on the Courses page (only visible to admins). Fill in the course title, description, and optionally upload a cover image. Then add modules and lessons." },
      { q: "How do I add modules and lessons to a course?", a: "On the Create course page, click '+ Add module' to add a module, then '+ Add lesson' inside that module. Each lesson can contain text, an image, or a video." },
      { q: "How do I edit an existing course?", a: "Go to the course page and click the 'Edit course' button next to the title (only visible to admins). You can change the title, description, and course image." },
      { q: "How do I delete a course?", a: "On the Courses page, each course card has a 'Delete' button (admin only). Click it and confirm to permanently remove the course and all its content." },
      { q: "How do I delete a module or lesson?", a: "On the course detail page, each module has a 'Delete module' button. Inside an open module, each lesson has a 'Delete' button next to it." },
    ]
  },
  {
    id: "admin-quiz",
    title: "Managing quizzes (Admin)",
    icon: "❓",
    adminOnly: true,
    items: [
      { q: "How do I add quiz questions to a lesson?", a: "Open a lesson as admin and scroll to the 'Manage quiz questions' section at the bottom. Click '+ Add question', fill in the question, options, and correct answer, then click 'Save question'." },
      { q: "How do I edit a quiz question?", a: "In the 'Manage quiz questions' section, click the 'Edit' button next to any question. Make your changes and click 'Save'." },
      { q: "How do I delete a quiz question?", a: "In the 'Manage quiz questions' section, click the 'Delete' button next to the question you want to remove." },
      { q: "How many options can a question have?", a: "You can add as many options as you like. Click '+ Add option' to add more, and the ✕ button to remove one (minimum 2 options required)." },
    ]
  },
];

export default function HelpPage() {
  const [role, setRole] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>("getting-started");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [hash, setHash] = useState("");

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    setHash(window.location.hash.replace("#", ""));
  }, []);

  useEffect(() => {
    if (hash) setOpenId(hash);
  }, [hash]);

  const visibleSections = SECTIONS.filter(s => !s.adminOnly || role === "admin");

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

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 500, color: "#26215C", margin: "0 0 10px" }}>
            Help centre
          </h1>
          <p style={{ fontSize: 15, color: "#7F77DD", margin: 0 }}>
            Find answers to common questions below.
            {role === "admin" && " Admin sections are included."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* Sidebar navigation */}
          <aside style={{ width: 200, flexShrink: 0, position: "sticky", top: 88 }}>
            <div style={{ background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 20, padding: "16px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#7F77DD", margin: "0 0 12px" }}>
                Topics
              </p>
              {visibleSections.map(s => (
                <button key={s.id} onClick={() => setOpenId(s.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                  padding: "8px 10px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: openId === s.id ? "rgba(83,74,183,0.12)" : "transparent",
                  color: openId === s.id ? "#26215C" : "#7F77DD",
                  fontSize: 13, fontWeight: openId === s.id ? 500 : 400,
                  textAlign: "left", marginBottom: 2,
                }}>
                  <span>{s.icon}</span>
                  <span>{s.title}</span>
                </button>
              ))}
              <div style={{ height: "0.5px", background: "rgba(180,160,240,0.25)", margin: "12px 0" }} />
              <Link href="/courses" style={{ fontSize: 12, color: "#534AB7", textDecoration: "none", fontWeight: 600 }}>
                ← Back to courses
              </Link>
            </div>
          </aside>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {visibleSections.map(section => (
              <div key={section.id} id={section.id} style={{
                display: openId === section.id ? "block" : "none",
              }}>
                <div style={{ background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 24, padding: "28px 24px", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <span style={{ fontSize: 28 }}>{section.icon}</span>
                    <h2 style={{ fontSize: 22, fontWeight: 500, color: "#26215C", margin: 0 }}>{section.title}</h2>
                    {section.adminOnly && (
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 20, background: "rgba(83,74,183,0.12)", color: "#534AB7" }}>
                        Admin
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {section.items.map((item, i) => (
                      <div key={i} style={{ border: "0.5px solid rgba(180,160,240,0.25)", borderRadius: 14, overflow: "hidden" }}>
                        <button
                          onClick={() => setOpenQuestion(openQuestion === `${section.id}-${i}` ? null : `${section.id}-${i}`)}
                          style={{
                            width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "14px 18px", background: openQuestion === `${section.id}-${i}` ? "rgba(83,74,183,0.06)" : "transparent",
                            border: "none", cursor: "pointer", textAlign: "left",
                          }}
                        >
                          <span style={{ fontSize: 14, fontWeight: 500, color: "#3C3489", flex: 1 }}>{item.q}</span>
                          <span style={{ fontSize: 12, color: "#7F77DD", marginLeft: 12, flexShrink: 0 }}>
                            {openQuestion === `${section.id}-${i}` ? "▲" : "▼"}
                          </span>
                        </button>
                        {openQuestion === `${section.id}-${i}` && (
                          <div style={{ padding: "0 18px 16px", borderTop: "0.5px solid rgba(180,160,240,0.2)" }}>
                            <p style={{ fontSize: 14, color: "#534AB7", lineHeight: 1.7, margin: "12px 0 0" }}>
                            {item.a.startsWith("http") ? (
                                <a href={item.a} target="_blank" rel="noopener noreferrer" style={{ color: "#534AB7", fontWeight: 600 }}>
                                {item.a}
                                </a>
                            ) : item.a}
                            </p>
                            </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 60, textAlign: "center" }}>
          <div style={{ height: 1, background: "rgba(180,160,240,0.25)", marginBottom: 24 }} />
          <p style={{ fontSize: 13, color: "#7F77DD", margin: 0 }}>
            Still need help? Contact the platform administrator.
          </p>
        </div>

      </div>
    </main>
  );
}