// app/auth/signup/page.jsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import toast, { Toaster } from "react-hot-toast";

export default function SignupPage() {
  const { signup, googleSignIn, githubSignIn } = useAuth(); // ← ADD githubSignIn
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Email/Password Sign-up
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cred = await signup(form.email, form.password);

      await updateProfile(cred.user, {
        displayName: `${form.firstName} ${form.lastName}`.trim(),
      });

      toast.success("Account created! Please log in.");
      router.push("/auth/login");
    } catch (err) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-in
  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (form.firstName && form.lastName && !result.user.displayName) {
        await updateProfile(result.user, {
          displayName: `${form.firstName} ${form.lastName}`.trim(),
        });
      }
      toast.success("Signed up with Google!");
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  // ← ADD GITHUB SIGN-UP
  const handleGithubSignup = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await githubSignIn();
      if (form.firstName && form.lastName && !result.user.displayName) {
        await updateProfile(result.user, {
          displayName: `${form.firstName} ${form.lastName}`.trim(),
        });
      }
      toast.success("Signed up with GitHub!");
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "GitHub sign-in failed");
      toast.error("GitHub sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />

      <header className="flex items-center justify-start p-6">
        <Link href="/" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-[#E6F5FC] backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-semibold text-center mb-8">Sign up</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Social Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loading ? "Signing up..." : "Sign up with Google"}
            </button>

            {/* ← GITHUB BUTTON */}
            <button
              onClick={handleGithubSignup}
              disabled={loading}
              className="w-full px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {loading ? "Signing up..." : "Sign up with GitHub"}
            </button>
          </div>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-slate-300" />
            <span className="text-sm text-slate-600">OR</span>
            <div className="flex-1 h-px bg-slate-300" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm text-slate-900">First name</label>
                <input
                  id="firstName" name="firstName" type="text" placeholder="Enter your first name"
                  value={form.firstName} onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
                  required disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm text-slate-900">Last name</label>
                <input
                  id="lastName" name="lastName" type="text" placeholder="Enter your last name"
                  value={form.lastName} onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
                  required disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm text-slate-900">Email address</label>
              <input
                id="email" name="email" type="email" placeholder="Enter your email"
                value={form.email} onChange={handleChange}
                className="w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
                required disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm text-slate-900">Password</label>
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  disabled={loading}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                  <span className="text-xs">{showPassword ? "Hide" : "Show"}</span>
                </button>
              </div>
              <input
                id="password" name="password" type={showPassword ? "text" : "password"}
                placeholder="Enter your password" value={form.password} onChange={handleChange}
                className="w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400"
                required minLength={6} disabled={loading}
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full px-4 py-2 bg-[#B1BCC1] hover:bg-slate-500 text-white rounded-md transition-colors font-medium disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-600">
            <p>
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-slate-900 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}