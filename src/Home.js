// Home.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggleSwitch from "./ThemeToggleSwitch";
import "./theme.css";

export default function Home({ onStart }) {
  const navigate = useNavigate();

  // Tema
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  // Eksisterende state
  const [selectedDifficulty, setSelectedDifficulty] = useState("lett");
  const [selectedOperation, setSelectedOperation] = useState("mix");

  // NY: Spilltype
  const [selectedGameType, setSelectedGameType] = useState("quiz"); // "quiz" | "kasse"

  function handleStart() {
    // Send alt opp til App
    onStart(selectedDifficulty, selectedOperation, selectedGameType);

    // Smart navigering
    if (selectedGameType === "kasse") {
      navigate("/kasse");
    } else {
      navigate("/spill");
    }
  }

  return (
    <div className="startpage-wrapper">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 id="Velkommen">Velkommen til Matteving!</h1>
        <ThemeToggleSwitch theme={theme} toggleTheme={toggleTheme} />
      </header>

      {/* NY seksjon: velg spilltype */}
      <h2>Velg spilltype:</h2>
      <div className="game-type-buttons">
        <button
          id="quiz"
          className={selectedGameType === "quiz" ? "active" : ""}
          onClick={() => setSelectedGameType("quiz")}
        >
          📚 Quiz
        </button>
        <button
          id="kasse"
          className={selectedGameType === "kasse" ? "active" : ""}
          onClick={() => setSelectedGameType("kasse")}
        >
          🧾 Kasse-spill
        </button>
      </div>

      {/* Vis vanskelighet og operasjon bare når Quiz er valgt */}
      {selectedGameType === "quiz" && (
        <>
          <h2>Velg vanskelighetsgrad:</h2>
          <div className="difficulty-buttons">
            <button
              id="lett"
              className={selectedDifficulty === "lett" ? "active" : ""}
              onClick={() => setSelectedDifficulty("lett")}
            >
              1-10
            </button>
            <button
              id="Middels"
              className={selectedDifficulty === "middels" ? "active" : ""}
              onClick={() => setSelectedDifficulty("middels")}
            >
              1-20
            </button>
            <button
              id="Vanskelig"
              className={selectedDifficulty === "vanskelig" ? "active" : ""}
              onClick={() => setSelectedDifficulty("vanskelig")}
            >
              1-50
            </button>
          </div>

          <h2>Velg operasjon:</h2>
          <div className="operation-buttons">
            <button
              id="mix"
              className={selectedOperation === "mix" ? "active" : ""}
              onClick={() => setSelectedOperation("mix")}
            >
              Miks
            </button>
            <button
              id="plus"
              className={selectedOperation === "plus" ? "active" : ""}
              onClick={() => setSelectedOperation("plus")}
            >
              Pluss
            </button>
            <button
              id="minus"
              className={selectedOperation === "minus" ? "active" : ""}
              onClick={() => setSelectedOperation("minus")}
            >
              Minus
            </button>
            <button
              id="multiply"
              className={selectedOperation === "multiply" ? "active" : ""}
              onClick={() => setSelectedOperation("multiply")}
            >
              Gange
            </button>
            <button
              id="division"
              className={selectedOperation === "division" ? "active" : ""}
              onClick={() => setSelectedOperation("division")}
            >
              Dele
            </button>
          </div>
        </>
      )}

      {/* Start-knapp */}
      <button id="start" className="start-button" onClick={handleStart}>
        Start
      </button>
    </div>
  );
}
