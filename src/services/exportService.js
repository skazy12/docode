import { walkTree } from "../utils/fileHelpers";

/**
 * Prefetch: carga contenido faltante de archivos antes de export.
 * loadContentForPath(path) => Promise<string>
 */
export async function prefetchFileContents({
  tree,
  existingContents = {},
  loadContentForPath,
  maxFiles = 250,
  concurrency = 4,
  maxFileSizeKB = 300
}) {
  if (!tree) return { ...existingContents };

  const allFiles = [];
  walkTree(tree, (n) => {
    if (n.type === "file") allFiles.push(n.path);
  });

  const targets = allFiles.slice(0, maxFiles);
  const merged = { ...(existingContents || {}) };

  let idx = 0;

  async function worker(onProgress) {
    while (idx < targets.length) {
      const path = targets[idx++];

      if (merged[path]) {
        onProgress?.();
        continue;
      }

      try {
        const content = await loadContentForPath(path);
        const maxChars = maxFileSizeKB * 1024;

        merged[path] =
          content.length > maxChars
            ? content.slice(0, maxChars) + `\n\n[Truncated to ${maxFileSizeKB}KB]`
            : content;
      } catch (e) {
        merged[path] = `[Error loading content: ${e?.message || "unknown"}]`;
      } finally {
        onProgress?.();
      }
    }
  }

  let done = 0;
  const total = targets.length;

  await Promise.all(
    Array.from({ length: concurrency }, () =>
      worker(() => {
        done += 1;
      })
    )
  );

  return merged;
}

export function downloadTxt({ filename, content }) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text) {
  const t = String(text ?? "");
  if (!t) return false;

  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    // fallback viejo
    try {
      const ta = document.createElement("textarea");
      ta.value = t;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    } catch {
      return false;
    }
  }
}
export function pickEssentialPaths(allPaths = [], rules) {
  const importantDirs = (rules?.importantDirs || []).map((d) => d.replace(/\\/g, "/"));
  const entryFiles = (rules?.entryFiles || []).map((p) => p.replace(/\\/g, "/"));

  const isInImportantDir = (p) => importantDirs.some((dir) => p.startsWith(dir + "/") || p === dir);
  const isEntry = (p) => entryFiles.includes(p);

  return allPaths.filter((p) => isEntry(p) || isInImportantDir(p));
}

