import { normalizePath } from "../utils/fileHelpers";

/**
 * Requiere File System Access API (Chrome/Edge).
 * flow:
 * - pickDirectory()
 * - listPathsFromDirectory(handle)
 * - readFileByPath(handle, path)  (búsqueda por ruta)
 */

export async function pickDirectory() {
  if (!window.showDirectoryPicker) {
    throw new Error("File System Access API not supported in this browser.");
  }
  const handle = await window.showDirectoryPicker();
  return handle;
}

export async function listPathsFromDirectory(dirHandle, { excludeDirs = [] } = {}) {
  const excluded = new Set(excludeDirs.map((d) => normalizePath(d)));

  const paths = [];
  await walkDir(dirHandle, "", async (entry, relPath) => {
    const parts = relPath.split("/");
    if (parts.some((seg) => excluded.has(seg))) return;

    if (entry.kind === "file") {
      paths.push(normalizePath(relPath));
    }
  });

  return paths;
}

export async function readFileByPath(dirHandle, path) {
  const p = normalizePath(path);
  const parts = p.split("/").filter(Boolean);

  let current = dirHandle;
  for (let i = 0; i < parts.length; i++) {
    const name = parts[i];
    const isLast = i === parts.length - 1;
    if (isLast) {
      const fileHandle = await current.getFileHandle(name);
      const file = await fileHandle.getFile();
      return await file.text();
    } else {
      current = await current.getDirectoryHandle(name);
    }
  }
  return "";
}

async function walkDir(dirHandle, basePath, onEntry) {
  for await (const [name, entry] of dirHandle.entries()) {
    const relPath = basePath ? `${basePath}/${name}` : name;
    await onEntry(entry, relPath);

    if (entry.kind === "directory") {
      await walkDir(entry, relPath, onEntry);
    }
  }
}
