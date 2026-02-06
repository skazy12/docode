import React, { createContext, useContext, useMemo, useState } from "react";

const RepoContext = createContext(null);

const initialState = {
  sourceType: null, // "github" | "local"
  meta: null, // { name, owner?, repo?, branch?, url? } or { name, handle? }
  input: "",

  flatPaths: [],
  tree: null,

  selectedPath: null,
  fileContents: {}, // { [path]: string }

  entryFiles: [],
  loading: false,
  error: null
};

export function RepoProvider({ children }) {
  const [state, setState] = useState(initialState);

  const actions = useMemo(
    () => ({
      reset: () => setState(initialState),

      setInput: (input) => setState((s) => ({ ...s, input })),
      setLoading: (loading) => setState((s) => ({ ...s, loading })),
      setError: (error) => setState((s) => ({ ...s, error })),

      setRepoData: ({ sourceType, meta, flatPaths, tree, entryFiles }) =>
        setState((s) => ({
          ...s,
          sourceType,
          meta,
          flatPaths: flatPaths || [],
          tree: tree || null,
          entryFiles: entryFiles || [],
          selectedPath: null,
          fileContents: {},
          error: null
        })),

      selectFile: (path) => setState((s) => ({ ...s, selectedPath: path })),

      setFileContent: (path, content) =>
        setState((s) => ({
          ...s,
          fileContents: { ...s.fileContents, [path]: content }
        }))
    }),
    []
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <RepoContext.Provider value={value}>{children}</RepoContext.Provider>;
}

export function useRepoContext() {
  const ctx = useContext(RepoContext);
  if (!ctx) throw new Error("useRepoContext must be used within RepoProvider");
  return ctx;
}
