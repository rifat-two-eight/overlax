"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Zap,
  Bell,
  CheckCircle,
  Clock,
  Sparkles,
  LayoutDashboard,
  ListTodo,
  Target,
  TrendingUp,
  Users,
  ArrowRight,
  Play,
  CheckSquare,
  FolderOpen,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Animated counters
  useEffect(() => {
    const taskCounter = setInterval(() => {
      setTaskCount((prev) => (prev < 15420 ? prev + 127 : 15420));
    }, 20);

    const userCounter = setInterval(() => {
      setUserCount((prev) => (prev < 2840 ? prev + 31 : 2840));
    }, 30);

    const rateCounter = setInterval(() => {
      setCompletionRate((prev) => (prev < 94 ? prev + 1 : 94));
    }, 40);

    return () => {
      clearInterval(taskCounter);
      clearInterval(userCounter);
      clearInterval(rateCounter);
    };
  }, []);

  const features = [
    {
      icon: <ListTodo className="w-7 h-7" />,
      title: "Smart Task Management",
      desc: "Organize tasks with categories, deadlines, and priority levels",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: <Bell className="w-7 h-7" />,
      title: "Telegram Notifications",
      desc: "Get instant reminders 2 minutes before deadlines",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
    },
    {
      icon: <Calendar className="w-7 h-7" />,
      title: "Visual Calendar",
      desc: "See all your tasks in a beautiful calendar view",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: <AlertCircle className="w-7 h-7" />,
      title: "Conflict Detection",
      desc: "Automatically detects overlapping tasks and deadlines",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
    },
  ];

  const useCases = [
    {
      id: "personal",
      icon: <CheckSquare className="w-5 h-5" />,
      title: "Personal Tasks",
      tasks: [
        "Grocery shopping by 6 PM",
        "Dentist appointment tomorrow",
        "Finish reading book chapter",
      ],
    },
    {
      id: "work",
      icon: <Target className="w-5 h-5" />,
      title: "Work Projects",
      tasks: [
        "Submit quarterly report",
        "Client meeting preparation",
        "Code review by Friday",
      ],
    },
    {
      id: "study",
      icon: <FolderOpen className="w-5 h-5" />,
      title: "Academic",
      tasks: [
        "Assignment due Dec 15",
        "Exam preparation schedule",
        "Research paper draft",
      ],
    },
  ];

  const floatingElements = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 0.5,
    duration: 4 + i * 0.3,
    startX: 5 + i * 12,
    startY: 5 + i * 11,
  }));

  const stats = [
    {
      label: "Tasks Completed",
      value: taskCount.toLocaleString(),
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      label: "Active Users",
      value: userCount.toLocaleString(),
      icon: <Users className="w-6 h-6" />,
    },
    {
      label: "Success Rate",
      value: `${completionRate}%`,
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((el) => (
          <div
            key={el.id}
            className="absolute w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20"
            style={{
              left: `${el.startX}%`,
              top: `${el.startY}%`,
              animation: `float ${el.duration}s ease-in-out infinite`,
              animationDelay: `${el.delay}s`,
              transform: `translate(${
                (mousePosition.x -
                  (typeof window !== "undefined" ? window.innerWidth : 1920) /
                    2) /
                80
              }px, ${
                (mousePosition.y -
                  (typeof window !== "undefined" ? window.innerHeight : 1080) /
                    2) /
                80
              }px)`,
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
            transform: translateY(-30px) rotate(180deg);
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
        @keyframes slide-in-left {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-full mb-6 shadow-sm border border-blue-200/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-slate-700">
              {taskCount.toLocaleString()}+ tasks managed daily
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Master Your Tasks
            </span>
            <br />
            <span className="text-slate-900">Never Miss a Deadline</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            The intelligent task manager that keeps you organized with{" "}
            <span className="font-semibold text-blue-600">smart reminders</span>
            ,{" "}
            <span className="font-semibold text-purple-600">
              visual calendars
            </span>
            , and{" "}
            <span className="font-semibold text-pink-600">
              conflict detection
            </span>
            .
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/auth/signup">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>

            <Link href="/auth/login">
              <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                Sign In
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            {stats.map((stat, idx) => (
              <div
                key={stat.label}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200 hover:scale-105 transition-transform"
                style={{
                  animation: `slide-up 0.8s ease-out ${idx * 0.1}s both`,
                }}
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg text-white">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Task Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl -z-10" />
            <div className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <LayoutDashboard className="w-6 h-6 text-blue-600" />
                  Your Task Dashboard
                </h3>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 animate-pulse"
                    style={{
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: "2s",
                    }}
                  >
                    <div className="h-4 bg-slate-300 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Continues in next part */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need to Stay Organized
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to help you manage tasks effortlessly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className={`relative group cursor-pointer transition-all duration-500 ${
                  activeFeature === idx ? "scale-105" : "scale-100"
                }`}
                onMouseEnter={() => setActiveFeature(idx)}
                style={{
                  animation: `slide-up 0.6s ease-out ${idx * 0.1}s both`,
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity`}
                />

                <div
                  className={`relative ${
                    feature.bgColor
                  } backdrop-blur-sm p-6 rounded-2xl border-2 ${
                    activeFeature === idx
                      ? "border-slate-300 shadow-2xl"
                      : "border-transparent shadow-lg"
                  } transition-all duration-500`}
                >
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-4 flex items-center justify-center text-white shadow-lg transform group-hover:rotate-12 transition-transform`}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="font-bold text-lg mb-2 text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.desc}
                  </p>

                  {activeFeature === idx && (
                    <div className="absolute -top-2 -right-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Perfect for Every Scenario
            </h2>
            <p className="text-lg text-slate-600">
              Whether it is work, study, or personal life
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {useCases.map((useCase) => (
              <button
                key={useCase.id}
                onClick={() => setActiveTab(useCase.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  activeTab === useCase.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                    : "bg-white/80 text-slate-700 hover:bg-white"
                }`}
              >
                {useCase.icon}
                {useCase.title}
              </button>
            ))}
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-slate-200">
            {useCases
              .filter((uc) => uc.id === activeTab)
              .map((useCase) => (
                <div key={useCase.id} className="space-y-4">
                  {useCase.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 hover:scale-[1.02] transition-transform"
                      style={{
                        animation: `slide-in-left 0.4s ease-out ${
                          idx * 0.1
                        }s both`,
                      }}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-slate-800 font-medium flex-1">
                        {task}
                      </p>
                      <Clock className="w-5 h-5 text-slate-400" />
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

            <div className="relative z-10">
              <Sparkles className="w-16 h-16 text-white mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Get Organized?
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Join thousands of users managing their tasks efficiently
              </p>
              <Link href="/auth/signup">
                <button className="px-10 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-xl flex items-center gap-2 mx-auto">
                  Start Free Today
                  <Play className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
