"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X, Bot, Sparkles, RefreshCw } from "lucide-react";
import Image from "next/image";

export default function AIAssistant({ user }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    category: "Personal",
    deadline: "",
  });
  const [categories, setCategories] = useState([
    "Academic",
    "Personal",
    "Work",
  ]);
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchTasks = async (showLoading = true) => {
    if (!user?.uid) {
      setTasks([]);
      return;
    }

    if (showLoading) setLoadingTasks(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${user.uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      } else {
        console.error("Failed to fetch tasks");
        setTasks([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      if (showLoading) setLoadingTasks(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user?.uid) {
      fetchTasks();
      fetchCategories();
    } else {
      // Clear task data when user logs out but keep chat open
      setTasks([]);
      setShowAddForm(false);
    }
  }, [user]);

  // Fetch categories
  const fetchCategories = async () => {
    if (!user?.uid) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${user.uid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const catNames = data.categories.map((c) => c.name);
        setCategories(
          catNames.length > 0 ? catNames : ["Academic", "Personal", "Work"]
        );
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Auto-refresh tasks every 5 seconds when chat is open
  useEffect(() => {
    if (open && user?.uid) {
      // Immediate refresh when opened
      fetchTasks(false);

      // Set up interval for continuous refresh
      intervalRef.current = setInterval(() => {
        fetchTasks(false);
      }, 5000); // Refresh every 5 seconds
    } else {
      // Clear interval when chat is closed
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [open, user?.uid]);

  // Listen for task changes from other components (custom event)
  useEffect(() => {
    const handleTaskChange = () => {
      fetchTasks(false);
    };

    window.addEventListener("taskUpdated", handleTaskChange);
    window.addEventListener("taskAdded", handleTaskChange);
    window.addEventListener("taskDeleted", handleTaskChange);

    return () => {
      window.removeEventListener("taskUpdated", handleTaskChange);
      window.removeEventListener("taskAdded", handleTaskChange);
      window.removeEventListener("taskDeleted", handleTaskChange);
    };
  }, [user]);

  // Dynamic welcome message with task insights
  useEffect(() => {
    if (open && chats.length === 0 && !loadingTasks) {
      let welcomeMsg = "";

      if (!user?.uid) {
        // Guest welcome message
        welcomeMsg = `Hey there! 👋 I'm Overlax AI\n\n`;
        welcomeMsg += `I can chat with you about anything! But to manage tasks, you'll need to login first. 🔐\n\n`;
        welcomeMsg += `Try asking me general questions, or login to unlock task management features!`;
      } else {
        // Logged-in user welcome message
        const firstName = user?.displayName?.trim().split(" ")[0] || "there";
        // Calculate task statistics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayTasks = tasks.filter((t) => {
          const deadline = new Date(t.deadline);
          return deadline >= today && deadline < tomorrow;
        });

        const overdueTasks = tasks.filter((t) => {
          const deadline = new Date(t.deadline);
          return deadline < today && t.status !== "done";
        });

        const upcomingTasks = tasks.filter((t) => {
          const deadline = new Date(t.deadline);
          return deadline >= tomorrow && t.status !== "done";
        });

        welcomeMsg = `Hey ${firstName}! 👋 I'm Overlax AI\n\n`;

        if (tasks.length === 0) {
          welcomeMsg +=
            "You're all clear! No tasks yet. Ready to add your first one? 🚀";
        } else {
          welcomeMsg += `📊 Your Task Overview:\n`;
          welcomeMsg += `• Total: ${tasks.length} task${
            tasks.length !== 1 ? "s" : ""
          }\n`;

          if (todayTasks.length > 0) {
            welcomeMsg += `• Today: ${todayTasks.length} task${
              todayTasks.length !== 1 ? "s" : ""
            } 📅\n`;
          }

          if (overdueTasks.length > 0) {
            welcomeMsg += `• Overdue: ${overdueTasks.length} ⚠️\n`;
          }

          if (upcomingTasks.length > 0) {
            welcomeMsg += `• Upcoming: ${upcomingTasks.length} 🔜\n`;
          }

          welcomeMsg += `\nAsk me anything! "আজকের টাস্ক", "overdue tasks", "show my work tasks" etc.`;
        }
      }

      setChats([
        {
          id: "welcome",
          text: welcomeMsg,
          sender: "ai",
        },
      ]);
    }
  }, [open, user, tasks, loadingTasks, chats.length]);

  // Manual refresh button handler
  const handleManualRefresh = async () => {
    await fetchTasks(true);

    // Show refresh notification in chat
    const refreshMsg = {
      id: Date.now().toString(),
      text: `🔄 Tasks refreshed! You now have ${tasks.length} task${
        tasks.length !== 1 ? "s" : ""
      }.`,
      sender: "ai",
    };

    setChats((prev) => [...prev, refreshMsg]);
  };

  // Smart query handler
  const handleSmartQuery = (userText) => {
    const text = userText.toLowerCase();
    let response = "";

    // Check if user is trying to access task features without login
    const taskKeywords = [
      "task",
      "টাস্ক",
      "add",
      "create",
      "show",
      "list",
      "today",
      "আজ",
      "tomorrow",
      "কাল",
      "overdue",
      "week",
      "urgent",
      "academic",
      "personal",
      "work",
    ];

    const isTaskQuery = taskKeywords.some((keyword) => text.includes(keyword));

    if (isTaskQuery && !user?.uid) {
      return "🔐 Please login first to access task management features!\n\nI can still chat with you about general topics. Try asking me something else! 😊";
    }

    // Add task command
    if (
      text.includes("add task") ||
      text.includes("create task") ||
      text.includes("new task") ||
      text.includes("টাস্ক add") ||
      text.includes("টাস্ক বানাও") ||
      text.includes("নতুন টাস্ক")
    ) {
      return "SHOW_ADD_FORM";
    }

    // Refresh command
    if (
      text.includes("refresh") ||
      text.includes("update") ||
      text.includes("রিফ্রেশ")
    ) {
      fetchTasks(false);
      return "🔄 Refreshing your tasks... Done! Let me know what you'd like to check.";
    }

    // Today's tasks
    if (
      text.includes("আজ") ||
      text.includes("today") ||
      text.includes("todaoy") ||
      text.includes("ajke")
    ) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayTasks = tasks.filter((t) => {
        const deadline = new Date(t.deadline);
        return deadline >= today && deadline < tomorrow;
      });

      if (todayTasks.length === 0) {
        response =
          "🎉 Great news! No tasks due today. You're free to relax or get ahead on upcoming work!";
      } else {
        response = `📅 Today's Tasks (${todayTasks.length}):\n\n`;
        todayTasks.forEach((t, i) => {
          const time = new Date(t.deadline).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });
          response += `${i + 1}. ${t.title}\n   Category: ${
            t.category
          }\n   Time: ${time}\n   Status: ${
            t.status === "done" ? "✅ Done" : "⏳ Pending"
          }\n\n`;
        });
      }
      return response;
    }

    // Tomorrow's tasks
    if (
      text.includes("কাল") ||
      text.includes("tomorrow") ||
      text.includes("kal")
    ) {
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const tomorrowTasks = tasks.filter((t) => {
        const deadline = new Date(t.deadline);
        return deadline >= tomorrow && deadline < dayAfter;
      });

      if (tomorrowTasks.length === 0) {
        response = "✨ Nothing scheduled for tomorrow! You can plan ahead.";
      } else {
        response = `📆 Tomorrow's Tasks (${tomorrowTasks.length}):\n\n`;
        tomorrowTasks.forEach((t, i) => {
          response += `${i + 1}. ${t.title} (${t.category})\n   ${new Date(
            t.deadline
          ).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}\n\n`;
        });
      }
      return response;
    }

    // Overdue tasks
    if (
      text.includes("overdue") ||
      text.includes("late") ||
      text.includes("missed") ||
      text.includes("বাকি")
    ) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdue = tasks.filter((t) => {
        const deadline = new Date(t.deadline);
        return deadline < today && t.status !== "done";
      });

      if (overdue.length === 0) {
        response = "✅ Amazing! No overdue tasks. You're on top of everything!";
      } else {
        response = `⚠️ Overdue Tasks (${overdue.length}):\n\n`;
        overdue.forEach((t, i) => {
          const daysLate = Math.floor(
            (today - new Date(t.deadline)) / (1000 * 60 * 60 * 24)
          );
          response += `${i + 1}. ${t.title}\n   Category: ${
            t.category
          }\n   ${daysLate} day${daysLate !== 1 ? "s" : ""} overdue\n\n`;
        });
      }
      return response;
    }

    // Category-specific tasks
    const categories = [
      "academic",
      "personal",
      "work",
      "এক্যাডেমিক",
      "পার্সোনাল",
      "ওয়ার্ক",
    ];
    for (const cat of categories) {
      if (text.includes(cat)) {
        const categoryName = cat.charAt(0).toUpperCase() + cat.slice(1);
        const categoryTasks = tasks.filter((t) =>
          t.category.toLowerCase().includes(cat.toLowerCase())
        );

        if (categoryTasks.length === 0) {
          response = `No ${categoryName} tasks found.`;
        } else {
          const pending = categoryTasks.filter(
            (t) => t.status !== "done"
          ).length;
          response = `📁 ${categoryName} Tasks (${categoryTasks.length} total, ${pending} pending):\n\n`;
          categoryTasks.slice(0, 8).forEach((t, i) => {
            response += `${i + 1}. ${t.title}\n   Due: ${new Date(
              t.deadline
            ).toLocaleDateString()}\n   ${
              t.status === "done" ? "✅" : "⏳"
            }\n\n`;
          });
        }
        return response;
      }
    }

    // All tasks / task list
    if (
      text.includes("all") ||
      text.includes("list") ||
      text.includes("tasks") ||
      text.includes("টাস্ক") ||
      text.includes("কয়টা")
    ) {
      const pending = tasks.filter((t) => t.status !== "done").length;
      const done = tasks.filter((t) => t.status === "done").length;

      if (tasks.length === 0) {
        response = "You have no tasks yet! Ready to add your first one? 🚀";
      } else {
        response = `📋 All Tasks (${tasks.length} total)\n\n`;
        response += `✅ Completed: ${done}\n⏳ Pending: ${pending}\n\n`;

        tasks.slice(0, 10).forEach((t, i) => {
          const status = t.status === "done" ? "✅" : "⏳";
          response += `${i + 1}. ${status} ${t.title}\n   ${
            t.category
          } • ${new Date(t.deadline).toLocaleDateString()}\n\n`;
        });

        if (tasks.length > 10) {
          response += `...and ${tasks.length - 10} more tasks!\n`;
        }
      }
      return response;
    }

    // Upcoming this week
    if (
      text.includes("week") ||
      text.includes("সপ্তাহ") ||
      text.includes("upcoming")
    ) {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const weekTasks = tasks.filter((t) => {
        const deadline = new Date(t.deadline);
        return deadline >= today && deadline <= nextWeek && t.status !== "done";
      });

      if (weekTasks.length === 0) {
        response =
          "🌟 Your week looks clear! No pending tasks in the next 7 days.";
      } else {
        response = `📅 This Week (${weekTasks.length} tasks):\n\n`;
        weekTasks.forEach((t, i) => {
          response += `${i + 1}. ${t.title}\n   ${t.category}\n   ${new Date(
            t.deadline
          ).toLocaleDateString()}\n\n`;
        });
      }
      return response;
    }

    // Priority/urgent tasks
    if (
      text.includes("urgent") ||
      text.includes("priority") ||
      text.includes("important")
    ) {
      const today = new Date();
      const threeDays = new Date(today);
      threeDays.setDate(threeDays.getDate() + 3);

      const urgentTasks = tasks.filter((t) => {
        const deadline = new Date(t.deadline);
        return deadline <= threeDays && t.status !== "done";
      });

      if (urgentTasks.length === 0) {
        response = "✨ No urgent tasks! Everything's under control.";
      } else {
        response = `🔥 Urgent Tasks (due within 3 days):\n\n`;
        urgentTasks.forEach((t, i) => {
          response += `${i + 1}. ${t.title}\n   ${
            t.category
          }\n   Due: ${new Date(t.deadline).toLocaleDateString()}\n\n`;
        });
      }
      return response;
    }

    return null;
  };

  const sendMessage = async () => {
    if (!message.trim() || isTyping) return;

    const userText = message.trim();
    setMessage("");

    const userId = Date.now().toString();
    setChats((prev) => [
      ...prev,
      { id: userId, text: userText, sender: "user" },
    ]);

    // Check for smart queries first
    const smartResponse = handleSmartQuery(userText);

    if (smartResponse === "SHOW_ADD_FORM") {
      setShowAddForm(true);
      setTimeout(() => {
        setChats((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: "📝 Great! Fill out the form below to add a new task:",
            sender: "ai",
          },
        ]);
      }, 300);
      return;
    }

    if (smartResponse) {
      setIsTyping(true);
      setTimeout(() => {
        setChats((prev) => [
          ...prev,
          { id: Date.now() + 1, text: smartResponse, sender: "ai" },
        ]);
        setIsTyping(false);
      }, 600);
      return;
    }

    // Normal AI Call with context
    const aiId = (Date.now() + 1).toString();
    setChats((prev) => [...prev, { id: aiId, text: "", sender: "ai" }]);
    setIsTyping(true);

    try {
      // Add task context to AI
      const contextMessage = `User has ${tasks.length} tasks. ${userText}`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: contextMessage,
            uid: user?._id || user?.uid || "guest",
            taskCount: tasks.length,
          }),
        }
      );

      if (!response.ok) throw new Error("Network error");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiReply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (let line of lines) {
          line = line.trim();
          if (!line || line === "data: [DONE]") continue;

          if (line.startsWith("data: ")) {
            try {
              const json = JSON.parse(line.slice(6));
              const text = json.choices?.[0]?.delta?.content || "";
              if (text) {
                aiReply += text;
                setChats((prev) =>
                  prev.map((m) => (m.id === aiId ? { ...m, text: aiReply } : m))
                );
              }
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      setChats((prev) =>
        prev.map((m) =>
          m.id === aiId
            ? { ...m, text: "Sorry, I'm having trouble right now! 😔" }
            : m
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const userPhoto = user?.photoURL || user?.photo || null;
  const userInitial = user?.displayName || user?.name || "G";

  // Quick action suggestions
  const quickActions = user?.uid
    ? ["আজকের টাস্ক", "Add task", "Overdue tasks", "This week"]
    : ["What can you do?", "Tell me a joke", "Help me learn", "General advice"];

  // Handle task submission
  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!newTask.title.trim() || !newTask.deadline) {
      setChats((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "⚠️ Please fill in both title and deadline!",
          sender: "ai",
        },
      ]);
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: user.uid,
            title: newTask.title.trim(),
            category: newTask.category,
            deadline: newTask.deadline,
          }),
        }
      );

      if (response.ok) {
        setShowAddForm(false);
        setNewTask({ title: "", category: "Personal", deadline: "" });

        // Trigger refresh
        window.dispatchEvent(new Event("taskAdded"));
        await fetchTasks(false);

        setChats((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `✅ Task "${newTask.title}" added successfully!`,
            sender: "ai",
          },
        ]);
      } else {
        throw new Error("Failed to add task");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      setChats((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "❌ Sorry, failed to add the task. Please try again!",
          sender: "ai",
        },
      ]);
    }
  };

  return (
    <>
      {/* Floating AI Button - Always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-all duration-300"
      >
        {open ? (
          <X size={32} />
        ) : (
          <>
            <Bot size={32} className="group-hover:scale-110 transition" />
            {tasks.filter((t) => {
              const deadline = new Date(t.deadline);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              return deadline >= today && deadline < tomorrow;
            }).length > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                {
                  tasks.filter((t) => {
                    const deadline = new Date(t.deadline);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return deadline >= today && deadline < tomorrow;
                  }).length
                }
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-sm md:inset-auto md:bottom-24 md:right-6 md:w-96 md:h-[620px] md:rounded-2xl md:shadow-2xl md:border md:border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles size={22} className="animate-pulse" />
              </div>
              <div>
                <p className="font-bold">Overlax AI</p>
                <p className="text-xs opacity-90">
                  {user?.uid
                    ? `${tasks.length} task${
                        tasks.length !== 1 ? "s" : ""
                      } • Auto-synced`
                    : "Chat with me anytime!"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.uid && (
                <button
                  onClick={handleManualRefresh}
                  className="hover:bg-white/20 p-2 rounded-full transition"
                  title="Refresh tasks"
                >
                  <RefreshCw size={18} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="hover:bg-white/20 p-2 rounded-full transition"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-start gap-3 ${
                  chat.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {chat.sender === "ai" ? (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                      <Bot size={18} />
                    </div>
                  ) : (
                    <div className="relative">
                      {userPhoto && user?.uid ? (
                        <Image
                          src={userPhoto}
                          alt="You"
                          width={36}
                          height={36}
                          className="rounded-full object-cover ring-2 ring-blue-500"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg">
                          {user?.uid ? userInitial.charAt(0) : "G"}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[78%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                    chat.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none"
                      : "bg-white border border-gray-200 rounded-bl-none text-gray-800"
                  }`}
                >
                  {chat.text || "..."}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none">
                  <span className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </span>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {chats.length <= 1 && !isTyping && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-gray-500 text-center">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setMessage(action);
                        setTimeout(() => sendMessage(), 100);
                      }}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-xs font-medium transition"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add Task Form */}
            {showAddForm && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-purple-900 flex items-center gap-2">
                    <Bot size={18} />
                    Add New Task
                  </h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleAddTask} className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      placeholder="e.g., Complete assignment"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Category
                    </label>
                    <select
                      value={newTask.category}
                      onChange={(e) =>
                        setNewTask({ ...newTask, category: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Deadline *
                    </label>
                    <input
                      type="datetime-local"
                      value={newTask.deadline}
                      onChange={(e) =>
                        setNewTask({ ...newTask, deadline: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-medium hover:shadow-lg transition"
                    >
                      Add Task
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t flex items-center gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage()
              }
              placeholder="Ask anything..."
              className="flex-1 px-5 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={isTyping || !message.trim()}
              className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:scale-110 transition disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
