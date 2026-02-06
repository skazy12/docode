import { normalizePath } from "../utils/fileHelpers";

/**
 * Soporta:
 * - https://github.com/owner/repo
 * - owner/repo
 */
export function parseGitHubInput(input) {
  const raw = String(input || "").trim();
  if (!raw) return null;

  // owner/repo
  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(raw)) {
    const [owner, repo] = raw.split("/");
    return { owner, repo, url: `https://github.com/${owner}/${repo}` };
  }

  // URL
  try {
    const u = new URL(raw);
    if (u.hostname !== "github.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, "");
    return { owner, repo, url: `https://github.com/${owner}/${repo}` };
  } catch {
    return null;
  }
}

/**
 * Obtiene el árbol de archivos usando la API pública:
 * GET https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1
 */
export async function fetchRepoTree({ owner, repo, branch = "HEAD" }) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  const res = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!res.ok) {
    const txt = await safeText(res);
    throw new Error(`GitHub tree error (${res.status}): ${txt || res.statusText}`);
  }

  const data = await res.json();

  // data.tree: [{path, type: 'blob'|'tree', size?, url?}]
  const files = (data.tree || [])
    .filter((n) => n.type === "blob")
    .map((n) => normalizePath(n.path));

  return {
    branch: data?.sha ? branch : branch,
    files
  };
}

/**
 * Descarga contenido del archivo via contents API:
 * GET https://api.github.com/repos/{owner}/{repo}/contents/{path}
 * Luego decode base64.
 */
export async function fetchFileContent({ owner, repo, path, ref = "HEAD" }) {
  const p = normalizePath(path);
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(p)}?ref=${encodeURIComponent(
    ref
  )}`;

  const res = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!res.ok) {
    const txt = await safeText(res);
    throw new Error(`GitHub content error (${res.status}): ${txt || res.statusText}`);
  }

  const data = await res.json();

  // Si es dir, no sirve
  if (Array.isArray(data)) {
    throw new Error("Selected path is a directory, not a file.");
  }

  const content = data?.content;
  const encoding = data?.encoding;

  if (encoding === "base64" && typeof content === "string") {
    // content viene con saltos de línea
    const cleaned = content.replace(/\n/g, "");
    return decodeBase64(cleaned);
  }

  // fallback: si no trae base64
  if (typeof data?.download_url === "string") {
    const r2 = await fetch(data.download_url);
    if (!r2.ok) throw new Error(`Download_url error (${r2.status})`);
    return await r2.text();
  }

  return "";
}

function decodeBase64(b64) {
  // browser: atob
  const bin = atob(b64);
  // convertir binario a utf-8
  // workaround: escape/unescape (suficiente para texto típico)
  try {
    return decodeURIComponent(
      bin
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
  } catch {
    return bin;
  }
}

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
