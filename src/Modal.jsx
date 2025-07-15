import React from "react";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem 2.5rem",
          borderRadius: "16px",
          boxShadow: "0 2px 20px rgba(0,0,0,0.18)",
          textAlign: "center",
          minWidth: "300px",
        }}
        onClick={e => e.stopPropagation()} // Hindrer at modalen lukkes når du klikker inni
      >
        {children}
      </div>
    </div>
  );
}
