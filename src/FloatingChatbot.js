import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import "./theme.css";

// CRA (Create React App): miljøvariabler må starte med REACT_APP_
// Sett i .env.local (dev) eller .env.production (prod):
// REACT_APP_API_BASE_URL=https://matte-ving-react.onrender.com
const API_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/+$/, "");

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastInput, setLastInput] = useState(null);
  const [theme, setTheme] = useState(
    document.documentElement.getAttribute("data-theme") || "light"
  );
  const scrollRef = useRef(null);

  // Følg data-theme endringer
  useEffect(() => {
    const target = document.documentElement;
    const obs = new MutationObserver(() => {
      const t = target.getAttribute("data-theme") || "light";
      setTheme(t);
    });
    obs.observe(target, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const toggleChat = () => setIsOpen((v) => !v);

  // Autoscroll ved nye meldinger
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setHistory((prev) => [...prev, { sender: "user", text: trimmed }]);
    setInput("");
    setErrorMsg("");
    setLoading(true);

    try {
      // Hvis API_BASE === "" bruker vi dev-proxy (package.json "proxy")
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, last_input: lastInput })
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setHistory((prev) => [
        ...prev,
        { sender: "bot", text: data?.response ?? "🤖 (tomt svar)" }
      ]);
      setLastInput(trimmed);
    } catch (err) {
      setHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Klarte ikke å kontakte serveren 😢" }
      ]);
      setErrorMsg(err?.message || "Ukjent feil");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      {/* Flytende knapp */}
      <button
        onClick={toggleChat}
        aria-label={isOpen ? "Lukk chatbot" : "Åpne chatbot"}
        className="chatbot-fab"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 10px 22px rgba(0, 0, 0, 0.32)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 18px rgba(0, 0, 0, 0.28)";
        }}
      >
        💬
      </button>

      {/* Chatvindu */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Jermy chatbot"
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "340px",
            height: "460px",
            backgroundColor: "var(--surface)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            boxShadow: "var(--shadow)",
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 12,
              borderBottom: "1px solid var(--border)",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0))",
            }}
          >
            <span>🤖 Jermy</span>
            <button
              onClick={toggleChat}
              className="chatbot-icon-btn"
              aria-label="Lukk"
              title="Lukk"
            >
              ✖
            </button>
          </div>

          <div
            ref={scrollRef}
            style={{
              flex: 1,
              padding: 10,
              overflowY: "auto",
              fontSize: 14,
              backgroundColor: "var(--surface-2)",
            }}
          >
            {history.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
                <p
                  className={msg.sender === "user" ? "user-msg" : "bot-msg"}
                  style={{
                    margin: "6px 0",
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: msg.sender === "user" ? "var(--bubble-user)" : "var(--bubble-bot)",
                    border: "1px solid var(--border)",
                    maxWidth: "85%",
                    wordWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    color: "var(--text)",
                  }}
                >
                  <strong>{msg.sender === "user" ? "Du" : "Bot"}:</strong> {msg.text}
                </p>
              </div>
            ))}

            {loading && (
              <div style={{ textAlign: "left", opacity: 0.8, fontStyle: "italic", color: "var(--muted)" }}>
                Bot: skriver …
              </div>
            )}

            {errorMsg && (
              <div style={{ color: "var(--muted)", marginTop: 8 }}>Feil: {errorMsg}</div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              padding: 10,
              borderTop: "1px solid var(--border)",
              gap: 8,
              backgroundColor: "var(--surface)",
            }}
          >
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Skriv en melding… (Enter for å sende, Shift+Enter for linjeskift)"
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 10,
                border: "1px solid var(--border)",
                fontSize: 14,
                resize: "none",
                background: "var(--surface)",
                color: "var(--text)",
                outline: "none",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="chatbot-btn"
              style={{ minWidth: 88, fontWeight: 600 }}
            >
              {loading ? "Sender…" : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
