import React, { useMemo, useState } from "react";
import { useRepoContext } from "../context/RepoContext";
import { useFrameworkRules } from "../hooks/useFrameworkRules";
import { useRepoAnalyzer } from "../hooks/useRepoAnalyzer";
import { filterPathsByRules } from "../services/frameworkRules";

import {
  exportContentsToTxt,
  exportStructureToTxt,
  buildTreeFromPaths
} from "../utils/fileHelpers";

import { fetchFileContent } from "../services/githubService";
import { readFileByPath } from "../services/localFileService";
import {
  copyToClipboard,
  downloadTxt,
  prefetchFileContents,
  pickEssentialPaths
} from "../services/exportService";


import TopBar from "../components/Home/TopBar";
import LeftPanel from "../components/Home/LeftPanel";
import RightPanel from "../components/Home/RightPanel";

export default function Home() {
  const { state, actions } = useRepoContext();
  const { selectedFramework, setSelectedFramework, frameworks, rules } = useFrameworkRules();
  const { analyzeGitHub, analyzeLocal, isBusy, error } = useRepoAnalyzer();

  const [mode, setMode] = useState("github");
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ done: 0, total: 0 });

  const metaTitle = useMemo(() => {
    if (!state.meta) return "";
    if (state.sourceType === "github") return `${state.meta.owner}/${state.meta.repo}`;
    return state.meta.name || "local";
  }, [state.meta, state.sourceType]);

  async function onAnalyze() {
    if (mode === "github") return analyzeGitHub(state.input);
    return analyzeLocal();
  }

  async function loadContentForPath(path) {
    if (!path) return "";
    if (state.sourceType === "github") {
      const { owner, repo, branch } = state.meta || {};
      return await fetchFileContent({ owner, repo, path, ref: branch || "HEAD" });
    }
    if (state.sourceType === "local") {
      const handle = state.meta?.handle;
      return await readFileByPath(handle, path);
    }
    return "";
  }

  async function onSelectFile(path) {
    actions.selectFile(path);
    if (state.fileContents?.[path]) return;

    try {
      actions.setLoading(true);
      const content = await loadContentForPath(path);
      actions.setFileContent(path, content);
    } catch (e) {
      actions.setError(e?.message || "Failed to load file content");
    } finally {
      actions.setLoading(false);
    }
  }

  async function onDownloadStructure() {
    if (!state.tree) return;
    const txt = exportStructureToTxt(state.tree);
    downloadTxt({
      filename: `${(metaTitle || "docode")}-structure.txt`.replace(/[^\w.-]+/g, "_"),
      content: txt
    });
  }

async function onDownloadContents() {
  if (!state.tree) return;

  setExporting(true);
  try {
    const exportCfg = rules?.export || {};

    const exportMode = exportCfg.mode || "full";
    const MAX_FILES = exportCfg.maxFiles || 250;
    const CONCURRENCY = exportCfg.concurrency || 4;
    const filenameSuffix = exportCfg.filenameSuffix || "contents";

    // 1️⃣ aplicar reglas del framework
    const filteredPaths = filterPathsByRules(state.flatPaths, rules);

    // 2️⃣ decidir paths según modo
    const pathsToExport =
      exportMode === "essential"
        ? pickEssentialPaths(filteredPaths, rules)
        : filteredPaths;

    // 3️⃣ árbol final
    const treeToExport = buildTreeFromPaths(pathsToExport);

    setExportProgress({
      done: 0,
      total: Math.min(pathsToExport.length, MAX_FILES)
    });

    // 4️⃣ precarga
    const merged = await prefetchFileContents({
      tree: treeToExport,
      existingContents: state.fileContents,
      loadContentForPath,
      maxFiles: MAX_FILES,
      concurrency: CONCURRENCY,
      maxFileSizeKB: rules?.maxFileSizeKB ?? 300
    });

    // 5️⃣ exportar
    const txt = exportContentsToTxt(treeToExport, merged);

    downloadTxt({
      filename: `${(metaTitle || "docode")}-${filenameSuffix}.txt`
        .replace(/[^\w.-]+/g, "_"),
      content: txt
    });
  } finally {
    setExporting(false);
    setExportProgress({ done: 0, total: 0 });
  }
}


  async function onCopy() {
    const p = state.selectedPath;
    if (!p) return;
    const text = state.fileContents?.[p] || "";
    const ok = await copyToClipboard(text);
    if (!ok) alert("No se pudo copiar al portapapeles.");
  }

  const busy = isBusy || exporting;

  return (
    <div className="docode">
      <TopBar
        mode={mode}
        setMode={setMode}
        frameworks={frameworks}
        selectedFramework={selectedFramework}
        setSelectedFramework={setSelectedFramework}
        input={state.input}
        setInput={(v) => actions.setInput(v)}
        onAnalyze={onAnalyze}
        busy={busy}
      />

      {error && (
        <div className="badgeError">
          <b>Error:</b> {error}
        </div>
      )}

      {state.tree && (
        <div className="main">
          <LeftPanel
            metaTitle={metaTitle}
            fileCount={state.flatPaths.length}
            entryFiles={state.entryFiles}
            exporting={exporting}
            exportProgress={exportProgress}
            onDownloadContents={onDownloadContents}
            onDownloadStructure={onDownloadStructure}
            tree={state.tree}
            selectedPath={state.selectedPath}
            onSelectFile={onSelectFile}
          />

          <RightPanel
            selectedPath={state.selectedPath}
            content={state.selectedPath ? state.fileContents?.[state.selectedPath] : ""}
            loading={isBusy}
            onCopy={onCopy}
          />
          <footer className="footer">
            DOCODE © {new Date().getFullYear()} · Creado por Omar Rodríguez
          </footer>

        </div>

      )}
    </div>
    
    
  );
}
