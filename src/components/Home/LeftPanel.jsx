import React from "react";
import DirectoryTree from "../common/DirectoryTree";

export default function LeftPanel({
  metaTitle,
  fileCount,
  entryFiles,
  exporting,
  exportProgress,
  onDownloadContents,
  onDownloadStructure,
  tree,
  selectedPath,
  onSelectFile
}) {
  return (
    <div className="panel">
      <div className="panelHeader">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="panelTitle">{metaTitle}</div>
          <div className="panelSubtitle">
            Archivos: {fileCount}
            {entryFiles?.length ? ` | Entry: ${entryFiles.join(", ")}` : ""}
          </div>
          {exporting && (
            <div className="panelSubtitle">
              Exportando: {exportProgress.done}/{exportProgress.total}
            </div>
          )}
        </div>

        <div className="exportButtons">
          <button onClick={onDownloadStructure} disabled={!tree || exporting}>
            Estructura .txt
          </button>
          <button onClick={onDownloadContents} disabled={!tree || exporting}>
            Contenido .txt
          </button>
        </div>
      </div>


      <div className="treeBody">
        <DirectoryTree tree={tree} selectedPath={selectedPath} onSelect={onSelectFile} />
      </div>
    </div>
  );
}
