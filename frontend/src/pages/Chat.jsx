import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../context/UserContext";

export default function Chat() {
  const { user, profile } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatUsedByGuest, setChatUsedByGuest] = useState(() => localStorage.getItem("guest_chat_used") === "true");
  const messagesEndRef = useRef(null);

  const isGuest = user?.isAnonymous || profile?.is_guest;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || (isGuest && chatUsedByGuest)) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          context: { sensor_data: {}, crop_type: "tomato" },
          language: "English"
        })
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || data.message || "No response" }]);
      if (isGuest) {
        localStorage.setItem("guest_chat_used", "true");
        setChatUsedByGuest(true);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: Could not get response" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px] bg-white border border-[#2D6A4F]/20 rounded-xl overflow-hidden flex-1">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                msg.role === "user"
                  ? "bg-[#2D6A4F] text-white rounded-br-md"
                  : "bg-[#F1F7F3] text-gray-800 rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#F1F7F3] text-gray-600 px-4 py-2 rounded-2xl rounded-bl-md text-sm animate-pulse">
              AI is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-[#2D6A4F]/20 p-3 bg-[#F8FAF7]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isGuest && chatUsedByGuest ? "Login to use again" : "Ask about crops, sensors, weather..."}
            disabled={loading || (isGuest && chatUsedByGuest)}
            className="flex-1 px-4 py-2 text-sm border border-[#2D6A4F]/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 disabled:bg-gray-100 disabled:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || (isGuest && chatUsedByGuest)}
            className="px-5 py-2 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-[#2D6A4F] text-white hover:bg-[#1B4332]"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}