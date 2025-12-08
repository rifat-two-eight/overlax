"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Zap,
  Bell,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  const [deadlineCount, setDeadlineCount] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const counter = setInterval(() => {
      setDeadlineCount((prev) => (prev < 247 ? prev + 7 : 247));
    }, 30);
    return () => clearInterval(counter);
  }, []);

  const features = [
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Reminders",
      desc: "AI-powered notifications that learn your habits",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Conflict Detection",
      desc: "Automatically spots overlapping deadlines",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Beautiful Experience",
      desc: "Designed to make productivity feel effortless",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
    },
  ];

  const floatingElements = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    delay: i * 0.7,
    duration: 3 + i * 0.5,
    startX: 10 + i * 20,
    startY: 10 + i * 15,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((el) => (
          <div
            key={el.id}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
            style={{
              left: `${el.startX}%`,
              top: `${el.startY}%`,
              animation: `float ${el.duration}s ease-in-out infinite`,
              animationDelay: `${el.delay}s`,
              transform: `translate(${
                (mousePosition.x - window.innerWidth / 2) / 50
              }px, ${(mousePosition.y - window.innerHeight / 2) / 50}px)`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div
          className="relative z-10"
          style={{ animation: "slide-up 0.8s ease-out" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full mb-6 shadow-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-slate-700">
              {deadlineCount} deadlines crushed today
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Never Miss
            </span>
            <br />
            <span className="text-slate-900">a Deadline Again</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Your intelligent workspace for managing tasks, tracking deadlines,
            and staying ahead of the chaos.{" "}
            <span className="font-semibold text-slate-800">Overlax</span> makes
            productivity feel natural.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
              <Link href="/auth/login">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <Clock className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </span>
              </Link>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {/* Visual Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl -z-10" />
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-slate-200">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Why Choose Overlax?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built with cutting-edge features to transform how you manage your
              time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className={`relative group cursor-pointer transition-all duration-500 ${
                  activeFeature === idx ? "scale-105" : "scale-100"
                }`}
                onMouseEnter={() => setActiveFeature(idx)}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity`}
                />

                <div
                  className={`relative ${
                    feature.bgColor
                  } backdrop-blur-sm p-8 rounded-2xl border-2 ${
                    activeFeature === idx
                      ? "border-slate-300 shadow-2xl"
                      : "border-transparent shadow-lg"
                  } transition-all duration-500`}
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg transform group-hover:rotate-12 transition-transform`}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="font-bold text-xl mb-3 text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="text-slate-600 leading-relaxed">
                    {feature.desc}
                  </p>

                  {activeFeature === idx && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <div
                        className="absolute inset-0 bg-green-500 rounded-full animate-ping"
                        style={{
                          animation:
                            "pulse-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

            <div className="relative z-10">
              <Calendar className="w-16 h-16 text-white mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Take Control?
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Join thousands of professionals who have mastered their
                schedules
              </p>
              <button className="px-10 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-xl">
                Start Your Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
