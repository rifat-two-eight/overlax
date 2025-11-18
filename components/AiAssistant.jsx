"use client";

import { useEffect, useRef, useState } from "react";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && chats.length === 0) {
      setChats([
        {
          id: "welcome",
          text: "Hey! I'm Overlax AI — ready to help you crush your tasks!",
          sender: "ai",
        },
      ]);
    }
  }, [open]);

  const sendMessage = async () => {
    if (!message.trim() || isTyping) return;

    const userText = message.trim();
    setMessage("");

    const userId = Date.now().toString();
    setChats((prev) => [...prev, { id: userId, text: userText, sender: "user" }]);

    const aiId = (Date.now() + 1).toString();
    setChats((prev) => [...prev, { id: aiId, text: "", sender: "ai" }]);
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) throw new Error("Network error");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (let line of lines) {
          line = line.trim();
          if (!line) continue;
          if (line === "data: [DONE]") break;

          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              const text = parsed.choices?.[0]?.delta?.content || "";
              if (text) {
                setChats((prev) =>
                  prev.map((m) => (m.id === aiId ? { ...m, text: m.text + text } : m))
                );
              }
            } catch (e) {
              // ignore parse errors
            }
          } else {
            // fallback in case plain text is sent
            setChats((prev) =>
              prev.map((m) => (m.id === aiId ? { ...m, text: m.text + line } : m))
            );
          }
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setChats((prev) =>
        prev.map((m) => (m.id === aiId ? { ...m, text: "Sorry, try again!" } : m))
      );
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl text-3xl z-50 hover:scale-110 transition"
      >
        {open ? "×" : "AI"}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border flex flex-col z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-5 font-bold text-center relative">
            Overlax AI
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-6 text-3xl"
            >
              ×
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`flex ${
                  chat.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-5 py-3 rounded-2xl ${
                    chat.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-black"
                  }`}
                >
                  {chat.text || "..."}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-5 py-3 rounded-2xl">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask Overlax AI..."
                className="input input-bordered flex-1 rounded-full"
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                className="btn btn-circle bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
