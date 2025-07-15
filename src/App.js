import React, { useState, useRef } from "react";
import MathTask from "./MathTask";
import "./App.css";

function genererTall() {
  return Math.floor(Math.random() * 10) + 1;
}

function getInitialTasks() {
  const t1 = genererTall(), t2 = genererTall();
  const t3 = genererTall(), t4 = genererTall();
  const t5 = genererTall(), t6 = genererTall();
  const t7 = genererTall(), t8 = genererTall();

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
  const [hurra, setHurra] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [sluttMelding, setSluttMelding] = useState("");
  const [hearts, setHearts] = useState(5);
  const inputRefs = useRef([]);

  function streakPoeng(nyPoeng) {
    if (nyPoeng > highscore) {
      setHighscore(nyPoeng);
      localStorage.setItem("matteVingHighscore", nyPoeng);
    }
    if (nyPoeng === 10) {
      setHurra("Hurra! Du klarte 10 poeng, bra jobbet! 🎉");
      setTimeout(() => setHurra(""), 3000);
    } else if (nyPoeng === 20) {
      setHurra("Hurra! Du klarte 20 poeng, bra jobbet! 🎉");
      setTimeout(() => setHurra(""), 3000);
    }
  }

  function sjekkSvar() {
    if (disabled || hearts === 0) return;

    let riktige = 0;
    let noenFeil = false;
    let nyeTilbakemeldinger = [...tilbakemeldinger];
    let nyPoeng = poeng;
    oppgaver.forEach((oppgave, i) => {
      const brukerSvar = Number(input[i]);
      if (isNaN(brukerSvar)) {
        nyeTilbakemeldinger[i] = "Skriv inn et tall.";
      } else if (brukerSvar === oppgave.fasit) {
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
    streakPoeng(nyPoeng);
    setRundeTilbakemelding(
      `Du fikk ${riktige} av ${oppgaver.length} riktige.`
    );

    // GAME OVER
    if (nyeHjerter === 0) {
      setDisabled(true);
      setSluttMelding("😵 Game over! Du mistet alle hjertene.");
      return;
    }

    // Ny runde etter 2.3 sekunder hvis fortsatt liv igjen
    setTimeout(() => {
      setOppgaver(getInitialTasks());
      setInput(Array(5).fill(""));
      setTilbakemeldinger(Array(5).fill(""));
      setRundeTilbakemelding("");
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, 2300);
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
    setHurra("");
    setHearts(2);
    setDisabled(false);
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }

  return (
    <div>
      <h1 id="Poeng">Poeng: {poeng}</h1>
      <p style={{ fontWeight: "bold", color: "purple" }}>
        Høyeste poengsum: {highscore}
      </p>
      <div style={{ fontSize: "2rem", margin: "15px" }}>
        {Array(Math.max(hearts, 0)).fill("❤️").join(" ")}
      </div>
      <p id="hurra" style={{ color: "blue", transition: "all 0.5s" }}>
        {hurra && "🎉"} {hurra}
      </p>

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
                onChange={e => {
                  const ny = [...input];
                  ny[idx] = e.target.value;
                  setInput(ny);
                }}
                disabled={disabled}
                tilbakemelding={tilbakemeldinger[idx]}
                tilbakemeldingId={oppgave.tilbakemeldingId}
                inputRef={el => (inputRefs.current[idx] = el)}
                onKeyDown={e => {
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
      {disabled && (
        <button style={{ marginTop: 20, fontSize: 20 }} onClick={startPaaNytt}>
          Start på nytt
        </button>
      )}
    </div>
  );
}
