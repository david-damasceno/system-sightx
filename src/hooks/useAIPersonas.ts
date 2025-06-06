
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIPersona {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  is_default: boolean | null;
  temperature: number | null;
  max_tokens: number | null;
  created_at: string | null;
}

export const useAIPersonas = () => {
  const [personas, setPersonas] = useState<AIPersona[]>([]);
  const [currentPersona, setCurrentPersona] = useState<AIPersona | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadPersonas = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ai_personas')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');

      if (error) throw error;

      setPersonas(data || []);
      
      // Definir persona padrão se não houver uma selecionada
      if (!currentPersona && data && data.length > 0) {
        const defaultPersona = data.find(p => p.is_default) || data[0];
        setCurrentPersona(defaultPersona);
      }
    } catch (error) {
      console.error("Erro ao carregar personas:", error);
      toast.error("Erro ao carregar personas de IA");
    } finally {
      setIsLoading(false);
    }
  };

  const selectPersona = (persona: AIPersona) => {
    setCurrentPersona(persona);
    localStorage.setItem('selectedPersona', JSON.stringify(persona));
  };

  // Carregar persona salva do localStorage
  useEffect(() => {
    const savedPersona = localStorage.getItem('selectedPersona');
    if (savedPersona) {
      try {
        setCurrentPersona(JSON.parse(savedPersona));
      } catch (error) {
        console.error("Erro ao carregar persona salva:", error);
      }
    }
  }, []);

  useEffect(() => {
    loadPersonas();
  }, []);

  return {
    personas,
    currentPersona,
    isLoading,
    selectPersona,
    loadPersonas
  };
};
