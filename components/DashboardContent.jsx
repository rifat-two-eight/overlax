"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare, BookOpen, User, Briefcase, Calendar, Plus, X, Clock, AlertTriangle, Trash2,
  ChevronLeft, ChevronRight, FolderPlus, Hash, Edit2, Paperclip, FileText, Image as ImageIcon, Download
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import Swal from "sweetalert2";

export default function Dashboard() {
  const { user, idToken } = useAuth();

  // MODAL STATES
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // FILTER & CALENDAR
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState("All Tasks");

  // DATA STATES
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);

  // FORM STATES
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState(""); // datetime-local
  const [file, setFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  // LIFECYCLE
  useEffect(() => {
    if (user?.uid && idToken) {
      saveUserProfile();
      fetchTasks();
      fetchCategories();
      checkGoogleConnection();
    }
  }, [user, idToken]);

  // API CALLS
  const saveUserProfile = async () => {
    try {
      await fetch('http://localhost:5000/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL }),
      });
    } catch (_) {}
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${user.uid}`, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Failed to load tasks" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${user.uid}`, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (err) {
      console.error(err);
    }
  };

  const checkGoogleConnection = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGoogleConnected(!!data.googleTokens);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // GOOGLE AUTH
  const handleGoogleConnect = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/google", {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      const data = await res.json();
      if (!data.url) throw new Error("No URL");

      const popup = window.open(data.url, "google-auth", "width=500,height=600");
      window.addEventListener("message", (e) => {
        if (e.data === "google-auth-success") {
          setGoogleConnected(true);
          Swal.fire({ icon: "success", title: "Connected!" });
          popup.close();
        }
      }, { once: true });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed" });
    }
  };

  const handleGoogleDisconnect = async () => {
    const r = await Swal.fire({
      title: "Disconnect Google Calendar?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!r.isConfirmed) return;

    try {
      await fetch("http://localhost:5000/api/auth/google", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setGoogleConnected(false);
      Swal.fire({ icon: "success", title: "Disconnected!" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed" });
    }
  };

  // TASK HANDLERS
  const resetForm = () => {
    setTitle(""); setCategory(""); setDeadline(""); setFile(null); setExistingFile(null);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setCategory(task.category);
    setDeadline(task.deadline.replace("Z", "").slice(0, 16)); // datetime-local
    setExistingFile(task.file);
    setFile(null);
    setShowEditTaskModal(true);
  };

  const handleAddTask = async () => {
    if (!title || !category || !deadline) return Swal.fire({ icon: "warning", title: "Fill all fields" });
    const formData = new FormData();
    formData.append("uid", user.uid);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("deadline", deadline); // already ISO
    if (file) formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: { "Authorization": `Bearer ${idToken}` },
        body: formData,
      });
      if (res.ok) {
        fetchTasks();
        setShowAddTaskModal(false);
        resetForm();
        Swal.fire({ icon: "success", title: "Task Added & Synced!" });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed" });
    }
  };

  const handleEditTask = async () => {
    if (!title || !category || !deadline) return Swal.fire({ icon: "warning", title: "Fill all" });
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("deadline", deadline);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${editingTask._id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${idToken}` },
        body: formData,
      });
      if (res.ok) {
        fetchTasks();
        setShowEditTaskModal(false);
        resetForm();
        Swal.fire({ icon: "success", title: "Updated!" });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed" });
    }
  };

  const handleDeleteTask = async (id) => {
    const r = await Swal.fire({ title: "Delete?", icon: "warning", showCancelButton: true });
    if (!r.isConfirmed) return;
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${idToken}` }
      });
      fetchTasks();
      Swal.fire({ icon: "success", title: "Deleted!" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed" });
    }
  };

  // CATEGORY HANDLERS
  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return Swal.fire({ icon: "warning", title: "Enter name" });
    try {
      const res = await fetch("http://localhost:5000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({ uid: user.uid, name }),
      });
      if (res.ok) {
        fetchCategories();
        setShowAddCategoryModal(false);
        setNewCategoryName("");
        Swal.fire({ icon: "success", title: "Added!" });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed" });
    }
  };

  const startEditCategory = (cat) => {
    setEditingCat({ _id: cat._id, name: cat.name });
    setShowEditCategoryModal(true);
  };

  const handleEditCategory = async () => {
    const name = editingCat.name.trim();
    if (!name) return Swal.fire({ icon: "warning", title: "Enter name" });
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${editingCat._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        fetchCategories();
        setShowEditCategoryModal(false);
        setEditingCat(null);
        Swal.fire({ icon: "success", title: "Updated!" });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed" });
    }
  };

  const handleDeleteCategory = async (id, name) => {
    const r = await Swal.fire({
      title: "Delete Category?",
      text: `"${name}" → Uncategorized`,
      icon: "warning",
      showCancelButton: true
    });
    if (!r.isConfirmed) return;
    try {
      await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${idToken}` }
      });
      fetchCategories();
      fetchTasks();
      Swal.fire({ icon: "success", title: "Deleted!" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed" });
    }
  };

  // FILTERED DATA
  const filteredTasks = selectedCategory === "All Tasks" ? tasks : tasks.filter(t => t.category === selectedCategory);

  const iconMap = {
    book: <BookOpen className="w-5 h-5" />,
    user: <User className="w-5 h-5" />,
    briefcase: <Briefcase className="w-5 h-5" />,
    folder: <Hash className="w-5 h-5" />
  };

  const allCategories = [
    { name: "All Tasks", icon: <CheckSquare className="w-5 h-5" />, count: tasks.length },
    ...categories.map(c => ({
      name: c.name,
      icon: iconMap[c.icon] || <Hash className="w-5 h-5" />,
      count: tasks.filter(t => t.category === c.name).length,
      _id: c._id,
    })),
  ];

  // CALENDAR
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const firstDayOfWeek = monthStart.getDay();
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - firstDayOfWeek);
  const calendarDays = eachDayOfInterval({
    start: startDate, 
    end: new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate() + (6 - monthEnd.getDay())),
  });

  const hasTaskOnDate = (date) => filteredTasks.some(t => isSameDay(new Date(t.deadline), date));
  const getTaskCountOnDate = (date) => filteredTasks.filter(t => isSameDay(new Date(t.deadline), date)).length;

  const getFileIcon = (file) => file?.type?.startsWith("image/") ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* SIDEBAR */}
      <aside className="lg:w-80 bg-white border-r border-slate-200 p-6 space-y-6">
        <button onClick={() => setShowAddCategoryModal(true)} className="w-full bg-[#039BE5] hover:bg-[#0288d1] text-white font-semibold py-3 rounded-md flex items-center justify-center gap-2">
          <FolderPlus className="w-5 h-5" /> Add Category
        </button>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Categories</h2>
          <div className="space-y-2">
            {allCategories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex-1 flex items-center justify-between p-3 rounded-lg transition-all
                    ${selectedCategory === cat.name ? "bg-[#039BE5] text-white shadow-md" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  <div className="flex items-center gap-3">
                    {cat.icon}
                    <span className="font-medium">{cat.name}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full
                    ${selectedCategory === cat.name ? "bg-white/30 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {cat.count}
                  </span>
                </button>
                {cat._id && (
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => startEditCategory(cat)} className="p-1.5 text-slate-600 hover:text-slate-800"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteCategory(cat._id, cat.name)} className="p-1.5 text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Integrations</h2>
          <button
            onClick={googleConnected ? handleGoogleDisconnect : handleGoogleConnect}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all
              ${googleConnected ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100" : "text-slate-700 hover:bg-slate-50"}`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#ea4335]" />
              <span className="font-medium">{googleConnected ? "Disconnect Google" : "Google Calendar"}</span>
            </div>
            {googleConnected ? <X className="w-5 h-5 text-red-600" /> : null}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-lg shadow-sm border">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-slate-600">Due Today</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {filteredTasks.filter(t => isSameDay(new Date(t.deadline), new Date())).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-slate-600">Upcoming</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {filteredTasks.filter(t => new Date(t.deadline) > new Date()).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm border">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-slate-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {filteredTasks.filter(t => new Date(t.deadline) < new Date()).length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TASK LIST */}
            <div className="space-y-4">
              <button
                onClick={() => { resetForm(); setShowAddTaskModal(true); }}
                className="w-full bg-[#B1BCC1] hover:bg-slate-500 text-white font-medium py-3 rounded-md flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add Task
              </button>

              <div className="bg-white rounded-lg shadow-sm border p-4 space-y-3 max-h-96 overflow-y-auto">
                <h3 className="font-semibold text-slate-900">{selectedCategory}</h3>
                {loading && <p className="text-sm text-slate-500">Loading…</p>}
                {filteredTasks.length === 0 && !loading && <p className="text-sm text-slate-500">No tasks</p>}
                {filteredTasks.map(task => (
                  <div key={task._id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-slate-800">{task.title}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <span>{task.category}</span>
                          <span>•</span>
                          <span>{format(new Date(task.deadline), "MMM d, yyyy h:mm a")}</span>
                          {task.file && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                {getFileIcon(task.file)}
                                <a
                                  href={`http://localhost:5000${task.file.path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="truncate max-w-32 text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  {task.file.originalName}
                                  <Download className="w-3 h-3" />
                                </a>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEditModal(task)} className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteTask(task._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CALENDAR */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{format(currentMonth, "MMMM yyyy")}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md">
                    Today
                  </button>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-600 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-sm">
                {calendarDays.map((date, idx) => {
                  const inMonth = isSameMonth(date, currentMonth);
                  const today = isSameDay(date, new Date());
                  const hasTask = hasTaskOnDate(date);
                  const count = getTaskCountOnDate(date);
                  return (
                    <button
                      key={idx}
                      onClick={() => inMonth && setSelectedDate(date)}
                      disabled={!inMonth}
                      className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all
                        ${!inMonth ? "text-slate-300 pointer-events-none" : ""}
                        ${today ? "bg-[#0084FF] text-white font-bold shadow-md" : ""}
                        ${hasTask && !today ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-slate-100"}
                        ${hasTask ? "relative" : ""}
                      `}
                    >
                      <span>{format(date, "d")}</span>
                      {hasTask && !today && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                          {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-[#0084FF] rounded-full" />
                          ))}
                          {count > 3 && <span className="text-[10px] font-bold text-[#0084FF]">+{count - 3}</span>}
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

      {/* MODALS */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" onClick={() => setShowAddTaskModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New Task</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-600" /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0084FF]" />
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0084FF]">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
              <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0084FF]" />
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-slate-500" />
                <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files[0] || null)} className="flex-1 text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#039BE5] file:text-white hover:file:bg-[#0288d1]" />
              </div>
              {file && <p className="text-xs text-green-600">Selected: {file.name}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddTaskModal(false)} className="flex-1 py-3 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium">Cancel</button>
              <button onClick={handleAddTask} className="flex-1 py-3 bg-gradient-to-r from-[#039BE5] to-[#0288d1] text-white rounded-lg hover:shadow-lg font-medium">Add Task</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TASK */}
      {showEditTaskModal && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" onClick={() => setShowEditTaskModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Task</h3>
              <button onClick={() => setShowEditTaskModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-600" /></button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0084FF]" />
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0084FF]">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
              <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0084FF]" />
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-slate-500" />
                <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files[0] || null)} className="flex-1 text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-[#039BE5] file:text-white hover:file:bg-[#0288d1]" />
              </div>
              {existingFile && !file && (
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  {getFileIcon(existingFile)} Current: {existingFile.originalName}
                </p>
              )}
              {file && <p className="text-xs text-green-600">New: {file.name}</p>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditTaskModal(false)} className="flex-1 py-3 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium">Cancel</button>
              <button onClick={handleEditTask} className="flex-1 py-3 bg-gradient-to-r from-[#039BE5] to-[#0288d1] text-white rounded-lg hover:shadow-lg font-medium">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CATEGORY */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" onClick={() => setShowAddCategoryModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Category</h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-600" /></button>
            </div>
            <input type="text" placeholder="Category Name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0084FF]" />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddCategoryModal(false)} className="flex-1 py-3 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium">Cancel</button>
              <button onClick={handleAddCategory} className="flex-1 py-3 bg-gradient-to-r from-[#039BE5] to-[#0288d1] text-white rounded-lg hover:shadow-lg font-medium">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY */}
      {showEditCategoryModal && editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" onClick={() => setShowEditCategoryModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Category</h3>
              <button onClick={() => setShowEditCategoryModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-600" /></button>
            </div>
            <input type="text" value={editingCat.name} onChange={e => setEditingCat({ ...editingCat, name: e.target.value })} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0084FF]" />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditCategoryModal(false)} className="flex-1 py-3 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium">Cancel</button>
              <button onClick={handleEditCategory} className="flex-1 py-3 bg-gradient-to-r from-[#039BE5] to-[#0288d1] text-white rounded-lg hover:shadow-lg font-medium">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* DATE TASKS MODAL */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" onClick={() => setSelectedDate(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Tasks on {format(selectedDate, "MMM d, yyyy")}</h3>
              <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-600" /></button>
            </div>
            <div className="space-y-3">
              {filteredTasks
                .filter(t => isSameDay(new Date(t.deadline), selectedDate))
                .map(t => (
                  <div key={t._id} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-800">{t.title}</p>
                        <p className="text-xs text-slate-600">{t.category} • {format(new Date(t.deadline), "h:mm a")}</p>
                        {t.file && (
                          <a href={`http://localhost:5000${t.file.path}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                            {getFileIcon(t.file)} {t.file.originalName}
                          </a>
                        )}
                      </div>
                      <button onClick={() => handleDeleteTask(t._id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              {filteredTasks.filter(t => isSameDay(new Date(t.deadline), selectedDate)).length === 0 && (
                <p className="text-center text-slate-500 py-8">No tasks</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}