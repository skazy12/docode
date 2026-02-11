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
 * Obtiene el árbol de archivos usando la API de GitHub:
 * GET https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1
 */
export async function fetchRepoTree({ owner, repo, branch = "HEAD", token }) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

  const headers = {
    Accept: "application/vnd.github+json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(apiUrl, { headers });

  if (!res.ok) {
    const txt = await safeText(res);
    throw new Error(`GitHub tree error (${res.status}): ${txt || res.statusText}`);
  }

  const data = await res.json();

  // data.tree: [{ path, type: 'blob' | 'tree', size?, url? }]
  const files = (data.tree || [])
    .filter((n) => n.type === "blob")
    .map((n) => normalizePath(n.path));

  return {
    branch,
    files
  };
}

/**
 * Descarga contenido del archivo vía Contents API:
 * GET https://api.github.com/repos/{owner}/{repo}/contents/{path}
 */
export async function fetchFileContent({ owner, repo, path, ref = "HEAD", token }) {
  const p = normalizePath(path);

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(
    p
  )}?ref=${encodeURIComponent(ref)}`;

  const headers = {
    Accept: "application/vnd.github+json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(apiUrl, { headers });

  if (!res.ok) {
    const txt = await safeText(res);
    throw new Error(`GitHub content error (${res.status}): ${txt || res.statusText}`);
  }

  const data = await res.json();

  // Si es directorio, no sirve
  if (Array.isArray(data)) {
    throw new Error("Selected path is a directory, not a file.");
  }

  const content = data?.content;
  const encoding = data?.encoding;

  // Caso base64 (normal)
  if (encoding === "base64" && typeof content === "string") {
    const cleaned = content.replace(/\n/g, "");
    return decodeBase64(cleaned);
  }

  // Fallback: download_url
  if (typeof data?.download_url === "string") {
    const r2 = await fetch(data.download_url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });

    if (!r2.ok) {
      throw new Error(`Download_url error (${r2.status})`);
    }

    return await r2.text();
  }

  return "";
}

/* ================== helpers ================== */

function decodeBase64(b64) {
  const bin = atob(b64);

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
