import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Quiz from "./Quiz";

export default function App() {
  const [difficulty, setDifficulty] = useState("lett");
  // Du kan legge global state her hvis det trengs i fremtiden

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home onStart={setDifficulty} />} />
        <Route path="/spill" element={<Quiz difficulty={difficulty} />} />
      </Routes>
    </Router>
  );
}
