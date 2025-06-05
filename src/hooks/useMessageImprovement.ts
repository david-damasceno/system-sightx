
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

interface MessageImprovement {
  id: string;
  original_message: string;
  improved_message: string;
  improvement_type: string;
  created_at: string;
}

export const useMessageImprovement = () => {
  const { user } = useAuth();
  const [isImproving, setIsImproving] = useState(false);
  const [improvements, setImprovements] = useState<MessageImprovement[]>([]);

  const improveMessage = async (originalMessage: string, improvementType: string = 'general'): Promise<string | null> => {
    if (!user) {
      toast.error("Você precisa estar logado");
      return null;
    }

    setIsImproving(true);

    try {
      console.log("Melhorando mensagem:", originalMessage);
      
      const { data, error } = await supabase.functions.invoke('azure-openai-chat', {
        body: {
          messages: [{ content: originalMessage, isAI: false }],
          improveMessage: true,
          improvementType
        }
      });

      if (error) {
        console.error("Erro na edge function:", error);
        throw new Error(`Erro na API: ${error.message || 'Erro desconhecido'}`);
      }
      
      if (!data?.message) {
        console.error("Resposta inválida:", data);
        throw new Error("Resposta inválida da IA");
      }

      const improvedMessage = data.message;

      // Salvar no histórico de melhorias
      const { error: saveError } = await supabase
        .from('message_improvements')
        .insert({
          user_id: user.id,
          original_message: originalMessage,
          improved_message: improvedMessage,
          improvement_type: improvementType
        });

      if (saveError) {
        console.error("Erro ao salvar melhoria:", saveError);
      }

      console.log("Mensagem melhorada:", improvedMessage);
      return improvedMessage;

    } catch (error) {
      console.error("Erro ao melhorar mensagem:", error);
      toast.error("Erro ao melhorar mensagem. Tente novamente.");
      return null;
    } finally {
      setIsImproving(false);
    }
  };

  const loadImprovements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('message_improvements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error("Erro ao carregar melhorias:", error);
        return;
      }

      setImprovements(data || []);
    } catch (error) {
      console.error("Erro ao carregar melhorias:", error);
    }
  };

  return {
    improveMessage,
    isImproving,
    improvements,
    loadImprovements
  };
};
