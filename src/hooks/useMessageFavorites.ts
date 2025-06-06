
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

interface FavoriteMessage {
  id: string;
  message_id: string;
  session_id: string;
  created_at: string;
}

export const useMessageFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('favorite_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (messageId: string, sessionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const existingFavorite = favorites.find(f => f.message_id === messageId);

      if (existingFavorite) {
        // Remover dos favoritos
        const { error } = await supabase
          .from('favorite_messages')
          .delete()
          .eq('id', existingFavorite.id);

        if (error) throw error;

        setFavorites(prev => prev.filter(f => f.id !== existingFavorite.id));
        toast.success("Removido dos favoritos");
        return false;
      } else {
        // Adicionar aos favoritos
        const { data, error } = await supabase
          .from('favorite_messages')
          .insert({
            user_id: user.id,
            message_id: messageId,
            session_id: sessionId
          })
          .select()
          .single();

        if (error) throw error;

        setFavorites(prev => [data, ...prev]);
        toast.success("Adicionado aos favoritos");
        return true;
      }
    } catch (error) {
      console.error("Erro ao alterar favorito:", error);
      toast.error("Erro ao alterar favorito");
      return false;
    }
  };

  const isFavorite = (messageId: string): boolean => {
    return favorites.some(f => f.message_id === messageId);
  };

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
    loadFavorites
  };
};
