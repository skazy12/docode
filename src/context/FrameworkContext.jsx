import React, { createContext, useContext, useMemo, useState } from "react";
import { getFrameworkRules, getAvailableFrameworks } from "../services/frameworkRules";

const FrameworkContext = createContext(null);

export function FrameworkProvider({ children }) {
  const [selectedFramework, setSelectedFramework] = useState("react");

  const frameworks = useMemo(() => getAvailableFrameworks(), []);
  const rules = useMemo(() => getFrameworkRules(selectedFramework), [selectedFramework]);

  const value = useMemo(
    () => ({
      selectedFramework,
      setSelectedFramework,
      frameworks,
      rules
    }),
    [selectedFramework, frameworks, rules]
  );

  return <FrameworkContext.Provider value={value}>{children}</FrameworkContext.Provider>;
}

export function useFrameworkContext() {
  const ctx = useContext(FrameworkContext);
  if (!ctx) throw new Error("useFrameworkContext must be used within FrameworkProvider");
  return ctx;
}
