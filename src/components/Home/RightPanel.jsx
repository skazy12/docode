import React, { useState } from "react";
import FileViewer from "../common/FileViewer";

export default function RightPanel({
  selectedPath,
  content,
  loading,
  onCopy
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="panel">
      <div className="panelHeader panelHeaderRow">
        <div className="panelMeta">
          <div className="panelTitle">{selectedPath || "Visor"}</div>
          <div className="panelSubtitle">
            {selectedPath
              ? "Vista previa del archivo"
              : "Selecciona un archivo a la izquierda"}
          </div>
        </div>

        <button
          className={`copyBtn ${copied ? "copied" : ""}`}
          onClick={handleCopy}
          disabled={!selectedPath}
        >
          {copied ? "Copiado ✓" : "Copiar"}
        </button>
      </div>

      <div className="viewerBody">
        <FileViewer path={selectedPath} content={content} loading={loading} />
      </div>
    </div>
  );
}
