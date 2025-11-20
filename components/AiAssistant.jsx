"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X, Bot } from "lucide-react";
import Image from "next/image";

export default function AIAssistant({ user, tasks = [] }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);



  // Welcome + Task List Logic
  useEffect(() => {
  if (open && chats.length === 0) {
    const welcomeMsg = user
      ? `Hey ${firstName}! I'm Overlax AI — ready to help you crush your ${tasks.length} task${tasks.length !== 1 ? 's' : ''}!`
      : "Hey there! I'm Overlax AI — ready to help you crush your tasks!";

    setChats([{
      id: "welcome",
      text: welcomeMsg,
      sender: "ai",
    }]);
  }
}, [open, user, tasks]);



  const sendMessage = async () => {
    if (!message.trim() || isTyping) return;

    const userText = message.trim().toLowerCase();
    setMessage("");

    const userId = Date.now().toString();
    setChats((prev) => [...prev, { id: userId, text: message, sender: "user" }]);

    // Instant Task List Detection
    if (userText.includes("my task") || userText.includes("tasks") || userText.includes("কয়টা") || userText.includes("টাস্ক") || userText.includes("list")) {
      const pending = tasks.filter(t => t.status !== "done").length;
      const done = tasks.filter(t => t.status === "done").length;

      let taskListText = `You have ${tasks.length} tasks total (${pending} pending, ${done} done):\n\n`;

      if (tasks.length === 0) {
        taskListText = "You have no tasks yet! Want to add one?";
      } else {
        tasks.slice(0, 10).forEach((t, i) => {
          const status = t.status === "done" ? "Completed" : "Pending";
          taskListText += `${i + 1}. ${t.title} (${t.category})\n   → ${status}\n   Deadline: ${new Date(t.deadline).toLocaleDateString()}\n\n`;
        });
        if (tasks.length > 10) taskListText += `...and ${tasks.length - 10} more!\n`;
      }

      setTimeout(() => {
        setChats((prev) => [...prev, { id: Date.now() + 1, text: taskListText, sender: "ai" }]);
        setIsTyping(false);
      }, 800);
      setIsTyping(true);
      return;
    }

    // Normal AI Call
    const aiId = (Date.now() + 1).toString();
    setChats((prev) => [...prev, { id: aiId, text: "", sender: "ai" }]);
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: message,
          uid: user?._id || "guest"
        }),
      });

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
        prev.map((m) => (m.id === aiId ? { ...m, text: "Sorry, I'm having trouble right now!" } : m))
      );
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const userPhoto = user?.photoURL || user?.photo || "/default-avatar.png";
  const userInitial = user?.displayName || user?.name || "G";
  const firstName = userInitial.trim().split(" ")[0] || "there";
  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition duration-300"
      >
        {open ? <X size={32} /> : <Bot size={32} />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[620px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Bot size={22} />
              </div>
              <div>
                <p className="font-bold">Overlax AI</p>
                <p className="text-xs opacity-90">Always here to help</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition">
              <X size={22} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-start gap-3 ${chat.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {chat.sender === "ai" ? (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                      <Bot size={18} />
                    </div>
                  ) : (
                    <div className="relative">
                      {userPhoto ? (
                          <Image
                            src={userPhoto}
                            alt="You"
                            width={36}
                            height={36}
                            className="rounded-full object-cover ring-2 ring-blue-500"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg">
                            {userInitial.charAt(0)}
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
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </span>
                </div>
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
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask about your tasks..."
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
    </>
  );
}

// Animation
<style jsx>{`
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up { animation: slide-up 0.3s ease-out; }
`}</style>