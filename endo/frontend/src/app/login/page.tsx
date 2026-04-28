'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function decodeJWT(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

const BUBBLES = [
  { w: 300, h: 300, top: -80, left: -100 },
  { w: 150, h: 150, top: 40, right: 40 },
  { w: 400, h: 400, bottom: -150, right: -120 },
  { w: 100, h: 100, bottom: 80, left: 60 },
  { w: 60, h: 60, top: 200, left: 300 },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14,
  border: "0.5px solid rgba(180,160,240,0.4)", background: "rgba(255,255,255,0.7)",
  color: "#26215C", outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
  textTransform: "uppercase" as const, color: "#7F77DD", display: "block", marginBottom: 6,
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      const token = data.access_token;
      localStorage.setItem('access_token', token);
      const decoded = decodeJWT(token);
      localStorage.setItem('role', decoded?.role || 'member');
      window.location.href = '/courses';
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f0eeff", position: "relative", overflowX: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {BUBBLES.map((b, i) => (
        <div key={i} style={{
          position: "fixed", borderRadius: "50%",
          background: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.55)",
          width: b.w, height: b.h,
          top: (b as any).top ?? "auto", bottom: (b as any).bottom ?? "auto",
          left: (b as any).left ?? "auto", right: (b as any).right ?? "auto",
          pointerEvents: "none", zIndex: 0,
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, padding: "0 24px" }}>
        <div style={{ background: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.8)", borderRadius: 24, padding: "40px 32px" }}>

          <h1 style={{ fontSize: 28, fontWeight: 500, color: "#26215C", margin: "0 0 6px", textAlign: "center" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: "#7F77DD", textAlign: "center", margin: "0 0 32px" }}>
            Log in to continue your learning
          </p>

          {error && (
            <div style={{ background: "rgba(163,45,45,0.08)", border: "0.5px solid rgba(163,45,45,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "#A32D2D", margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required style={inputStyle}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                marginTop: 8, fontSize: 13, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", padding: "13px", borderRadius: 12, border: "none",
                background: loading ? "rgba(83,74,183,0.5)" : "#534AB7",
                color: "#fff", cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 18px rgba(83,74,183,0.25)",
              }}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div style={{ height: "0.5px", background: "rgba(180,160,240,0.25)", margin: "24px 0" }} />

          <p style={{ fontSize: 13, color: "#7F77DD", textAlign: "center", margin: 0 }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: "#534AB7", fontWeight: 600, textDecoration: "none" }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}