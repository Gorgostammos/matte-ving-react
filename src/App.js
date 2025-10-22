import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Quiz from "./Quiz";
import FloatingChatbot from "./FloatingChatbot"; // 👈
import CashierGame from "./spille/CashierGame"; // 👈 NY

export default function App() {
  const [difficulty, setDifficulty] = useState("lett");
  const [operation, setOperation] = useState("mix");
  const[gameType, setGameType] = useState("quiz");

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              onStart={(d, o) => {
                setDifficulty(d);
                setOperation(o);
              }}
            />
          }
        />
        <Route
          path="/spill"
          element={<Quiz difficulty={difficulty} operation={operation} />}
        />
        <Route
          path="/kasse"
          element={<CashierGame />} // 👈 NY route
        />
      </Routes>

      <FloatingChatbot />
    </Router>
  );
}
