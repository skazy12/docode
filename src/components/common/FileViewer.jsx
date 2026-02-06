import React from "react";

export default function FileViewer({ path, content, loading }) {
  if (!path) {
    return <div style={{ color: "#6b7280" }}>Selecciona un archivo para ver su contenido.</div>;
  }

  return (
    <div>
      <div className="codeBox">
        {loading && !content ? "Cargando..." : content || "[No content loaded]"}
      </div>
    </div>
  );
}
