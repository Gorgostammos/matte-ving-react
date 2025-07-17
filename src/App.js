import React, { useState, useRef } from "react";
import MathTask from "./MathTask";
import Modal from "./Modal";
import confetti from "canvas-confetti";
import "./App.css";

// Konfetti-funksjon
function triggerConfetti() {
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

function genererTall() {
  return Math.floor(Math.random() * 10) + 1;
}

function getInitialTasks() {
  const t1 = genererTall(),
    t2 = genererTall();
  const t3 = genererTall(),
    t4 = genererTall();
  const t5 = genererTall(),
    t6 = genererTall();
  const t7 = genererTall(),
    t8 = genererTall();

  return [
    {
      tekst: `Hva er ${t1} + ${t2}?`,
      fasit: t1 + t2,
      inputId: "brukerSvar",
      tilbakemeldingId: "tilbakemelding",
    },
    {
      tekst: `Hva er ${t3} x ${t4}?`,
      fasit: t3 * t4,
      inputId: "brukerSvar1",
      tilbakemeldingId: "tilbakemelding1",
    },
    {
      tekst: `Hva er ${t5} - ${t6}?`,
      fasit: t5 - t6,
      inputId: "brukerSvar2",
      tilbakemeldingId: "tilbakemelding2",
    },
    {
      tekst: `Hva er ${t7} + ${t8} + ${t2}?`,
      fasit: t7 + t8 + t2,
      inputId: "brukerSvar3",
      tilbakemeldingId: "tilbakemelding3",
    },
    {
      tekst: `Hva er ${t1} + ${t4} - ${t6}?`,
      fasit: t1 + t4 - t6,
      inputId: "brukerSvar4",
      tilbakemeldingId: "tilbakemelding4",
    },
  ];
}

function getSavedHighscore() {
  return Number(localStorage.getItem("matteVingHighscore")) || 0;
}

export default function App() {
  const [poeng, setPoeng] = useState(0);
  const [highscore, setHighscore] = useState(getSavedHighscore());
  const [oppgaver, setOppgaver] = useState(getInitialTasks());
  const [input, setInput] = useState(Array(5).fill(""));
  const [tilbakemeldinger, setTilbakemeldinger] = useState(Array(5).fill(""));
  const [rundeTilbakemelding, setRundeTilbakemelding] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [sluttMelding, setSluttMelding] = useState("");
  const [hearts, setHearts] = useState(5);
  const [showModal, setShowModal] = useState(false);

  // For Hurra-popup:
  const [showHurraModal, setShowHurraModal] = useState(false);
  const [hurraMessage, setHurraMessage] = useState("");

  // For feiring av titall
  const [lastCelebrated, setLastCelebrated] = useState(0);

  const inputRefs = useRef([]);

  // Feiring hver gang du passerer et nytt titall
  function streakPoeng(nyPoeng, prevPoeng = lastCelebrated) {
    if (nyPoeng > highscore) {
      setHighscore(nyPoeng);
      localStorage.setItem("matteVingHighscore", nyPoeng);
    }
    // Finn nærmeste titall du ikke har feiret
    const nextCelebrate = Math.floor(prevPoeng / 10 + 1) * 10;
    if (nyPoeng >= nextCelebrate && nextCelebrate > 0) {
      setHurraMessage(
        `Hurra! Du klarte ${nextCelebrate} poeng, bra jobbet! 🎉`
      );
      setShowHurraModal(true);
      triggerConfetti();
      setLastCelebrated(nextCelebrate);
    }
  }

  function sjekkSvar() {
    if (disabled || hearts === 0) return;

    let riktige = 0;
    let noenFeil = false;
    let nyeTilbakemeldinger = [...tilbakemeldinger];
    let nyPoeng = poeng;

    oppgaver.forEach((oppgave, i) => {
      const brukerSvar = input[i];
      if (
        brukerSvar === "" ||
        brukerSvar === null ||
        typeof brukerSvar === "undefined"
      ) {
        nyeTilbakemeldinger[i] = "Skriv inn et tall.";
        noenFeil = true;
      } else if (Number(brukerSvar) === oppgave.fasit) {
        nyeTilbakemeldinger[i] = "✅ Riktig!";
        nyPoeng++;
        riktige++;
      } else {
        nyeTilbakemeldinger[i] = `❌ Feil. Riktig svar er ${oppgave.fasit}.`;
        noenFeil = true;
      }
    });

    // Hvis noen feil i runden: trekk ett hjerte (ikke mer enn én per runde)
    let nyeHjerter = hearts;
    if (noenFeil) {
      nyeHjerter = Math.max(hearts - 1, 0);
      setHearts(nyeHjerter);
    }

    setTilbakemeldinger(nyeTilbakemeldinger);
    setPoeng(nyPoeng);
    streakPoeng(nyPoeng, poeng); // pass på å sende med "forrige poeng"
    setRundeTilbakemelding(`Du fikk ${riktige} av ${oppgaver.length} riktige.`);

    // GAME OVER
    if (nyeHjerter === 0) {
      setDisabled(true);
      setSluttMelding("😵 Game over! Du mistet alle hjertene.");
      setShowModal(true);
      return;
    }

    if (riktige === 5 && hearts <= 2 && hearts < 5) {
      nyeHjerter = hearts + 1;
      setHearts(nyeHjerter);
      setHurraMessage("🎉 Perfekt runde! Du vant tilbake ett hjerte! ❤️");
      setShowHurraModal(true);
      triggerConfetti();
    }

    // Ny runde etter 2.3 sekunder hvis fortsatt liv igjen
    setTimeout(() => {
      setOppgaver(getInitialTasks());
      setInput(Array(5).fill(""));
      setTilbakemeldinger(Array(5).fill(""));
      setRundeTilbakemelding("");
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, 10000);
  }

  function avsluttSpill() {
    setSluttMelding(
      `🧠 Spillet er over! Du endte med totalt ${poeng} poeng. God innsats!`
    );
    setDisabled(true);
  }

  function startPaaNytt() {
    setPoeng(0);
    setOppgaver(getInitialTasks());
    setInput(Array(5).fill(""));
    setTilbakemeldinger(Array(5).fill(""));
    setRundeTilbakemelding("");
    setSluttMelding("");
    setHearts(5);
    setDisabled(false);
    setShowModal(false);
    setShowHurraModal(false);
    setLastCelebrated(0);
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }

  return (
    <div>
      <h1 id="Poeng">Poeng: {poeng}</h1>
      <p style={{ fontWeight: "bold", color: "purple" }}>
        Høyeste poengsum: {highscore}
      </p>
      <div style={{ fontSize: "2rem", margin: "15px" }}>
        <div style={{ fontSize: "2rem", margin: "15px" }}>
          {Array(Math.max(hearts, 0))
            .fill(null)
            .map((_, index) => (
              <span
                key={index}
                className={`heart ${hearts <= 2 ? "pulse-heart" : ""}`}
              >
                ❤️
              </span>
            ))}
        </div>
      </div>

      <h2>Regn ut disse oppgavene: </h2>

      <article id="main">
        {oppgaver.map((oppgave, idx) => (
          <React.Fragment key={idx}>
            <h3>Oppgave {idx + 1}</h3>
            <article className="oppgaver">
              <MathTask
                tekst={oppgave.tekst}
                inputId={oppgave.inputId}
                value={input[idx]}
                onChange={(e) => {
                  const ny = [...input];
                  ny[idx] = e.target.value;
                  setInput(ny);
                }}
                disabled={disabled}
                tilbakemelding={tilbakemeldinger[idx]}
                tilbakemeldingId={oppgave.tilbakemeldingId}
                inputRef={(el) => (inputRefs.current[idx] = el)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && idx === 4) sjekkSvar();
                }}
              />
            </article>
          </React.Fragment>
        ))}
      </article>

      <section id="knapper">
        <section id="sjekkSvar">
          <button
            id="sjekkSvar"
            onClick={sjekkSvar}
            disabled={disabled}
            style={{ cursor: disabled ? "not-allowed" : "pointer" }}
          >
            Sjekk svar
          </button>
        </section>
        <section id="avsluttSpill">
          <button
            id="avsluttSpill"
            onClick={avsluttSpill}
            disabled={disabled}
            style={{ cursor: disabled ? "not-allowed" : "pointer" }}
          >
            Avslutt
          </button>
        </section>
      </section>
      <p id="sluttMelding">{sluttMelding}</p>
      <p id="rundeTilbakemelding">{rundeTilbakemelding}</p>
      {disabled && !showModal && (
        <button style={{ marginTop: 20, fontSize: 20 }} onClick={startPaaNytt}>
          Start på nytt
        </button>
      )}

      {/* Hurra! - popup */}
      <Modal open={showHurraModal} onClose={() => setShowHurraModal(false)}>
        <h2 style={{ color: "green" }}>🎉 Gratulerer! 🎉</h2>
        <p>{hurraMessage}</p>
        <button
          style={{
            marginTop: 20,
            fontSize: 18,
            borderRadius: 8,
            padding: "8px 22px",
            background: "blue",
            color: "white",
            border: "none",
          }}
          onClick={() => setShowHurraModal(false)}
        >
          Fortsett
        </button>
      </Modal>

      {/* Game over - popup */}
      <Modal open={showModal} onClose={() => {}}>
        <h2>😵 Game Over!</h2>
        <p>Du mistet alle hjertene.</p>
        <p style={{ fontWeight: "bold", color: "purple" }}>
          Poeng: {poeng}
          <br />
          Highscore: {highscore}
        </p>
        <button
          style={{
            marginTop: 20,
            fontSize: 18,
            borderRadius: 8,
            padding: "8px 22px",
            background: "green",
            color: "white",
            border: "none",
          }}
          onClick={() => {
            startPaaNytt();
            setShowModal(false);
          }}
        >
          Prøv igjen
        </button>
      </Modal>
    </div>
  );
}
