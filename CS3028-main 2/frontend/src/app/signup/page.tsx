'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('https://cs3028.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,     
          email,
          password   
  }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      window.location.href = '/login';
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-fuchsia-700">
        Create an Account
      </h2>

      {error && (
        <p className="text-red-600 text-sm text-center mb-4">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-fuchsia-500 focus:border-fuchsia-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-fuchsia-600 text-white p-2 rounded-md hover:bg-fuchsia-700 transition disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-4 text-sm text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-fuchsia-600 hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
}