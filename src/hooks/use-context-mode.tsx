
import { useState, useEffect } from 'react';

export type ContextMode = 'personal' | 'business';

export function useContextMode() {
  const [contextMode, setContextMode] = useState<ContextMode>('personal');

  // Load from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('sightx-context-mode') as ContextMode | null;
    if (savedMode === 'personal' || savedMode === 'business') {
      setContextMode(savedMode);
    }
  }, []);

  // Save to localStorage when changed
  const switchContextMode = (mode: ContextMode) => {
    setContextMode(mode);
    localStorage.setItem('sightx-context-mode', mode);
  };

  return { contextMode, switchContextMode };
}
