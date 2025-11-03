"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  // Reset form (optional: for demo)
  const handleReset = () => {
    setEmail("");
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-start p-6">
        <Link
          href="/auth/login"
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Log in
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#E6F5FC] backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12">

          {/* === FORM STATE === */}
          {!submitted ? (
            <>
              <h1 className="text-3xl font-semibold text-center mb-6">Forgot Password?</h1>
              <p className="text-sm text-slate-600 text-center mb-8">
                Enter your email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm text-slate-900">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white/80 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                    required
                  />
                </div>

                {/* Button with rounded-md */}
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-[#B1BCC1] hover:bg-slate-500 text-white rounded-md transition-colors font-medium"
                >
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            /* === SUCCESS STATE === */
            <>
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h1 className="text-3xl font-semibold mb-4">Check Your Email</h1>
                <p className="text-sm text-slate-600 mb-2">
                  We sent a password reset link to
                </p>
                <p className="text-sm font-medium text-slate-900 mb-8">{email}</p>

                <div className="space-y-3">
                  <button
                    onClick={handleReset}
                    className="w-full px-4 py-2 bg-[#B1BCC1] hover:bg-slate-500 text-white rounded-md transition-colors font-medium"
                  >
                    Send Another Link
                  </button>

                  <Link
                    href="/auth/login"
                    className="w-full inline-block px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-md transition-colors font-medium text-center"
                  >
                    Back to Log in
                  </Link>
                </div>

                <p className="mt-6 text-xs text-slate-500">
                  Didn’t receive the email? Check your spam folder or try again.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}