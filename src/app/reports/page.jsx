"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Settings,
  Save,
  X,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { auth } from "@/firebase.config";
import { onAuthStateChanged } from "firebase/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Format date utilities
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const addMonths = (date, months) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];

  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Next month days
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  return days;
};

export default function PressureDashboard() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [pressureCount, setPressureCount] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Pressure settings with defaults
  const [pressureSettings, setPressureSettings] = useState({
    low: 3,
    medium: 5,
    high: 7,
    critical: 8,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const token = await currentUser.getIdToken();
        setIdToken(token);
        await fetchUserSettings(currentUser.uid, token);
        await fetchCategories(currentUser.uid, token);
        await fetchTasks(currentUser.uid, token);
      } else {
        setTasks([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserSettings = async (uid, token) => {
    try {
      const res = await fetch(`${API_URL}/api/pressure-settings/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setPressureSettings(data.settings);
        }
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
  };

  const fetchCategories = async (uid, token) => {
    try {
      const res = await fetch(`${API_URL}/api/categories/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchTasks = async (uid, token) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const { tasks } = await res.json();
      setTasks(tasks || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Filter tasks by selected category
  const getFilteredTasks = () => {
    if (selectedCategory === "All") return tasks;
    return tasks.filter((t) => t.category === selectedCategory);
  };

  const filteredTasks = getFilteredTasks();

  // Calculate pressure based on filtered tasks
  useEffect(() => {
    calculatePressure(filteredTasks);
  }, [filteredTasks, selectedCategory]);

  const calculatePressure = (taskList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingTasks = taskList.filter((t) => {
      if (!t.deadline || t.completed) return false;
      const taskDate = new Date(t.deadline);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate >= today;
    });

    setPressureCount(upcomingTasks.length);
  };

  const getPressureLevel = () => {
    if (pressureCount <= pressureSettings.low) {
      return {
        level: "Low",
        color: "text-green-600",
        bg: "bg-green-500",
        borderColor: "border-green-500",
        gradient: "from-green-400 to-green-600",
      };
    }
    if (pressureCount <= pressureSettings.medium) {
      return {
        level: "Medium",
        color: "text-orange-600",
        bg: "bg-orange-500",
        borderColor: "border-orange-500",
        gradient: "from-orange-400 to-orange-600",
      };
    }
    if (pressureCount <= pressureSettings.high) {
      return {
        level: "High",
        color: "text-red-600",
        bg: "bg-red-500",
        borderColor: "border-red-500",
        gradient: "from-red-400 to-red-600",
      };
    }
    return {
      level: "Critical",
      color: "text-red-700",
      bg: "bg-red-600",
      borderColor: "border-red-700",
      gradient: "from-red-600 to-red-800",
    };
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/pressure-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: user.uid,
          settings: pressureSettings,
        }),
      });

      if (res.ok) {
        setShowSettingsModal(false);
        alert("Settings saved successfully!");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Failed to save settings");
    }
  };

  // Generate suggestions for conflicts
  const generateSuggestions = () => {
    const suggestions = [];
    const today = new Date();
    const tasksByDate = {};

    // Group tasks by date
    filteredTasks.forEach((t) => {
      if (!t.deadline || t.completed) return;
      const dateKey = new Date(t.deadline).toDateString();
      if (!tasksByDate[dateKey]) tasksByDate[dateKey] = [];
      tasksByDate[dateKey].push(t);
    });

    // Find conflicts (multiple tasks on same day)
    Object.entries(tasksByDate).forEach(([dateKey, tasksOnDate]) => {
      if (tasksOnDate.length >= 2) {
        const taskDate = new Date(dateKey);
        const daysUntil = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));

        suggestions.push({
          type: "conflict",
          text: `${
            tasksOnDate.length
          } tasks overlap on ${taskDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })} - Consider rescheduling some tasks`,
          tasks: tasksOnDate.map((t) => t.title),
          urgent: daysUntil <= 2,
        });
      }
    });

    // Add urgent task warnings
    const urgentTasks = filteredTasks.filter((t) => {
      if (!t.deadline || t.completed) return false;
      const daysUntil = Math.ceil(
        (new Date(t.deadline) - today) / (1000 * 60 * 60 * 24)
      );
      return daysUntil >= 0 && daysUntil <= 2;
    });

    urgentTasks.forEach((task) => {
      const daysUntil = Math.ceil(
        (new Date(task.deadline) - today) / (1000 * 60 * 60 * 24)
      );
      if (!suggestions.some((s) => s.tasks?.includes(task.title))) {
        suggestions.push({
          type: "urgent",
          text: `"${task.title}" is due ${
            daysUntil === 0
              ? "today"
              : `in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`
          }`,
          urgent: true,
        });
      }
    });

    return suggestions.slice(0, 5);
  };

  const suggestions = generateSuggestions();

  const todayTasks = filteredTasks.filter(
    (t) =>
      t.deadline && isSameDay(new Date(t.deadline), new Date()) && !t.completed
  );

  const upcomingTasks = filteredTasks
    .filter(
      (t) => t.deadline && new Date(t.deadline) > new Date() && !t.completed
    )
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const nextTask = upcomingTasks[0];
  const hasConflict = todayTasks.length >= 3;

  const pressureInfo = getPressureLevel();
  const gaugePercentage = Math.min(
    (pressureCount / (pressureSettings.critical + 5)) * 100,
    100
  );

  const days = getDaysInMonth(currentMonth);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Login to see dashboard</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Category Filter */}
        <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
              selectedCategory === "All"
                ? "bg-[#039BE5] text-white shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.name
                  ? "bg-[#039BE5] text-white shadow-lg"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Top Row - Task Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Task Due Today */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
            <h3 className="text-[#039BE5] text-lg font-semibold mb-4">
              Task Due Today
            </h3>
            <div className="flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600">
                  {todayTasks.length.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          {/* Upcoming Deadline */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
            <h3 className="text-purple-600 text-lg font-semibold mb-4">
              Next Deadline
            </h3>
            {nextTask ? (
              <div className="space-y-2">
                <p className="text-gray-800 font-semibold truncate">
                  {nextTask.title}
                </p>
                <p className="text-gray-600 text-sm">
                  {nextTask.category && `(${nextTask.category}) `}
                  in{" "}
                  {Math.ceil(
                    (new Date(nextTask.deadline) - new Date()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </p>
              </div>
            ) : (
              <p className="text-green-600 font-semibold">No upcoming tasks!</p>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="">
          {/* Left Column - Pressure Gauge */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-5 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#039BE5] text-xl font-bold">
                Pressure Level
              </h3>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Configure pressure ranges"
              >
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Modern Circular Gauge */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                />
                {/* Pressure fill with gradient */}
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke={
                    pressureCount <= pressureSettings.low
                      ? "#10b981"
                      : pressureCount <= pressureSettings.medium
                      ? "#f97316"
                      : pressureCount <= pressureSettings.high
                      ? "#ef4444"
                      : "#dc2626"
                  }
                  strokeWidth="16"
                  strokeDasharray={`${(gaugePercentage / 100) * 502} 502`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className={`text-4xl font-bold ${pressureInfo.color} mb-1`}
                >
                  {pressureCount}
                </div>
                <div className="text-xs text-slate-600 font-medium">Tasks</div>
              </div>
            </div>

            {/* Pressure Level */}
            <div
              className={`text-center text-xl font-bold ${pressureInfo.color} mb-4`}
            >
              {pressureInfo.level} Pressure
            </div>

            {/* Pressure Ranges */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                <span className="text-slate-700 font-medium">
                  Low (0-{pressureSettings.low})
                </span>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                <span className="text-slate-700 font-medium">
                  Medium ({pressureSettings.low + 1}-{pressureSettings.medium})
                </span>
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                <span className="text-slate-700 font-medium">
                  High ({pressureSettings.medium + 1}-{pressureSettings.high})
                </span>
                <div className="w-3 h-3 bg-red-500 rounded-full" />
              </div>
              <div className="flex justify-between items-center p-2 bg-red-100 rounded-lg">
                <span className="text-slate-700 font-bold">
                  Critical ({pressureSettings.high + 1}+)
                </span>
                <div className="w-3 h-3 bg-red-700 rounded-full" />
              </div>
            </div>
          </div>

          {/* Right Column - Suggestions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Suggestions Box */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                <h3 className="text-purple-500 text-xl font-bold">
                  Smart Suggestions
                </h3>
              </div>

              {suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border-l-4 ${
                        sug.urgent
                          ? "bg-red-50 border-red-500"
                          : "bg-blue-50 border-blue-500"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {sug.urgent ? (
                          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">
                            {sug.text}
                          </p>
                          {sug.tasks && sug.tasks.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {sug.tasks.map((taskTitle, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-white px-2 py-1 rounded-full text-slate-600"
                                >
                                  {taskTitle}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-green-50 rounded-xl p-6 text-center border border-green-200">
                  <p className="text-green-700 font-medium">
                    ✨ All clear! No conflicts or urgent tasks.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  Pressure Settings
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Low Pressure (max tasks)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pressureSettings.low}
                    onChange={(e) =>
                      setPressureSettings({
                        ...pressureSettings,
                        low: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Medium Pressure (max tasks)
                  </label>
                  <input
                    type="number"
                    min={pressureSettings.low + 1}
                    value={pressureSettings.medium}
                    onChange={(e) =>
                      setPressureSettings({
                        ...pressureSettings,
                        medium:
                          parseInt(e.target.value) || pressureSettings.low + 1,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    High Pressure (max tasks)
                  </label>
                  <input
                    type="number"
                    min={pressureSettings.medium + 1}
                    value={pressureSettings.high}
                    onChange={(e) =>
                      setPressureSettings({
                        ...pressureSettings,
                        high:
                          parseInt(e.target.value) ||
                          pressureSettings.medium + 1,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Critical Pressure (starts at)
                  </label>
                  <input
                    type="number"
                    min={pressureSettings.high + 1}
                    value={pressureSettings.critical}
                    onChange={(e) =>
                      setPressureSettings({
                        ...pressureSettings,
                        critical:
                          parseInt(e.target.value) || pressureSettings.high + 1,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="w-full py-4 bg-[#039BE5] text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
