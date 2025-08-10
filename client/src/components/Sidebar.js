import React, { useState, useMemo } from "react";

export default function Sidebar({ conversations, onSelect, active, onNewChat }) {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [waId, setWaId] = useState("");
  const [firstMsg, setFirstMsg] = useState("");

  const list = useMemo(() => {
    if (!query) return conversations;
    const q = query.toLowerCase();
    return conversations.filter((c) => {
      const name = (c.name || c.wa_id || "").toLowerCase();
      const last = (c.lastMessage?.text || "").toLowerCase();
      return name.includes(q) || last.includes(q);
    });
  }, [conversations, query]);

  async function handleCreateChat(e) {
    e.preventDefault();
    if (!waId.trim()) return;
    try {
      const res = await fetch(
        (process.env.REACT_APP_API_BASE || "http://localhost:4000") +
          "/api/conversations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wa_id: waId.trim(),
            to: waId.trim(),
            text: firstMsg.trim(),
          }),
        }
      );
      const data = await res.json();
      if (data.ok) {
        onNewChat(data.message.wa_id);
        setShowModal(false);
        setWaId("");
        setFirstMsg("");
      } else {
        alert(data.error || "Failed to create chat");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating chat");
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="brand">WhatsApp Clone</div>
        <button className="btn" onClick={() => setShowModal(true)}>
          ➕ New Chat
        </button>
      </div>

      <div className="searchbar">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search or start new chat"
        />
      </div>

      <div className="conversations">
        {list.map((c) => (
          <div
            key={c.wa_id}
            className={"conv" + (active === c.wa_id ? " active" : "")}
            onClick={() => onSelect(c.wa_id)}
          >
            <div className="conv-avatar">
              {(c.name || c.wa_id || "").slice(-2)}
            </div>
            <div className="conv-meta">
              <div className="conv-name">{c.name || c.wa_id}</div>
              <div className="conv-last">
                {c.lastMessage?.text || "No messages yet"}
              </div>
            </div>
          </div>
        ))}
        {!conversations.length && (
          <div className="empty">No conversations yet.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Start New Chat</h3>
            <form onSubmit={handleCreateChat}>
              <label>WA ID:</label>
              <input
                value={waId}
                onChange={(e) => setWaId(e.target.value)}
                placeholder="e.g. 919999999999"
              />
              <label>First message (optional):</label>
              <input
                value={firstMsg}
                onChange={(e) => setFirstMsg(e.target.value)}
                placeholder="Say hello..."
              />
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
