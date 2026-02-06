import { useCallback } from "react";
import { useRepoContext } from "../context/RepoContext";
import { useFrameworkRules } from "./useFrameworkRules";
import { buildTreeFromPaths } from "../utils/fileHelpers";
import { filterPathsByRules, findEntryFiles } from "../services/frameworkRules";
import { useGitHubRepo } from "./useGitHubRepo";
import { useLocalFiles } from "./useLocalFiles";

export function useRepoAnalyzer() {
  const { state, actions } = useRepoContext();
  const { rules } = useFrameworkRules();
  const gh = useGitHubRepo();
  const local = useLocalFiles();

  const analyzeGitHub = useCallback(
    async (input) => {
      actions.setLoading(true);
      actions.setError(null);

      const result = await gh.load(input);
      if (!result) {
        actions.setLoading(false);
        return;
      }

      const filtered = filterPathsByRules(result.flatPaths, rules);
      const tree = buildTreeFromPaths(filtered);
      const entryFiles = findEntryFiles(filtered, rules);

      actions.setRepoData({
        sourceType: "github",
        meta: result.meta,
        flatPaths: filtered,
        tree,
        entryFiles
      });

      actions.setLoading(false);
    },
    [actions, gh, rules]
  );

  const analyzeLocal = useCallback(async () => {
    actions.setLoading(true);
    actions.setError(null);

    const result = await local.pickAndLoad(rules);
    if (!result) {
      actions.setLoading(false);
      return;
    }

    const filtered = filterPathsByRules(result.flatPaths, rules);
    const tree = buildTreeFromPaths(filtered);
    const entryFiles = findEntryFiles(filtered, rules);

    actions.setRepoData({
      sourceType: "local",
      meta: result.meta,
      flatPaths: filtered,
      tree,
      entryFiles
    });

    actions.setLoading(false);
  }, [actions, local, rules]);

  const isBusy = state.loading || gh.loading || local.loading;
  const error = state.error || gh.error || local.error;

  return {
    analyzeGitHub,
    analyzeLocal,
    isBusy,
    error
  };
}
