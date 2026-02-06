import { useCallback, useState } from "react";
import { fetchRepoTree, parseGitHubInput } from "../services/githubService";

export function useGitHubRepo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (input) => {
    setLoading(true);
    setError(null);

    try {
      const parsed = parseGitHubInput(input);
      if (!parsed) throw new Error("Invalid GitHub input. Use owner/repo or GitHub URL.");

      const { owner, repo, url } = parsed;

      // branch HEAD (GitHub resuelve)
      const tree = await fetchRepoTree({ owner, repo, branch: "HEAD" });

      return {
        meta: { owner, repo, url, branch: "HEAD" },
        flatPaths: tree.files
      };
    } catch (e) {
      setError(e?.message || "GitHub load failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { load, loading, error };
}
