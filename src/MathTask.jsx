import React from "react";

export default function MathTask({
  tekst,
  inputId,
  value,
  onChange,
  disabled,
  tilbakemelding,
  tilbakemeldingId,
  inputRef,
  onKeyDown,
}) {
  return (
    <>
      <p id={inputId.replace("brukerSvar", "oppgave")}>{tekst}</p>
      <section>
        <label htmlFor={inputId}>Svar her:</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          id={inputId}
          disabled={disabled}
          ref={inputRef}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}  
        />
      </section>
      <section className="tilbakemeldinger">
        <p id={tilbakemeldingId}>{tilbakemelding}</p>
      </section>
    </>
  );
}
