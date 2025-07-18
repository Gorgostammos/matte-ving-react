import React from "react";
import "./ThemeToggleSwitch.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

export default function ThemeToggleSwitch({ theme, toggleTheme }) {
  return (
    <div className="toggle-switch-wrapper">
      <span className={`toggle-label ${theme === "dark" ? "active" : ""}`}>DARK</span>
      <label className="switch">
        <input
          type="checkbox"
          checked={theme === "light"}
          onChange={toggleTheme}
          aria-label="Bytt tema"
        />
        <span className="slider round">
          <span className="icon">
            {theme === "light" ? (
              <FontAwesomeIcon icon={faSun} />
            ) : (
              <FontAwesomeIcon icon={faMoon} />
            )}
          </span>
        </span>
      </label>
      <span className={`toggle-label ${theme === "light" ? "active" : ""}`}>LIGHT</span>
    </div>
  );
}
