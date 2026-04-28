"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    const storedRole = localStorage.getItem("role");
    setToken(storedToken);
    setRole(storedRole);

    if (storedToken) {
      fetch("http://127.0.0.1:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${storedToken}` },
      }).then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("role");
          setToken(null);
          setRole(null);
          router.push("/");
        }
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
    setOpen(false);
    router.push("/login");
  };

  const isLoggedIn = !!token;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const navLink = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      onClick={() => setOpen(false)}
      style={{
        fontSize: 14,
        fontWeight: pathname === href ? 500 : 400,
        color: pathname === href ? "#26215C" : "#534AB7",
        textDecoration: "none",
        padding: "6px 12px",
        borderRadius: 10,
        background: pathname === href ? "rgba(180,160,240,0.2)" : "transparent",
        whiteSpace: "nowrap" as const,
      }}
    >
      {label}
    </Link>
  );

  return (
    <header style={{
      background: "rgba(240, 238, 255, 0.85)",
      backdropFilter: "blur(12px)",
      borderBottom: "0.5px solid rgba(180,160,240,0.3)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <nav style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "14px 12px 14px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
      }}>
        {/* Logo — left aligned */}
        <Link href="/" style={{ flexShrink: 0 }}>
          <Image src="/logo.png" alt="Logo" width={110} height={32} priority />
        </Link>

        {/* ===== Desktop nav ===== */}
<div style={{
  display: "flex",
  alignItems: "center",
  gap: 4,
}} className="desktop-nav">
  {navLink("/courses", "Courses")}
  {navLink("/profile", "Profile")}

  {!isLoggedIn ? (
    <>
      {navLink("/login", "Log in")}
      <Link href="/signup" style={{
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: "#fff",
        background: "#534AB7",
        padding: "7px 18px",
        borderRadius: 10,
        textDecoration: "none",
        marginLeft: 8,
        boxShadow: "0 2px 10px rgba(83,74,183,0.25)",
      }}>
        Sign up
      </Link>
    </>
  ) : (
    <button
      onClick={handleLogout}
      style={{
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: "#A32D2D",
        background: "transparent",
        border: "0.5px solid rgba(163,45,45,0.3)",
        padding: "6px 14px",
        borderRadius: 10,
        cursor: "pointer",
        marginLeft: 8,
      }}
    >
      Log out
    </button>
  )}
</div>
        {/* ===== Mobile hamburger ===== */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Open navigation menu"
          className="mobile-nav-btn"
          style={{
            display: "none",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
            padding: "8px 10px",
            borderRadius: 12,
            border: "0.5px solid rgba(180,160,240,0.5)",
            background: "rgba(255,255,255,0.6)",
            cursor: "pointer",
          }}
        >
          {[0,1,2].map(i => (
            <span key={i} style={{
              display: "block",
              width: 18,
              height: 2,
              borderRadius: 2,
              background: "#534AB7",
            }} />
          ))}
        </button>

        {/* Mobile dropdown */}
        {open && (
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              right: 16,
              top: 68,
              width: 200,
              borderRadius: 20,
              background: "rgba(245, 242, 255, 0.95)",
              backdropFilter: "blur(16px)",
              border: "0.5px solid rgba(180,160,240,0.4)",
              boxShadow: "0 8px 32px rgba(83,74,183,0.15)",
              zIndex: 200,
              padding: 16,
            }}
          >
            {isLoggedIn && (
              <div style={{
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom: "0.5px solid rgba(180,160,240,0.3)",
              }}>
                <p style={{ fontSize: 10, color: "#7F77DD", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>
                  Signed in as
                </p>
                <p style={{ fontSize: 14, fontWeight: 500, color: "#26215C", margin: 0 }}>
                  {role === "admin" ? "Admin" : "Member"}
                </p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {navLink("/courses", "Courses")}
              {navLink("/profile", "Profile")}

              {!isLoggedIn ? (
                <>
                  {navLink("/login", "Log in")}
                  {navLink("/signup", "Sign up")}
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  style={{
                    marginTop: 8,
                    padding: "8px 10px",
                    borderRadius: 10,
                    fontSize: 14,
                    color: "#A32D2D",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  Log out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}