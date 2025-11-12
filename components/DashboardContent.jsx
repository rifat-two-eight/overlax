// components/DashboardContent.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare, BookOpen, User, Briefcase, Calendar, MessageCircle,
  Plus, X, Clock, AlertTriangle, Trash2, ChevronLeft, ChevronRight
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, addMonths, subMonths
} from "date-fns";
import Swal from "sweetalert2";

export default function DashboardContent() {
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (user?.uid) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${user.uid}`);
      const data = await res.json();
      if (Array.isArray(data.tasks)) setTasks(data.tasks);
    } catch (err) {
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!title || !category || !deadline) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in all fields",
        confirmButtonColor: "#039BE5",
      });
      return;
    }

    const payload = { uid: user.uid, title, deadline, category };
    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.taskId) {
        setTasks((prev) => [...prev, { ...payload, _id: data.taskId }]);
        setShowModal(false);
        setTitle(""); setCategory(""); setDeadline("");
        Swal.fire({
          icon: "success",
          title: "Task Added!",
          text: `"${title}" has been added.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not save task. Try again.",
      });
    }
  };

  const handleDelete = async (taskId, taskTitle) => {
    const result = await Swal.fire({
      title: "Delete Task?",
      text: `"${taskTitle}" will be removed permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Task removed.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not delete task.",
      });
    }
  };

  // Calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const firstDayOfWeek = monthStart.getDay();
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - firstDayOfWeek);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate() + (6 - monthEnd.getDay())),
  });

  const hasTaskOnDate = (date) =>
    tasks.some((task) => isSameDay(new Date(task.deadline), date));

  const getTaskCountOnDate = (date) =>
    tasks.filter((task) => isSameDay(new Date(task.deadline), date)).length;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">

      {/* SIDEBAR */}
      <aside className="lg:w-80 bg-white border-r border-slate-200 p-6 space-y-6 flex-shrink-0">
        <button className="w-full bg-[#039BE5] hover:bg-[#0288d1] text-white font-semibold py-3 rounded-md flex items-center justify-center gap-2 transition-colors">
          Add Category
          <Image src="/plus.svg" alt="plus" width={20} height={20} />
        </button>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Task Categories</h2>
          <div className="space-y-2">
            {[
              { name: "All Tasks", icon: <CheckSquare className="w-5 h-5" />, count: tasks.length },
              { name: "Academic", icon: <BookOpen className="w-5 h-5" />, count: tasks.filter(t => t.category === "Academic").length },
              { name: "Personal", icon: <User className="w-5 h-5" />, count: tasks.filter(t => t.category === "Personal").length },
              { name: "Work", icon: <Briefcase className="w-5 h-5" />, count: tasks.filter(t => t.category === "Work").length },
            ].map((cat) => (
              <button
                key={cat.name}
                className="w-full flex items-center justify-between p-3 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
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
            <button className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
              <MessageCircle className="w-5 h-5 text-[#0088cc]" />
              <span className="font-medium">Telegram</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
              <Calendar className="w-5 h-5 text-[#ea4335]" />
              <span className="font-medium">Google Calendar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-lg shadow-sm border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-600">Due Today</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {tasks.filter(t => isSameDay(new Date(t.deadline), new Date())).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-600">Upcoming</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {tasks.filter(t => new Date(t.deadline) > new Date()).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-slate-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {tasks.filter(t => new Date(t.deadline) < new Date()).length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Add Task + List */}
            <div className="space-y-4">
              <button
                onClick={() => setShowModal(true)}
                className="w-full bg-[#B1BCC1] hover:bg-slate-500 text-white font-medium py-3 rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Task
              </button>

              <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3 max-h-96 overflow-y-auto">
                <h3 className="font-semibold text-slate-900">Your Tasks</h3>
                {loading && <p className="text-sm text-slate-500">Loading…</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}
                {tasks.length === 0 && !loading && <p className="text-sm text-slate-500">No tasks yet</p>}

                {tasks.map((task) => (
                  <div key={task._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                    <div>
                      <p className="font-medium text-slate-800">{task.title}</p>
                      <p className="text-xs text-slate-600">
                        {task.category} • {format(new Date(task.deadline), "MMM d")}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(task._id, task.title)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {format(currentMonth, "MMMM yyyy")}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-600 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-sm">
                {calendarDays.map((date, idx) => {
                  const inMonth = isSameMonth(date, currentMonth);
                  const today = isSameDay(date, new Date());
                  const selected = selectedDate && isSameDay(date, selectedDate);
                  const hasTask = hasTaskOnDate(date);
                  const count = getTaskCountOnDate(date);

                  return (
                    <button
                      key={idx}
                      onClick={() => inMonth && setSelectedDate(date)}
                      disabled={!inMonth}
                      className={`
                        aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-200
                        ${!inMonth ? "text-slate-300 pointer-events-none" : ""}
                        ${today ? "bg-[#0084FF] text-white font-bold shadow-md" : ""}
                        ${selected && !today ? "bg-blue-100 ring-2 ring-[#0084FF] ring-inset" : ""}
                        ${hasTask && !today && !selected ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-slate-100"}
                        ${hasTask ? "relative" : ""}
                      `}
                    >
                      <span>{format(date, "d")}</span>

                      {hasTask && !today && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-[#0084FF] rounded-full" />
                          ))}
                          {count > 3 && (
                            <span className="text-[10px] font-bold text-[#0084FF]">
                              +{count - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* PRETTY ADD TASK MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blur + Light Overlay */}
          <div
            className="absolute inset-0 bg-white/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">Add New Task</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0084FF] transition-all"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0084FF]"
              >
                <option value="">Select Category</option>
                <option>Academic</option>
                <option>Personal</option>
                <option>Work</option>
              </select>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0084FF]"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#039BE5] to-[#0288d1] text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASKS ON DATE MODAL */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-white/70 backdrop-blur-sm"
            onClick={() => setSelectedDate(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-96 overflow-y-auto animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                Tasks on {format(selectedDate, "MMM d, yyyy")}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {tasks
              .filter((task) => isSameDay(new Date(task.deadline), selectedDate))
              .map((task) => (
                <div key={task._id} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-800">{task.title}</p>
                      <p className="text-xs text-slate-600">{task.category}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(task._id, task.title)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

            {tasks.filter((t) => isSameDay(new Date(t.deadline), selectedDate)).length === 0 && (
              <p className="text-center text-slate-500 py-8">No tasks on this date</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}