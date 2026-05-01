"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

// Maps each page to the most relevant help section
const CONTEXT_MAP: Record<string, string> = {
  "/": "getting-started",
  "/login": "getting-started",
  "/signup": "getting-started",
  "/courses": "courses",
  "/profile": "profile",
  "/createcourse": "admin-courses",
};

function getHelpSection(pathname: string): string {
  if (CONTEXT_MAP[pathname]) return CONTEXT_MAP[pathname];
  if (pathname.includes("/edit")) return "admin-courses";
  if (pathname.match(/\/courses\/\d+\/\d+\/\d+/)) return "admin-quiz";
  if (pathname.match(/\/courses\/\d+\/\d+/)) return "courses";
  if (pathname.match(/\/courses\/\d+/)) return "courses";
  return "getting-started";
}

export default function HelpButton() {
  const pathname = usePathname();

  // Don't show on the help page itself
  if (pathname === "/help") return null;

  const section = getHelpSection(pathname);

  return (
    <Link
      href={`/help#${section}`}
      title="Help"
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 999,
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "#534AB7",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        fontWeight: 700,
        textDecoration: "none",
        boxShadow: "0 4px 20px rgba(83,74,183,0.4)",
        border: "2px solid rgba(255,255,255,0.3)",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(83,74,183,0.5)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(83,74,183,0.4)";
      }}
    >
      ?
    </Link>
  );
}