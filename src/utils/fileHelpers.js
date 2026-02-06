/* Utilities puras: paths -> tree, tree traversal, export TXT */

export function normalizePath(p) {
  return String(p || "")
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "");
}

export function getExt(p) {
  const n = normalizePath(p);
  const base = n.split("/").pop() || "";
  const idx = base.lastIndexOf(".");
  return idx >= 0 ? base.slice(idx).toLowerCase() : "";
}

export function splitPath(p) {
  const n = normalizePath(p);
  return n ? n.split("/") : [];
}

/**
 * flatPaths: array de strings "src/App.jsx"
 * retorna tree:
 * {
 *   name: "", path:"", type:"dir", children:[...],
 * }
 */
export function buildTreeFromPaths(flatPaths = []) {
  const root = { name: "", path: "", type: "dir", children: [] };
  const byPath = new Map();
  byPath.set("", root);

  for (const raw of flatPaths) {
    const p = normalizePath(raw);
    if (!p) continue;

    const parts = splitPath(p);
    let acc = "";
    let parent = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const nextPath = acc ? `${acc}/${part}` : part;

      let node = byPath.get(nextPath);
      if (!node) {
        node = {
          name: part,
          path: nextPath,
          type: isLast ? "file" : "dir",
          children: isLast ? undefined : []
        };
        parent.children.push(node);
        byPath.set(nextPath, node);
      } else {
        // Si ya existía como file pero ahora lo necesitamos como dir (edge raro)
        if (!isLast && node.type === "file") {
          node.type = "dir";
          node.children = [];
        }
      }

      parent = node;
      acc = nextPath;
    }
  }

  sortTree(root);
  return root;
}

export function sortTree(node) {
  if (!node || node.type !== "dir" || !Array.isArray(node.children)) return;
  node.children.sort((a, b) => {
    // dirs primero
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  for (const child of node.children) sortTree(child);
}

/**
 * DFS sobre tree, llama cb(node) para cada nodo
 */
export function walkTree(node, cb) {
  if (!node) return;
  cb(node);
  if (node.type === "dir" && Array.isArray(node.children)) {
    for (const child of node.children) walkTree(child, cb);
  }
}

/**
 * Genera un string .txt con estructura + contenido.
 * fileContents: { [path]: string }
 * opts:
 *  - includeFileBody: boolean
 */
export function exportTreeToTxt(tree, fileContents = {}, opts = {}) {
  const includeFileBody = opts.includeFileBody ?? true;

  const lines = [];
  lines.push("DOCODE EXPORT");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");

  // 1) estructura
  lines.push("=== DIRECTORY TREE ===");
  renderTreeLines(tree, lines, "", true);
  lines.push("");

  // 2) contenido
  if (includeFileBody) {
    lines.push("=== FILE CONTENTS ===");
    const filePaths = [];

    walkTree(tree, (n) => {
      if (n.type === "file") filePaths.push(n.path);
    });

    for (const path of filePaths) {
      lines.push("");
      lines.push(`--- ${path} ---`);
      const body = fileContents?.[path];
      if (typeof body === "string" && body.length) {
        lines.push(body);
      } else {
        lines.push("[No content loaded]");
      }
    }
  }

  return lines.join("\n");
}

function renderTreeLines(node, lines, prefix, isLast) {
  if (!node) return;

  // no renderizar root vacío
  if (node.path !== "") {
    const connector = isLast ? "└─ " : "├─ ";
    lines.push(prefix + connector + node.name);
    prefix = prefix + (isLast ? "   " : "│  ");
  }

  if (node.type === "dir" && Array.isArray(node.children) && node.children.length) {
    node.children.forEach((child, idx) => {
      renderTreeLines(child, lines, prefix, idx === node.children.length - 1);
    });
  }
}

export function exportStructureToTxt(tree) {
  const lines = [];
  lines.push("DOCODE EXPORT");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("=== DIRECTORY TREE ===");
  renderTreeLines(tree, lines, "", true);
  return lines.join("\n");
}

export function exportContentsToTxt(tree, fileContents = {}) {
  const lines = [];
  lines.push("DOCODE EXPORT");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("=== FILE CONTENTS ===");

  const filePaths = [];
  walkTree(tree, (n) => {
    if (n.type === "file") filePaths.push(n.path);
  });

  for (const path of filePaths) {
    lines.push("");
    lines.push(`--- ${path} ---`);
    const body = fileContents?.[path];
    if (typeof body === "string" && body.length) lines.push(body);
    else lines.push("[No content loaded]");
  }

  return lines.join("\n");
}
