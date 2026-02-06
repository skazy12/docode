import React from "react";
import FileViewer from "../common/FileViewer";

export default function RightPanel({
  selectedPath,
  content,
  loading,
  onCopy
}) {
  return (
    <div className="panel">
      <div className="panelHeader">
        <div>
          <div className="panelTitle">{selectedPath || "Visor"}</div>
          <div className="panelSubtitle">
            {selectedPath ? "Vista previa del archivo" : "Selecciona un archivo a la izquierda"}
          </div>
        </div>

        <button onClick={onCopy} disabled={!selectedPath}>
          Copiar
        </button>
      </div>

      <div className="viewerBody">
        <FileViewer path={selectedPath} content={content} loading={loading} />
      </div>
    </div>
  );
}
