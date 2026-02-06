import React from "react";
import logo from "../../assets/logodocode.png";

export default function TopBar({
  mode,
  setMode,
  frameworks,
  selectedFramework,
  setSelectedFramework,
  input,
  setInput,
  onAnalyze,
  busy
}) {
  return (
    <div className="header">
      <div className="brandRow">
        <div>
          <div className="brandTitle">
            <img src={logo} alt="DOCODE logo" className="logo" />
            <h1>DOCODE</h1>
          </div>

          <p className="tagline">
            Documenta y entiende cualquier proyecto en segundos
          </p>
        </div>

        <div className="creator">
          by <strong>Omar Rodríguez</strong> ·{" "}
          <a
            href="https://github.com/skazy12/docode"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>

      </div>

      <div className="toolbar">
        <div className="selectors">
          <label>
            Modo:&nbsp;
            <select value={mode} onChange={(e) => setMode(e.target.value)} disabled={busy}>
              <option value="github">GitHub</option>
              <option value="local">Local</option>
            </select>
          </label>

          <label>
            Framework:&nbsp;
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              disabled={busy}
            >
              {frameworks.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>


      {mode === "github" && (
        <div className="inputRow">
          <input
            placeholder="https://github.com/owner/repo o owner/repo"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />
          <button onClick={onAnalyze} disabled={busy || !input.trim()}>
            {busy ? "Analizando..." : "Analizar"}
          </button>
        </div>
      )}

      {mode === "local" && (
        <div className="inputRow">
          <button onClick={onAnalyze} disabled={busy}>
            {busy ? "Analizando..." : "Elegir carpeta y analizar"}
          </button>
        </div>
      )}
    </div>
  );
}
