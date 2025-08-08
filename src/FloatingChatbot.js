import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import "./theme.css";

const API_BASE =
  import.meta?.env?.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://127.0.0.1:5000";

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

  // Følg med på data-theme endringer
  useEffect(() => {
    const target = document.documentElement;
    const obs = new MutationObserver(() => {
      const t = target.getAttribute("data-theme") || "light";
      setTheme(t); // trigger re-render for å bruke riktige CSS-vars
    });
    obs.observe(target, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const toggleChat = () => setIsOpen((v) => !v);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history, isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setHistory((p) => [...p, { sender: "user", text: trimmed }]);
    setInput("");
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, last_input: lastInput }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setHistory((p) => [...p, { sender: "bot", text: data.response ?? "🤖 (tomt svar)" }]);
      setLastInput(trimmed);
    } catch (e) {
      setHistory((p) => [...p, { sender: "bot", text: "Klarte ikke å kontakte serveren 😢" }]);
      setErrorMsg(e?.message || "Ukjent feil");
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
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "15px 20px",
          borderRadius: "50%",
          backgroundColor: "var(--primary)",
          color: "var(--surface)",
          border: "none",
          fontSize: 18,
          cursor: "pointer",
          zIndex: 999,
          boxShadow: "var(--shadow)",
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
            borderRadius: "10px",
            boxShadow: "var(--shadow)",
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
          }}
        >
          <div style={{ padding: 10, borderBottom: "1px solid var(--border)", fontWeight: "bold" }}>
            🤖 Jermy
            <button
              onClick={toggleChat}
              style={{
                float: "right",
                background: "none",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
                color: "var(--text)",
              }}
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
                    padding: "6px 10px",
                    borderRadius: 8,
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

          <div style={{ display: "flex", padding: 10, borderTop: "1px solid var(--border)", gap: 6 }}>
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Skriv en melding… (Enter for å sende, Shift+Enter for linjeskift)"
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 5,
                border: "1px solid var(--border)",
                fontSize: 14,
                resize: "none",
                background: "var(--surface)",
                color: "var(--text)",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: "8px 12px",
                borderRadius: 5,
                backgroundColor: loading ? "var(--primary-weak)" : "var(--primary)",
                color: "var(--surface)",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                minWidth: 70,
              }}
            >
              {loading ? "Sender..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
