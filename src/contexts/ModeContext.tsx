
import React, { createContext, useContext } from "react";

// Contexto atualizado para business
interface ContextType {
  mode: "business";
  isBusiness: true;
  isPersonal: false;
  setMode: () => void;
  toggleMode: () => void;
}

const ModeContext = createContext<ContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Valores fixos para modo business
  const value: ContextType = {
    mode: "business" as const,
    isBusiness: true as const,
    isPersonal: false as const,
    setMode: () => {}, // Função vazia para compatibilidade
    toggleMode: () => {} // Função vazia para compatibilidade
  };

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
};

export const useMode = (): ContextType => {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
};
