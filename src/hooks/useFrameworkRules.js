import { useFrameworkContext } from "../context/FrameworkContext";

export function useFrameworkRules() {
  const { selectedFramework, setSelectedFramework, frameworks, rules } = useFrameworkContext();
  return { selectedFramework, setSelectedFramework, frameworks, rules };
}
