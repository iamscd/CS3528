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

  // Close menu on click outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto flex justify-between items-center px-4 py-3 relative">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Health Learn Logo"
            width={140}
            height={40}
            priority
          />
        </Link>

        {/* Trigger button (3 lines) */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex flex-col justify-center items-center gap-[3px] p-2 rounded-full border border-fuchsia-300 hover:bg-fuchsia-50 transition"
          aria-label="Open navigation menu"
        >
          <span className="w-5 h-[2px] bg-fuchsia-600 rounded" />
          <span className="w-5 h-[2px] bg-fuchsia-600 rounded" />
          <span className="w-5 h-[2px] bg-fuchsia-600 rounded" />
        </button>

        {open && (
          <div
            ref={menuRef}
            className="
              fixed
              right-4 top-22
              w-52
              rounded-3xl
              bg-gradient-to-b from-fuchsia-50 to-fuchsia-100
              shadow-2xl
              border border-fuchsia-200/70
              z-50
              p-4
            "
          >
            {isLoggedIn && (
              <div className="mb-3 border-b border-fuchsia-100 pb-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Currently signed in
                </p>
                <p className="mt-1 font-semibold text-fuchsia-800">
                  {role === "admin" ? "Admin" : "Member"}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1 text-sm">
              {/* Profile – always visible */}
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className={`px-2 py-2 rounded-lg transition ${
                  pathname === "/profile"
                    ? "bg-fuchsia-200 text-fuchsia-800"
                    : "hover:bg-fuchsia-100 text-gray-800"
                }`}
              >
                Profile{isLoggedIn && role === "admin" ? " (Admin)" : ""}
              </Link>

              {/* Course Catalogue */}
              <Link
                href="/courses"
                onClick={() => setOpen(false)}
                className={`px-2 py-2 rounded-lg transition ${
                  pathname === "/courses"
                    ? "bg-fuchsia-200 text-fuchsia-800"
                    : "hover:bg-fuchsia-100 text-gray-800"
                }`}
              >
                Course Catalogue
              </Link>

              {/* When logged OUT */}
              {!isLoggedIn && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className={`px-2 py-2 rounded-lg transition ${
                      pathname === "/login"
                        ? "bg-fuchsia-200 text-fuchsia-800"
                        : "hover:bg-fuchsia-100 text-gray-800"
                    }`}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className={`px-2 py-2 rounded-lg transition ${
                      pathname === "/signup"
                        ? "bg-fuchsia-200 text-fuchsia-800"
                        : "hover:bg-fuchsia-100 text-gray-800"
                    }`}
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {/* When logged IN */}
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="mt-1 px-2 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 transition"
                >
                  Log Out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}