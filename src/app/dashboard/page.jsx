"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import { Search } from "lucide-react";

// Import Components
import Sidebar from "@/components/dashboard/Sidebar";
import StatsCards from "@/components/dashboard/StatsCards";
import TaskList from "@/components/dashboard/TaskList";
import CalendarView from "@/components/dashboard/CalendarView";
import TaskModal from "@/components/dashboard/TaskModal";
import CategoryModal from "@/components/dashboard/CategoryModal";

// Import Icons & Utils
import { format, isSameDay } from "date-fns";
import { FileText, Image as ImageIcon, X, Trash2 } from "lucide-react";
import AIWrapper from "@/components/AiWrapper";

export default function Dashboard() {
  const { user, idToken } = useAuth();

  // STATES
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false); // ← ADDED
  const [selectedCategory, setSelectedCategory] = useState("All Tasks");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // MODAL STATES
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingCat, setEditingCat] = useState(null);

  // FORM STATES
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const [file, setFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // LIFECYCLE
  useEffect(() => {
    if (user?.uid && idToken) {
      saveUserProfile();
      fetchTasks();
      fetchCategories();
      checkGoogleConnection();
      checkTelegramStatus(); // ← CALL ON LOAD
    }
  }, [user, idToken]);

  // ADD useEffect for LIVE STATUS
useEffect(() => {
  if (!user?.uid) return;

  const checkStatus = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/telegram/status/${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setTelegramConnected(data.connected);
      }
    } catch (err) {
      console.error("Status check failed:", err);
    }
  };

  checkStatus(); // First check
  const interval = setInterval(checkStatus, 5000); // Every 5 sec

  return () => clearInterval(interval);
}, [user?.uid]);

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

  // TELEGRAM: CHECK STATUS
  const checkTelegramStatus = async () => {
    if (!user?.uid) {
      setTelegramConnected(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/telegram/status/${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setTelegramConnected(data.connected);
      }
    } catch (err) {
      console.error("Telegram status check failed:", err);
      setTelegramConnected(false);
    }
  };

  // TELEGRAM: CONNECT
  const handleTelegramConnect = () => {
    if (!user?.uid) {
      Swal.fire("Error", "Login first!", "error");
      return;
    }

    const botUsername = "OverlaxNotification_bot";
    const deepLink = `https://t.me/${botUsername}?start=${user.uid}`;
    window.open(deepLink, "_blank");

    Swal.fire({
      icon: "success",
      title: "Telegram Opened!",
      text: "Click /start in @OverlaxNotification_bot",
      timer: 5000
    });
  };


  // GOOGLE: CHECK CONNECTION
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

  // GOOGLE: CONNECT
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
          Swal.fire({ icon: "success", title: "Google Connected!" });
          popup.close();
        }
      }, { once: true });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Google Connect Failed" });
    }
 907};

  // GOOGLE: DISCONNECT
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
      Swal.fire({ icon: "success", title: "Google Disconnected!" });
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
    setDeadline(task.deadline.replace("Z", "").slice(0, 16));
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
    formData.append("deadline", deadline);
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
        Swal.fire({ icon: "success", title: "Category Added!" });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed" });
    }
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
  const filteredTasks = selectedCategory === "All Tasks" 
    ? tasks 
    : tasks.filter(t => t.category === selectedCategory);

  // UTILS
  const getFileIcon = (file) => 
    file?.type?.startsWith("image/") 
      ? <ImageIcon className="w-4 h-4" /> 
      : <FileText className="w-4 h-4" />;

  return (
    <>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      {/* SIDEBAR */}
      <Sidebar
        categories={categories}
        tasks={tasks}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        showAddCategoryModal={showAddCategoryModal}
        setShowAddCategoryModal={setShowAddCategoryModal}
        googleConnected={googleConnected}
        handleGoogleConnect={handleGoogleConnect}
        handleGoogleDisconnect={handleGoogleDisconnect}
        startEditCategory={(cat) => { 
          setEditingCat(cat); 
          setShowEditCategoryModal(true); 
        }}
        handleDeleteCategory={handleDeleteCategory}
        handleTelegramConnect={handleTelegramConnect}
        telegramConnected={telegramConnected}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-0 lg:ml-80  p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* SEARCH BAR */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0395E5] focus:border-transparent outline-none transition-all"
            />
          </div>

          <StatsCards filteredTasks={filteredTasks} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TaskList
              tasks={filteredTasks}
              selectedCategory={selectedCategory}
              loading={loading}
              openAddModal={() => { resetForm(); setShowAddTaskModal(true); }}
              openEditModal={openEditModal}
              handleDeleteTask={handleDeleteTask}
              searchQuery={searchQuery}
            />
            <CalendarView
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              filteredTasks={filteredTasks}
              setSelectedDate={setSelectedDate}
            />
          </div>
        </div>
      </main>

      {/* MODALS */}
      <TaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        isEdit={false}
        title={title}
        setTitle={setTitle}
        category={category}
        setCategory={setCategory}
        deadline={deadline}
        setDeadline={setDeadline}
        file={file}
        setFile={setFile}
        categories={categories}
        handleSubmit={handleAddTask}
      />
      <TaskModal
        isOpen={showEditTaskModal}
        onClose={() => setShowEditTaskModal(false)}
        isEdit={true}
        task={editingTask}
        title={title}
        setTitle={setTitle}
        category={category}
        setCategory={setCategory}
        deadline={deadline}
        setDeadline={setDeadline}
        file={file}
        setFile={setFile}
        existingFile={existingFile}
        categories={categories}
        handleSubmit={handleEditTask}
      />
      <CategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        isEdit={false}
        name={newCategoryName}
        setName={setNewCategoryName}
        handleSubmit={handleAddCategory}
      />
      <CategoryModal
        isOpen={showEditCategoryModal}
        onClose={() => setShowEditCategoryModal(false)}
        isEdit={true}
        name={editingCat?.name || ""}
        setName={(v) => setEditingCat({ ...editingCat, name: v })}
        handleSubmit={handleEditCategory}
      />

      {/* DATE TASKS MODAL */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" onClick={() => setSelectedDate(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Tasks on {format(selectedDate, "MMM d, yyyy")}</h3>
              <button onClick={() => setSelectedDate(null)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5 text-slate-600" />
              </button>
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
                          <a href={`http://bfa:5000${t.file.path}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
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
    <AIWrapper user={user} tasks={tasks} />
    </>
    
  );
}