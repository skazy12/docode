import React from "react";

export default function DirectoryTree({ tree, selectedPath, onSelect }) {
  return (
    <div style={{ fontSize: 13, lineHeight: 1.5 }}>
      <TreeNode node={tree} selectedPath={selectedPath} onSelect={onSelect} depth={0} />
    </div>
  );
}

function TreeNode({ node, selectedPath, onSelect, depth }) {
  if (!node) return null;

  const isRoot = node.path === "";
  const paddingLeft = isRoot ? 0 : depth * 12;

  if (node.type === "file") {
    const active = node.path === selectedPath;
    return (
      <div
        onClick={() => onSelect(node.path)}
        style={{
          cursor: "pointer",
          borderRadius: 8,
          padding: "4px 8px",
          marginLeft: paddingLeft,
          background: active ? "linear-gradient(135deg,#eef2ff,#e0e7ff)" : "transparent",
          color: active ? "#1e3a8a" : "inherit",
          fontWeight: active ? 600 : 400

        }}
        title={node.path}
      >
        {node.name}
      </div>
    );
  }

  return (
    <div>
      {!isRoot && (
        <div style={{ paddingLeft, fontWeight: 800, marginTop: 8 }}>
          {node.name}
        </div>
      )}
      {Array.isArray(node.children) &&
        node.children.map((c) => (
          <TreeNode
            key={c.path}
            node={c}
            selectedPath={selectedPath}
            onSelect={onSelect}
            depth={isRoot ? depth : depth + 1}
          />
        ))}
    </div>
  );
}
