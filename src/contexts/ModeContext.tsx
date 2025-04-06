
import React, { createContext, useState, useContext, useEffect } from "react";

type ModeType = "personal" | "business";

interface ModeContextType {
  mode: ModeType;
  toggleMode: () => void;
  setMode: (mode: ModeType) => void;
  isBusiness: boolean;
  isPersonal: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get saved mode from localStorage or default to personal
  const [mode, setMode] = useState<ModeType>(() => {
    const savedMode = localStorage.getItem("sightx-mode");
    return (savedMode as ModeType) || "personal";
  });

  // Update localStorage when mode changes
  useEffect(() => {
    localStorage.setItem("sightx-mode", mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(current => current === "personal" ? "business" : "personal");
  };

  const value = {
    mode,
    toggleMode,
    setMode,
    isBusiness: mode === "business",
    isPersonal: mode === "personal"
  };

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = (): ModeContextType => {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
};
