import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

function App() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState(null);

  // Fetch conversation list
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/conversations`);
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error("Error fetching conversations", err);
    }
  };

  // Fetch messages for a WA ID
  const fetchMessages = async (wa_id) => {
    try {
      setActive(wa_id);
      const res = await fetch(`${API_BASE}/api/messages/${wa_id}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  // Handle new chat creation
  const handleNewChat = (wa_id) => {
    fetchConversations();
    setTimeout(() => fetchMessages(wa_id), 300); // Auto-open the new chat
  };

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className="app dark-theme">
      <Sidebar
        conversations={conversations}
        onSelect={fetchMessages}
        active={active}
        onNewChat={handleNewChat}
      />
      <ChatWindow wa_id={active} messages={messages} />
    </div>
  );
}

export default App;
