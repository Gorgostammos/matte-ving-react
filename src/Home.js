import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home({ onStart }) {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState("lett");
  const [selectedOperation, setSelectedOperation] = useState("mix");

  function handleStart() {
    onStart(selectedDifficulty, selectedOperation);
    navigate("/spill");
  }

  return (
    <div className="startpage-wrapper">
      <h1>Velkommen til Matteving!</h1>
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
      </div>

      <button id="start" className="start-button" onClick={handleStart}>
        Start
      </button>
    </div>
  );
}
