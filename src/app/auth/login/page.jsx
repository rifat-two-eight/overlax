// app/auth/login/page.jsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const { login, googleSignIn } = useAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      router.push("/dashboard/main");
    } catch (err) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await googleSignIn();
      router.push("/dashboard/main");
    } catch (err) {
      setError(err.message || "Google login failed");
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
        <div className="w-full max-w-4xl bg-[#E6F5FC] backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl font-semibold text-center mb-12">Log in</h1>

          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-[1.5fr_0.5fr_1.5fr] gap-8 items-center">
            {/* Left: Form */}
            <div className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
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
                    required disabled={loading}
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full px-4 py-2 bg-[#B1BCC1] hover:bg-slate-500 text-white rounded-md transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? "Logging in..." : "Log in"}
                </button>
              </form>
            </div>

            {/* Divider */}
            <div className="flex justify-center items-center">
              <div className="hidden md:flex flex-col items-center gap-4 h-full">
                <div className="h-32 w-px bg-slate-300" />
                <span className="text-sm text-slate-600 whitespace-nowrap">OR</span>
                <div className="h-32 w-px bg-slate-300" />
              </div>
              <div className="md:hidden flex items-center gap-4 w-full">
                <div className="flex-1 h-px bg-slate-300" />
                <span className="text-sm text-slate-600">OR</span>
                <div className="flex-1 h-px bg-slate-300" />
              </div>
            </div>

            {/* Right: Google */}
            <div className="space-y-3 flex flex-col justify-center">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>

          <div className="mt-12 text-center space-y-3">
            <p className="text-sm text-slate-700">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="font-medium text-slate-900 hover:underline">
                Sign up
              </Link>
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
              <Link href="/auth/forgot" className="hover:underline">
                Forgot password?
              </Link>
              <span>·</span>
              <span>
                Secured with reCAPTCHA ·{" "}
                <Link href="#" className="underline hover:text-slate-900">Privacy</Link>{" "}
                &{" "}
                <Link href="#" className="underline hover:text-slate-900">Terms</Link>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}