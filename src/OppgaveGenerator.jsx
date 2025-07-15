import React, { useState } from 'react';

const lagOppgave = () => {
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const operasjon = Math.random() > 0.5 ? '+' : '-';
  const svar = operasjon === '+' ? a + b : a - b;
  return { tekst: `${a} ${operasjon} ${b}`, fasit: svar };
};

export default function OppgaveGenerator() {
  const [oppgave, setOppgave] = useState(lagOppgave());
  const [input, setInput] = useState('');
  const [tilbakemelding, setTilbakemelding] = useState('');

  const sjekkSvar = () => {
    if (parseInt(input) === oppgave.fasit) {
      setTilbakemelding('Riktig! 🎉');
      setOppgave(lagOppgave());
      setInput('');
    } else {
      setTilbakemelding('Feil, prøv igjen!');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md mx-auto my-10">
      <h2 className="text-xl font-bold mb-2">Løs matteoppgaven:</h2>
      <div className="text-lg mb-4">{oppgave.tekst}</div>
      <input
        className="border rounded p-2 mb-2 w-24"
        type="number"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && sjekkSvar()}
        autoFocus
      />
      <button
        className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-2xl shadow"
        onClick={sjekkSvar}
      >
        Sjekk svar
      </button>
      <div className="mt-4">{tilbakemelding}</div>
    </div>
  );
}
