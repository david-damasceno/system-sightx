
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

type ReactionType = 'like' | 'dislike' | 'helpful' | 'not_helpful';

interface MessageReaction {
  id: string;
  message_id: string;
  session_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export const useMessageReactions = () => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<MessageReaction[]>([]);

  const loadReactions = async (sessionId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Type cast the reaction_type from string to ReactionType
      const typedReactions = (data || []).map(reaction => ({
        ...reaction,
        reaction_type: reaction.reaction_type as ReactionType
      }));
      
      setReactions(typedReactions);
    } catch (error) {
      console.error("Erro ao carregar reações:", error);
    }
  };

  const addReaction = async (
    messageId: string, 
    sessionId: string, 
    reactionType: ReactionType
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Remover reação existente do mesmo tipo
      await supabase
        .from('message_reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('message_id', messageId)
        .eq('reaction_type', reactionType);

      // Adicionar nova reação
      const { data, error } = await supabase
        .from('message_reactions')
        .insert({
          user_id: user.id,
          message_id: messageId,
          session_id: sessionId,
          reaction_type: reactionType
        })
        .select()
        .single();

      if (error) throw error;

      // Type cast the reaction_type from string to ReactionType
      const typedReaction = {
        ...data,
        reaction_type: data.reaction_type as ReactionType
      };

      setReactions(prev => {
        const filtered = prev.filter(r => !(r.message_id === messageId && r.reaction_type === reactionType));
        return [...filtered, typedReaction];
      });

      return true;
    } catch (error) {
      console.error("Erro ao adicionar reação:", error);
      toast.error("Erro ao adicionar reação");
      return false;
    }
  };

  const removeReaction = async (messageId: string, reactionType: ReactionType): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('message_id', messageId)
        .eq('reaction_type', reactionType);

      if (error) throw error;

      setReactions(prev => prev.filter(r => !(r.message_id === messageId && r.reaction_type === reactionType)));
      return true;
    } catch (error) {
      console.error("Erro ao remover reação:", error);
      toast.error("Erro ao remover reação");
      return false;
    }
  };

  const getUserReaction = (messageId: string, reactionType: ReactionType): boolean => {
    return reactions.some(r => r.message_id === messageId && r.reaction_type === reactionType);
  };

  return {
    reactions,
    loadReactions,
    addReaction,
    removeReaction,
    getUserReaction
  };
};
