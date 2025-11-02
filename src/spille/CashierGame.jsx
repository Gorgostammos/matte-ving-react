import React, { useEffect, useMemo, useState } from "react";
import items from "./items.json";

export default function CashierGamePro() {
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [totalAnswer, setTotalAnswer] = useState("");
  const [changeAnswer, setChangeAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [step, setStep] = useState("sum");
  const [payment, setPayment] = useState(null);

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

  const cartTotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.price * line.qty, 0),
    [cart]
  );

  function generateCart() {
    const count = randomInt(2, Math.min(5, items.length));
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const selection = shuffled.slice(0, count);
    const withQty = selection.map((it) => ({ ...it, qty: randomInt(1, 2) }));
    setCart(withQty);
  }

  function generatePayment(total) {
    const options = [50, 100, 200, 500, 1000].filter((x) => x >= total);
    const pick = options[randomInt(0, options.length - 1)];
    setPayment(pick);
  }

  function newRound() {
    setStep("sum");
    setFeedback("");
    setTotalAnswer("");
    setChangeAnswer("");
    setPayment(null);
    generateCart();
    fetchCustomer();
  }

  useEffect(() => {
    newRound();
  }, []);

  function checkTotal() {
    const parsed = parseInt(totalAnswer, 10);
    if (!Number.isFinite(parsed)) {
      setFeedback("Skriv et tall for totalen 😅");
      return;
    }
    if (parsed === cartTotal) {
      setFeedback("Riktig total! ✅ Nå betaler kunden.");
      setScore((s) => s + 1);
      setStep("change");
      generatePayment(cartTotal);
      setTimeout(() => {
        const el = document.getElementById("vekspenger");
        if (el) el.focus();
      }, 50);
    } else {
      setFeedback(`Feil total 😅 Riktig er ${cartTotal} kr`);
    }
  }

  function checkChange() {
    const correct = (payment || 0) - cartTotal;
    const parsed = parseInt(changeAnswer, 10);
    if (!Number.isFinite(parsed)) {
      setFeedback("Skriv et tall for veksel 😅");
      return;
    }
    if (parsed === correct) {
      setFeedback("Spot on! ✅");
      setScore((s) => s + 1);
      setTimeout(newRound, 1200);
    } else {
      setFeedback(`Ikke helt. Riktig veksel er ${correct} kr`);
      setTimeout(newRound, 1600);
    }
  }

  return (
    <div
      className="cashier-wrapper"
      style={{ maxWidth: 640, margin: "0 auto", padding: 16 }}
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
          <h2 style={{ margin: 0 }}>🧾 Kasse-spill Pro</h2>
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
        <p style={{ margin: "8px 0 12px" }}>
          Kunden legger disse varene i handlekurven:
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  paddingBottom: 6,
                  borderBottom: "1px solid #eee",
                }}
              >
                Vare
              </th>
              <th
                style={{
                  textAlign: "right",
                  paddingBottom: 6,
                  borderBottom: "1px solid #eee",
                }}
              >
                Pris
              </th>
              <th
                style={{
                  textAlign: "right",
                  paddingBottom: 6,
                  borderBottom: "1px solid #eee",
                }}
              >
                Antall
              </th>
              <th
                style={{
                  textAlign: "right",
                  paddingBottom: 6,
                  borderBottom: "1px solid #eee",
                }}
              >
                Sum
              </th>
            </tr>
          </thead>
          <tbody>
            {cart.map((line) => (
              <tr key={line.id}>
                <td style={{ padding: "8px 0" }}>{line.name}</td>
                <td style={{ padding: "8px 0", textAlign: "right" }}>
                  {line.price} kr
                </td>
                <td style={{ padding: "8px 0", textAlign: "right" }}>
                  {line.qty}
                </td>
                <td style={{ padding: "8px 0", textAlign: "right" }}>
                  {line.price * line.qty} kr
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={3}
                style={{ paddingTop: 8, fontWeight: 600, textAlign: "right" }}
              >
                Total
              </td>
              <td
                style={{ paddingTop: 8, fontWeight: 600, textAlign: "right" }}
              >
                {step === "change" ? `${cartTotal} kr` : "?"}
              </td>
            </tr>
          </tfoot>
        </table>

        {step === "sum" && (
          <div style={{ marginTop: 16 }}>
            <label
              htmlFor="total"
              style={{ display: "block", marginBottom: 6 }}
            >
              Hva er totalbeløpet?
            </label>
            <input
              id="total"
              type="number"
              inputMode="numeric"
              placeholder="Skriv total i kr"
              value={totalAnswer}
              onChange={(e) => setTotalAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkTotal()}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-color, #ddd)",
              }}
            />
            <button
              onClick={checkTotal}
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
              Sjekk total
            </button>
          </div>
        )}

        {step === "change" && (
          <div style={{ marginTop: 16 }}>
            <p style={{ margin: "8px 0" }}>
              Kunden betaler med <b>{payment} kr</b>
            </p>
            <label
              htmlFor="vekspenger"
              style={{ display: "block", marginBottom: 6 }}
            >
              Hvor mye får han tilbake?
            </label>
            <input
              id="vekspenger"
              type="number"
              inputMode="numeric"
              placeholder="Skriv beløp i kr"
              value={changeAnswer}
              onChange={(e) => setChangeAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkChange()}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--border-color, #ddd)",
              }}
            />
            <button
              onClick={checkChange}
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
              Sjekk veksel
            </button>
          </div>
        )}

        <p style={{ minHeight: 24, marginTop: 12 }}>{feedback}</p>
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
          Poeng: <b>{score}</b>{" "}
          <span style={{ opacity: 0.7 }}>(+1 for total, +1 for veksel)</span>
        </div>
        <button
          onClick={newRound}
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
