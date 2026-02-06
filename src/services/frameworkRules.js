import frameworks from "../data/frameworks.json";
import { getExt, normalizePath } from "../utils/fileHelpers";

export function getAvailableFrameworks() {
  return Object.entries(frameworks).map(([key, value]) => ({
    key,
    label: value.label || key
  }));
}

export function getFrameworkRules(key) {
  return frameworks[key] || frameworks.generic;
}

/**
 * Aplica reglas a una lista plana de paths.
 */
export function filterPathsByRules(paths = [], rules) {
    const r = rules || frameworks.generic;

    const excludeDirs = new Set((r.excludeDirs || []).map((d) => normalizePath(d)));
    const excludeFiles = new Set(r.excludeFiles || []);
    const includeExt = (r.includeExtensions || []).map((e) => e.toLowerCase());
    const allowAllExt = includeExt.length === 0;

    return paths.filter((raw) => {
        const p = normalizePath(raw);
        if (!p) return false;

        const parts = p.split("/");
        // excluir por carpeta
        if (parts.some((seg) => excludeDirs.has(seg))) return false;

        // excluir por nombre de archivo exacto
        const base = parts[parts.length - 1];
        if (excludeFiles.has(base)) return false;

        // filtrar por extensión si aplica
        // filtrar por extensión si aplica
        if (!allowAllExt) {
            const ext = getExt(p);

            // Caso especial: Thymeleaf (html solo dentro de templates)
            const thymeleafOn = Boolean(r?.specialInclude?.thymeleafTemplates);
            if (ext === ".html" && thymeleafOn) {
                if (p.toLowerCase().includes("/templates/")) return true;
                return false;
            }

            if (!includeExt.includes(ext)) return false;
        }


        return true;
    });
}

/**
 * Lista de "entry files" sugeridos que existan en el repo.
 */
export function findEntryFiles(paths = [], rules) {
  const r = rules || frameworks.generic;
  const set = new Set(paths.map((p) => normalizePath(p)));
  return (r.entryFiles || []).filter((p) => set.has(normalizePath(p)));
}
