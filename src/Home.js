import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home({ onStart }) {
  const navigate = useNavigate();

  function handleStart(level) {
    onStart(level); // Oppdaterer vanskelighetsgrad i App
    navigate("/spill"); // Gå til spillet
  }

  return (
    <div className="startpage-wrapper">
      <h1>Velkommen til Matteving!</h1>
      <h2>Velg vanskelighetsgrad:</h2>
      <div className="difficulty-buttons">
        <button id="lett" onClick={() => handleStart("lett")}>1-10</button>
        <button id="Middels" onClick={() => handleStart("middels")}>1-20</button>
        <button id="Vanskelig" onClick={() => handleStart("vanskelig")}>1-50</button>
      </div>
    </div>
  );
}
