import React, { useState, useRef } from "react";
import "./App.css";

function genererTall() {
  return Math.floor(Math.random() * 10) + 1;
}

function getInitialTasks() {
  // Generer tall for hver oppgave
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

export default function App() {
  const [poeng, setPoeng] = useState(0);
  const [oppgaver, setOppgaver] = useState(getInitialTasks());
  const [input, setInput] = useState(Array(5).fill(""));
  const [tilbakemeldinger, setTilbakemeldinger] = useState(Array(5).fill(""));
  const [rundeTilbakemelding, setRundeTilbakemelding] = useState("");
  const [hurra, setHurra] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [sluttMelding, setSluttMelding] = useState("");

  // Fokus på første input etter runde
  const inputRefs = useRef([]);

  // Streak Hurra
  function streakPoeng(nyPoeng) {
    if (nyPoeng === 10) {
      setHurra("Hurra! Du klarte 10 poeng, bra jobbet! 🎉");
      setTimeout(() => setHurra(""), 3000);
    } else if (nyPoeng === 20) {
      setHurra("Hurra! Du klarte 20 poeng, bra jobbet! 🎉");
      setTimeout(() => setHurra(""), 3000);
    }
  }

  // Sjekk alle svar samtidig (som i JS-filen)
  function sjekkSvar() {
    if (disabled) return;

    let riktige = 0;
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
      }
    });

    setTilbakemeldinger(nyeTilbakemeldinger);
    setPoeng(nyPoeng);
    streakPoeng(nyPoeng);
    setRundeTilbakemelding(
      `Du fikk ${riktige} av ${oppgaver.length} riktige.`
    );

    // Ny runde etter 2,3 sekunder
    setTimeout(() => {
      setOppgaver(getInitialTasks());
      setInput(Array(5).fill(""));
      setTilbakemeldinger(Array(5).fill(""));
      setRundeTilbakemelding("");
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, 2300);
  }

  // Avslutt spill
  function avsluttSpill() {
    setSluttMelding(
      `🧠 Spillet er over! Du endte med totalt ${poeng} poeng. God innsats!`
    );
    setDisabled(true);
  }

  return (
    <div>
      <h1 id="Poeng">Poeng: {poeng}</h1>
      <p id="hurra" style={{ color: "blue" }}>
        {hurra}
      </p>

      <h2>Regn ut disse oppgavene: </h2>

      <article id="main">
        {oppgaver.map((oppgave, idx) => (
          <React.Fragment key={idx}>
            <h3>Oppgave {idx + 1}</h3>
            <article className="oppgaver">
              <p id={`oppgave${idx === 0 ? "" : idx + 1}`}>{oppgave.tekst}</p>
              <section>
                <label htmlFor={oppgave.inputId}>Svar her:</label>
                <input
                  type="number"
                  id={oppgave.inputId}
                  disabled={disabled}
                  ref={el => (inputRefs.current[idx] = el)}
                  value={input[idx]}
                  onChange={e => {
                    const ny = [...input];
                    ny[idx] = e.target.value;
                    setInput(ny);
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && idx === 4) sjekkSvar();
                  }}
                />
              </section>
              <section className="tilbakemeldinger">
                <p id={oppgave.tilbakemeldingId}>
                  {tilbakemeldinger[idx]}
                </p>
              </section>
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
    </div>
  );
}
