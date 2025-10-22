// src/CashierGame.jsx
import React, { useEffect, useState } from "react";

export default function CashierGame() {
  const [price, setPrice] = useState(0);
  const [payment, setPayment] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [customer, setCustomer] = useState(null);

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async function fetchCustomer() {
    try {
      const res = await fetch(
        "https://randomuser.me/api/?inc=picture,name&noinfo"
      );
      const data = await res.json();
      setCustomer({
        name: `${data.results[0].name.first} ${data.results[0].name.last}`,
        img: data.results[0].picture.medium,
      });
    } catch {
      setCustomer({ name: "Kunde", img: null });
    }
  }

  function generateNewTask() {
    // Pris mellom 10–99 kr
    const newPrice = randomInt(10, 99);
    // Betaling fra et sett (50, 100, 200) som alltid er >= pris
    const options = [50, 100, 200, 500].filter((x) => x >= newPrice);
    const newPayment = options[randomInt(0, options.length - 1)];

    setPrice(newPrice);
    setPayment(newPayment);
    setAnswer("");
    setFeedback("");
    fetchCustomer();
  }

  useEffect(() => {
    generateNewTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function checkAnswer() {
    const correct = payment - price;
    const parsed = parseInt(answer, 10);
    if (!Number.isFinite(parsed)) {
      setFeedback("Skriv et tall 😅");
      return;
    }
    if (parsed === correct) {
      setFeedback("Riktig! ✅");
      setScore((s) => s + 1);
    } else {
      setFeedback(`Feil 😅 Riktig svar: ${correct} kr`);
    }
    setTimeout(generateNewTask, 1500);
  }

  return (
    <div
      className="cashier-wrapper"
      style={{ maxWidth: 540, margin: "0 auto", padding: 16 }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {customer?.img ? (
          <img
            src={customer.img}
            alt="Kunde"
            width={56}
            height={56}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--accent, #eee)",
            }}
          />
        )}
        <div>
          <h2 style={{ margin: 0 }}>🧾 Kasse-spill</h2>
          <small style={{ opacity: 0.8 }}>{customer?.name || "Kunde"}</small>
        </div>
      </header>

      <div
        style={{
          border: "1px solid var(--border-color, #ddd)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <p style={{ margin: "8px 0" }}>
          Kunden kjøper for <b>{price} kr</b>
        </p>
        <p style={{ margin: "8px 0" }}>
          Kunden betaler med <b>{payment} kr</b>
        </p>

        <label htmlFor="vekspenger" style={{ display: "block", marginTop: 8 }}>
          Hvor mye får han tilbake?
        </label>
        <input
          id="vekspenger"
          type="number"
          inputMode="numeric"
          placeholder="Skriv beløp i kr"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid var(--border-color, #ddd)",
            marginTop: 6,
          }}
          onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
        />
        <button
          onClick={checkAnswer}
          style={{
            marginTop: 10,
            padding: "10px 14px",
            borderRadius: 10,
            border: "none",
            background: "var(--btn, #3b82f6)",
            color: "white",
            cursor: "pointer",
          }}
        >
          Sjekk svar
        </button>

        <p style={{ minHeight: 24, marginTop: 10 }}>{feedback}</p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div>
          Poeng: <b>{score}</b>
        </div>
        <button
          onClick={generateNewTask}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid var(--border-color, #ddd)",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Ny kunde 🔁
        </button>
      </div>
    </div>
  );
}
