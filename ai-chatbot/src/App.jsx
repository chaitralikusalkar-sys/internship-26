import { useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import { initialMessages } from "./data/dummyData";

function App() {
  const [messages, setMessages] = useState(initialMessages);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // User message
    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Typing message
    const typingMessage = {
      id: Date.now() + 1,
      sender: "bot",
      text: "Typing...",
      typing: true,
      time: "",
    };

    // Show user message and typing indicator
    setMessages((prev) => [...prev, userMessage, typingMessage]);

    try {
      // Send message to FastAPI backend
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      // Remove typing message and add bot reply
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.typing),
        {
          id: Date.now() + 2,
          sender: "bot",
          text: data.reply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      console.error("Backend Error:", error);

      // Remove typing message and show error
      setMessages((prev) => [
        ...prev.filter((msg) => !msg.typing),
        {
          id: Date.now() + 3,
          sender: "bot",
          text: "❌ Unable to connect to the FastAPI backend.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
  };

  return (
    <div className="app">
      <Sidebar />

      <div className="chat-container">
        <ChatWindow messages={messages} />
        <MessageInput sendMessage={sendMessage} />
      </div>
    </div>
  );
}

export default App;