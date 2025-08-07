import React, { useState } from "react";

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setHistory((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.response };
      setHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      setHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Klarte ikke å kontakte serveren 😢" },
      ]);
    }

    setInput("");
  };

  return (
    <div>
      {/* Flytende knapp */}
      <button
        onClick={toggleChat}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "15px 20px",
          borderRadius: "50%",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          fontSize: 18,
          cursor: "pointer",
          zIndex: 999,
        }}
      >
        💬
      </button>

      {/* Chatvindu */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "320px",
            height: "400px",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
          }}
        >
          <div style={{ padding: 10, borderBottom: "1px solid #ccc", fontWeight: "bold" }}>
            🤖 MatteBot
            <button
              onClick={toggleChat}
              style={{
                float: "right",
                background: "none",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>
          <div
            style={{
              flex: 1,
              padding: 10,
              overflowY: "auto",
              fontSize: 14,
              backgroundColor: "#f9f9f9",
            }}
          >
            {history.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
                <p style={{ margin: "6px 0" }}>
                  <strong>{msg.sender === "user" ? "Du" : "Bot"}:</strong> {msg.text}
                </p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", padding: 10, borderTop: "1px solid #ccc" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Skriv en melding..."
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 5,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                marginLeft: 5,
                padding: "8px 12px",
                borderRadius: 5,
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
