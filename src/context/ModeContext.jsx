import { createContext, useState } from "react";

export const ModeContext = createContext();

export function ModeProvider({ children }) {
  const [mode, setMode] = useState("free"); // free | point
  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}
