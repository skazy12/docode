import React, { useState } from "react";
import logo from "../../assets/logodocode.png";

export default function TopBar({
  githubToken,
  setGithubToken,
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
  const [showTokenHelp, setShowTokenHelp] = useState(false);

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
          <input
            type="password"
            placeholder="GitHub Token (optional)"
            value={githubToken || ""}
            onChange={(e) => setGithubToken(e.target.value)}
            style={{ minWidth: 320 }}
          />
          <button
            type="button"
            className="helpBtn"
            onClick={() => setShowTokenHelp((v) => !v)}
          >
            {showTokenHelp ? "Ocultar guía" : "Guía token"}
          </button>

          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            
Se utiliza únicamente en su navegador para aumentar los límites de la API de GitHub.
          </p>

          {showTokenHelp && (
            <div className="tokenHelpCard" role="region" aria-live="polite">
              <div className="tokenHelpHeader">
                <strong>Cómo obtener tu GitHub token</strong>
                <button
                  type="button"
                  className="tokenHelpClose"
                  onClick={() => setShowTokenHelp(false)}
                >
                  Cerrar
                </button>
              </div>
              <ol>
                <li>
                  Entra a{" "}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    github.com/settings/tokens
                  </a>
                  .
                </li>
                <li>
                  Crea un token (`Fine-grained` recomendado) y selecciona al
                  menos permiso de lectura al repositorio.
                </li>
                <li>Copia el token y pégalo en el campo de arriba.</li>
              </ol>
              <p>
                El token se usa solo en tu navegador para evitar límites de la
                API de GitHub.
              </p>
            </div>
          )}

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
