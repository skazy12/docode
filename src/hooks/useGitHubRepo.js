import { useCallback, useState } from "react";
import { fetchRepoTree, parseGitHubInput } from "../services/githubService";
import { useRepoContext } from "../context/RepoContext";

export function useGitHubRepo() {
  const { state } = useRepoContext(); // ✅ ahora sí existe
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (input) => {
      setLoading(true);
      setError(null);

      try {
        const parsed = parseGitHubInput(input);
        if (!parsed)
          throw new Error("Invalid GitHub input. Use owner/repo or GitHub URL.");

        const { owner, repo, url } = parsed;

        const tree = await fetchRepoTree({
          owner,
          repo,
          branch: "HEAD",
          token: state.githubToken // ✅ ahora funciona
        });

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
    },
    [state.githubToken] // ✅ dependencia correcta
  );

  return { load, loading, error };
}
