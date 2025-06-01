
import React, { createContext, useContext } from "react";

// Contexto simplificado que não gerencia mais modos
interface ContextType {
  // Manter compatibilidade com código existente
  mode: "personal";
  isBusiness: false;
  isPersonal: true;
  setMode: () => void;
  toggleMode: () => void;
}

const ModeContext = createContext<ContextType | undefined>(undefined);

export const ModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Valores fixos para manter compatibilidade
  const value: ContextType = {
    mode: "personal" as const,
    isBusiness: false as const,
    isPersonal: true as const,
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
