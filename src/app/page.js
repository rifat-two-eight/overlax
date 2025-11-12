// app/page.jsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
          Never Miss a Deadline Again
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
          Overlax helps you organize tasks, track deadlines, and get smart reminders —
          all in one beautiful dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-[#0084FF] text-white font-medium rounded-md hover:bg-[#0066cc] transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            href="/dashboard/main"
            className="px-8 py-3 bg-white text-[#0084FF] font-medium rounded-md border border-[#0084FF] hover:bg-slate-50 transition-colors"
          >
            View Demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Overlax?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Smart Reminders", desc: "Get notified before deadlines." },
              { title: "Conflict Detection", desc: "Avoid overlapping tasks." },
              { title: "Beautiful UI", desc: "Clean, modern, and fast." },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-16 h-16 bg-[#E6F5FC] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-8 h-8 bg-[#0084FF] rounded-full"></div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}