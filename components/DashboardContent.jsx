// components/DashboardContent.jsx
"use client";

import React, { useState } from "react";
import {
  ChevronDown, Home, LayoutDashboard, CheckSquare, FileText,
  BookOpen, User, Briefcase, Calendar, MessageCircle,
  Plus, X, Upload, Clock, AlertTriangle, LogOut
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  const menuItems = [
    { label: "Home", icon: <Home className="w-5 h-5" /> },
    { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "My Tasks", icon: <CheckSquare className="w-5 h-5" /> },
    { label: "Reports", icon: <FileText className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <Image width={150} height={150} alt="logo" src="/overlax.svg" />
          </div>

          <nav className="flex-1 flex justify-center">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all ${
                    item.label === "My Tasks"
                      ? "bg-[#E6F5FC] text-[#0084FF] shadow-sm"
                      : "text-slate-700 hover:bg-white"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.displayName?.[0]?.toUpperCase() || "U"
                )}
              </div>
              <span className="text-sm font-medium text-slate-700">
                {user.displayName || user.email?.split("@")[0] || "User"}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <a href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  <User className="w-4 h-4" /> Profile
                </a>
                <hr className="my-1 border-slate-200" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 bg-white border-r border-slate-200 p-6 space-y-6">
          <button className="bg-[#039BE5] w-full rounded-md text-white font-semibold py-3 flex items-center justify-center gap-1 hover:bg-[#0288d1]">
            Add Category
            <Image width={30} height={30} alt="plus" src="/plus.svg" />
          </button>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Task Categories</h2>
            <div className="space-y-2">
              {[
                { name: "All Tasks", icon: <CheckSquare className="w-5 h-5" />, count: 24 },
                { name: "Academic", icon: <BookOpen className="w-5 h-5" />, count: 8 },
                { name: "Personal", icon: <User className="w-5 h-5" />, count: 10 },
                { name: "Work", icon: <Briefcase className="w-5 h-5" />, count: 6 },
              ].map((cat) => (
                <button
                  key={cat.name}
                  className="w-full flex items-center justify-between p-3 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    {cat.icon}
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Integrations</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-700 hover:bg-slate-50">
                <MessageCircle className="w-5 h-5 text-[#0088cc]" />
                <span className="font-medium">Telegram</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-700 hover:bg-slate-50">
                <Calendar className="w-5 h-5 text-[#ea4335]" />
                <span className="font-medium">Google Calendar</span>
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-[#E6F5FC] overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-lg shadow-sm border">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Task Due Today</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">5</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm border">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Upcoming Deadline</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm border">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Conflict Detection</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">2</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full bg-[#B1BCC1] hover:bg-slate-500 text-white font-medium py-3 rounded-md flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Task
                </button>
              </div>

              <div className="space-y-4">
                <input type="date" className="w-full px-4 py-3 border rounded-md text-lg" />
                <div className="bg-white p-2 rounded-lg shadow-sm border">
                  <iframe
                    src="https://calendar.google.com/calendar/embed?height=500&wkst=1&ctz=UTC"
                    className="w-full h-96 border-0 rounded"
                    title="Google Calendar"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex justify-between">
              <h3 className="text-xl font-semibold">Add New Task</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <input type="text" placeholder="Task Title" className="w-full px-4 py-3 border rounded-md" />
            <select className="w-full px-4 py-3 border rounded-md">
              <option>Select Task Type</option>
              <option>Academic</option>
              <option>Personal</option>
              <option>Work</option>
            </select>
            <input type="date" className="w-full px-4 py-3 border rounded-md" />
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowAddTask(true);
                }}
                className="flex-1 px-4 py-3 bg-[#039BE5] text-white rounded-md"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}