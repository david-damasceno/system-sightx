
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../contexts/AuthContext";

export const useAnalytics = () => {
  const { user } = useAuth();

  const logEvent = async (
    eventType: string, 
    eventData?: any, 
    sessionId?: string
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('log_user_event', {
        event_type_param: eventType,
        event_data_param: eventData ? JSON.parse(JSON.stringify(eventData)) : null,
        session_id_param: sessionId || null
      });
    } catch (error) {
      console.error("Erro ao registrar evento:", error);
    }
  };

  // Registrar evento de entrada na página
  useEffect(() => {
    if (user) {
      logEvent('page_view', {
        url: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }, [user]);

  return {
    logEvent
  };
};
