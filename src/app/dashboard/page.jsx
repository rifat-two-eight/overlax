"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";
import {
  Search,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  X,
  Trash2,
} from "lucide-react";

// Import Components
import Sidebar from "@/components/dashboard/Sidebar";
import TaskList from "@/components/dashboard/TaskList";
import CalendarView from "@/components/dashboard/CalendarView";
import TaskModal from "@/components/dashboard/TaskModal";
import CategoryModal from "@/components/dashboard/CategoryModal";
import AIWrapper from "@/components/AiWrapper";

// Date utilities
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
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

const isToday = (date) => {
  return isSameDay(date, new Date());
};

export default function Dashboard() {
  const { user, idToken } = useAuth();

  // STATES
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);
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
    }
  }, [user, idToken]);

  // TELEGRAM STATUS CHECK - Live polling every 5 seconds
  useEffect(() => {
    if (!user?.uid) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/telegram/status/${user.uid}`
        );
        if (res.ok) {
          const data = await res.json();
          setTelegramConnected(data.connected);
        }
      } catch (err) {
        console.error("Telegram status check failed:", err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [user?.uid]);

  // API CALLS
  const saveUserProfile = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }),
      });
    } catch (err) {
      console.error("Save profile error:", err);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${user.uid}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
      console.log("✅ Tasks loaded:", data.tasks.length);
    } catch (err) {
      console.error("Fetch tasks error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to load tasks",
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${user.uid}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setCategories(Array.isArray(data.categories) ? data.categories : []);
      console.log("✅ Categories loaded:", data.categories.length);
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };

  // TELEGRAM HANDLERS
  const handleTelegramConnect = () => {
    if (!user?.uid) {
      Swal.fire("Error", "Please login first!", "error");
      return;
    }

    const botUsername = "OverlaxNotification_bot";
    const deepLink = `https://t.me/${botUsername}?start=${user.uid}`;
    window.open(deepLink, "_blank");

    Swal.fire({
      icon: "success",
      title: "Telegram Opened!",
      text: "Click /start in the bot to connect",
      timer: 5000,
    });
  };

  // GOOGLE HANDLERS
  const checkGoogleConnection = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setGoogleConnected(!!data.googleTokens);
      }
    } catch (err) {
      console.error("Check Google connection error:", err);
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      const data = await res.json();

      if (!data.url) throw new Error("No auth URL");

      const popup = window.open(
        data.url,
        "google-auth",
        "width=500,height=600"
      );

      window.addEventListener(
        "message",
        (e) => {
          if (e.data === "google-auth-success") {
            setGoogleConnected(true);
            Swal.fire({ icon: "success", title: "Google Connected!" });
            popup?.close();
          }
        },
        { once: true }
      );
    } catch (err) {
      console.error("Google connect error:", err);
      Swal.fire({ icon: "error", title: "Google Connect Failed" });
    }
  };

  const handleGoogleDisconnect = async () => {
    const result = await Swal.fire({
      title: "Disconnect Google Calendar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setGoogleConnected(false);
      Swal.fire({ icon: "success", title: "Google Disconnected!" });
    } catch (err) {
      console.error("Google disconnect error:", err);
      Swal.fire({ icon: "error", title: "Failed to disconnect" });
    }
  };

  // TASK HANDLERS
  const resetForm = () => {
    setTitle("");
    setCategory("");
    setDeadline("");
    setFile(null);
    setExistingFile(null);
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
    if (!title || !category || !deadline) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields",
      });
    }

    const formData = new FormData();
    formData.append("uid", user.uid);
    formData.append("title", title);
    formData.append("category", category);
    formData.append("deadline", deadline);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      });

      if (res.ok) {
        await fetchTasks();
        setShowAddTaskModal(false);
        resetForm();
        Swal.fire({
          icon: "success",
          title: "Task Added!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Failed to add task");
      }
    } catch (err) {
      console.error("Add task error:", err);
      Swal.fire({ icon: "error", title: "Failed to add task" });
    }
  };

  const handleEditTask = async () => {
    if (!title || !category || !deadline) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields",
      });
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("deadline", deadline);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${editingTask._id}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${idToken}` },
          body: formData,
        }
      );

      if (res.ok) {
        await fetchTasks();
        setShowEditTaskModal(false);
        resetForm();
        Swal.fire({
          icon: "success",
          title: "Task Updated!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Failed to update task");
      }
    } catch (err) {
      console.error("Edit task error:", err);
      Swal.fire({ icon: "error", title: "Failed to update task" });
    }
  };

  const handleDeleteTask = async (id) => {
    const result = await Swal.fire({
      title: "Delete Task?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (res.ok) {
        await fetchTasks();
        Swal.fire({
          icon: "success",
          title: "Task Deleted!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Failed to delete task");
      }
    } catch (err) {
      console.error("Delete task error:", err);
      Swal.fire({ icon: "error", title: "Failed to delete task" });
    }
  };

  // CATEGORY HANDLERS
  const handleAddCategory = async () => {
    const name = newCategoryName.trim();

    console.log("=== ADD CATEGORY ===");
    console.log("Name:", name);
    console.log("User UID:", user?.uid);
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

    if (!name) {
      return Swal.fire({
        icon: "warning",
        title: "Category Name Required",
      });
    }

    if (!user?.uid) {
      return Swal.fire({
        icon: "error",
        title: "Not Authenticated",
      });
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ uid: user.uid, name }),
        }
      );

      console.log("Response status:", res.status);

      const data = await res.json();
      console.log("Response data:", data);

      if (res.ok) {
        await fetchCategories();
        setShowAddCategoryModal(false);
        setNewCategoryName("");
        Swal.fire({
          icon: "success",
          title: "Category Added!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: data.error || "Failed to add category",
        });
      }
    } catch (err) {
      console.error("Add category error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to add category",
        text: err.message,
      });
    }
  };

  const handleEditCategory = async () => {
    const name = editingCat?.name?.trim();

    console.log("=== EDIT CATEGORY ===");
    console.log("Category ID:", editingCat?._id);
    console.log("New Name:", name);

    if (!name) {
      return Swal.fire({
        icon: "warning",
        title: "Category Name Required",
      });
    }

    if (!editingCat?._id) {
      return Swal.fire({
        icon: "error",
        title: "Invalid Category",
      });
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${editingCat._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await res.json();
      console.log("Response:", data);

      if (res.ok) {
        await fetchCategories();
        await fetchTasks();
        setShowEditCategoryModal(false);
        setEditingCat(null);
        Swal.fire({
          icon: "success",
          title: "Category Updated!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: data.error || "Failed to update category",
        });
      }
    } catch (err) {
      console.error("Edit category error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to update category",
      });
    }
  };

  const handleDeleteCategory = async (id, name) => {
    console.log("=== DELETE CATEGORY ===");
    console.log("ID:", id, "Name:", name);

    const result = await Swal.fire({
      title: "Delete Category?",
      text: `Tasks in "${name}" will move to "Uncategorized"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      const data = await res.json();
      console.log("Response:", data);

      if (res.ok) {
        await fetchCategories();
        await fetchTasks();
        Swal.fire({
          icon: "success",
          title: "Category Deleted!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: data.error || "Failed to delete category",
        });
      }
    } catch (err) {
      console.error("Delete category error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to delete category",
      });
    }
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const getStats = () => {
    // Active = not completed & not overdue
    const activeTasks = filteredTasks.filter(
      (t) => !t.completed && !isOverdue(t.deadline)
    );

    // Today's active tasks
    const todayActiveTasks = activeTasks.filter((t) => isToday(t.deadline));

    // Overlap = multiple active tasks on the same day
    const overlapTasks = todayActiveTasks.filter((task, index) => {
      return todayActiveTasks.some(
        (otherTask, otherIndex) =>
          index !== otherIndex && isSameDay(task.deadline, otherTask.deadline)
      );
    });

    // Completed = completed OR overdue (both count as done)
    const completedCount = filteredTasks.filter(
      (t) => t.completed || isOverdue(t.deadline)
    ).length;

    return {
      total: activeTasks.length, // Only upcoming
      today: todayActiveTasks.length, // Only active today
      overlap: overlapTasks.length, // Only active overlapping
      completed: completedCount, // Completed + Overdue
    };
  };

  // FILTERED DATA
  const filteredTasks =
    selectedCategory === "All Tasks"
      ? tasks
      : tasks.filter((t) => t.category === selectedCategory);

  const stats = getStats();

  // FILE HELPERS
  const getFileIcon = (file) =>
    file?.type?.startsWith("image/") ? (
      <ImageIcon className="w-4 h-4" />
    ) : (
      <FileText className="w-4 h-4" />
    );

  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    return `${process.env.NEXT_PUBLIC_API_URL}${filePath}`;
  };

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
          startEditCategory={(cat) => {
            setEditingCat(cat);
            setShowEditCategoryModal(true);
          }}
          handleDeleteCategory={handleDeleteCategory}
          handleTelegramConnect={handleTelegramConnect}
          telegramConnected={telegramConnected}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1 ml-0 lg:ml-80 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* SEARCH BAR */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-[#039BE5] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-slate-900">
                  {stats.total}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">
                  Today&apos;s Tasks
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.today}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <p className="text-sm text-slate-600">Overlap Today</p>
                </div>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.overlap}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <p className="text-sm text-slate-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TaskList
                tasks={filteredTasks}
                selectedCategory={selectedCategory}
                loading={loading}
                openAddModal={() => {
                  resetForm();
                  setShowAddTaskModal(true);
                }}
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
          onClose={() => {
            setShowAddCategoryModal(false);
            setNewCategoryName("");
          }}
          isEdit={false}
          name={newCategoryName}
          setName={setNewCategoryName}
          handleSubmit={handleAddCategory}
        />

        <CategoryModal
          isOpen={showEditCategoryModal}
          onClose={() => {
            setShowEditCategoryModal(false);
            setEditingCat(null);
          }}
          isEdit={true}
          name={editingCat?.name || ""}
          setName={(v) => setEditingCat({ ...editingCat, name: v })}
          handleSubmit={handleEditCategory}
        />

        {/* DATE TASKS MODAL */}
        {selectedDate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setSelectedDate(null)}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  Tasks on {formatDate(selectedDate)}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="space-y-3">
                {filteredTasks
                  .filter((t) => isSameDay(new Date(t.deadline), selectedDate))
                  .map((t) => (
                    <div
                      key={t._id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        t.completed
                          ? "bg-green-50 border-green-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              t.completed
                                ? "line-through text-slate-500"
                                : "text-slate-800"
                            }`}
                          >
                            {t.title}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {t.category} • {formatTime(t.deadline)}
                          </p>
                          {t.file && (
                            <a
                              href={getFileUrl(t.file.path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
                            >
                              {getFileIcon(t.file)}
                              {t.file.originalName}
                            </a>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteTask(t._id)}
                          className="text-red-600 hover:text-red-700 p-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                {filteredTasks.filter((t) =>
                  isSameDay(new Date(t.deadline), selectedDate)
                ).length === 0 && (
                  <p className="text-center text-slate-500 py-8">
                    No tasks for this date
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI WRAPPER */}
      <AIWrapper user={user} tasks={tasks} />
    </>
  );
}
