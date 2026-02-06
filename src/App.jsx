import React from "react";
import { FrameworkProvider } from "./context/FrameworkContext";
import { RepoProvider } from "./context/RepoContext";
import Home from "./pages/Home";

export default function App() {
  return (
    <FrameworkProvider>
      <RepoProvider>
        <Home />
      </RepoProvider>
    </FrameworkProvider>
  );
}
