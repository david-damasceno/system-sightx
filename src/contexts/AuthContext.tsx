import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface Tenant {
  id: string;
  schema_name: string;
  storage_folder: string | null;
  airbyte_destination_id: string | null;
  status: string;
  error_message?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  tenant: Tenant | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const { toast } = useToast();

  const fetchTenant = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error("Erro ao buscar tenant:", error);
        return null;
      }

      setTenant(data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar tenant:", error);
      return null;
    }
  };

  const activateTenant = async (tenantId: string) => {
    try {
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('status')
        .eq('id', tenantId)
        .single();

      if (tenantData && tenantData.status === 'active') {
        console.log("Tenant já está ativo");
        return;
      }

      const { data, error } = await supabase.functions.invoke('setup-tenant', {
        body: { tenantId }
      });

      if (error) {
        console.error("Erro ao ativar tenant:", error);
        
        await supabase
          .from('tenants')
          .update({ 
            status: 'error', 
            updated_at: new Date().toISOString(),
            error_message: error.message || "Erro ao configurar o ambiente."
          })
          .eq('id', tenantId);
        
        const errorTenant = await fetchTenant(user?.id || '');
        
        return;
      }

      if (data.success) {
        console.log("Tenant ativado com sucesso:", data);
        
        if (data.airbyte && !data.airbyte.success) {
          console.error("Erro na configuração do Airbyte:", data.airbyte.error);
          
          await supabase
            .from('tenants')
            .update({ 
              status: 'error', 
              updated_at: new Date().toISOString(),
              error_message: `Erro ao configurar o Airbyte: ${data.airbyte.error}`
            })
            .eq('id', tenantId);
          
          const errorTenant = await fetchTenant(user?.id || '');
          
          return;
        }
        
        toast({
          title: "Configuração concluída",
          description: "Seu ambiente foi configurado com sucesso.",
        });
        
        await fetchTenant(user?.id || '');
      } else {
        console.error("Falha ao ativar tenant:", data.error);
        
        await supabase
          .from('tenants')
          .update({ 
            status: 'error', 
            updated_at: new Date().toISOString(),
            error_message: data.error || "Erro ao configurar o ambiente."
          })
          .eq('id', tenantId);
        
        const errorTenant = await fetchTenant(user?.id || '');
      }
    } catch (error: any) {
      console.error("Erro ao ativar tenant:", error);
      
      await supabase
        .from('tenants')
        .update({ 
          status: 'error', 
          updated_at: new Date().toISOString(),
          error_message: error.message || "Erro ao configurar o ambiente."
        })
        .eq('id', tenantId);
      
      const errorTenant = await fetchTenant(user?.id || '');
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email?.split('@')[0] || "",
            email: session.user.email || "",
            avatar: session.user.user_metadata.avatar_url || "/placeholder.svg"
          };
          setUser(userData);
          
          const tenantData = await fetchTenant(session.user.id);
          
          if (tenantData && tenantData.status === 'creating') {
            activateTenant(tenantData.id);
          }
        } else {
          setUser(null);
          setTenant(null);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0] || "",
          email: session.user.email || "",
          avatar: session.user.user_metadata.avatar_url || "/placeholder.svg"
        };
        setUser(userData);
        
        const tenantData = await fetchTenant(session.user.id);
        
        if (tenantData && tenantData.status === 'creating') {
          activateTenant(tenantData.id);
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: error.message,
        });
        throw error;
      }

      if (data.user) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao SightX!",
        });
        
        await fetchTenant(data.user.id);
      }

    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: error.message,
        });
        throw error;
      }

      toast({
        title: "Conta criada com sucesso",
        description: "Estamos configurando seu ambiente. Isso pode levar alguns minutos.",
      });

      await supabase.functions.invoke('setup-tenant', {
        body: { tenantId: data.user.id }
      });

    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setTenant(null);
      toast({
        title: "Logout bem-sucedido",
        description: "Você foi desconectado da sua conta.",
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar.",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        isLoading,
        tenant
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
