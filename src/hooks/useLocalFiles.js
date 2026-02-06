import { useCallback, useState } from "react";
import { listPathsFromDirectory, pickDirectory } from "../services/localFileService";

export function useLocalFiles() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pickAndLoad = useCallback(async (rules) => {
    setLoading(true);
    setError(null);

    try {
      const handle = await pickDirectory();
      const name = handle?.name || "local-folder";

      const flatPaths = await listPathsFromDirectory(handle, {
        excludeDirs: rules?.excludeDirs || []
      });

      return {
        meta: { name, handle },
        flatPaths
      };
    } catch (e) {
      setError(e?.message || "Local folder load failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { pickAndLoad, loading, error };
}
