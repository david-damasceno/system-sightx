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
  const [activationInProgress, setActivationInProgress] = useState(false);
  const { toast } = useToast();

  const fetchTenant = async (userId: string) => {
    try {
      console.log("Buscando tenant para o usuário:", userId);
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error("Erro ao buscar tenant:", error);
        return null;
      }

      console.log("Tenant encontrado:", data);
      setTenant(data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar tenant:", error);
      return null;
    }
  };

  const activateTenant = async (tenantId: string) => {
    // Evitar múltiplas chamadas simultâneas
    if (activationInProgress) {
      console.log("Ativação já em andamento, ignorando chamada duplicada");
      return;
    }

    try {
      setActivationInProgress(true);
      console.log("Iniciando ativação do tenant:", tenantId);
      
      // Verificar status atual do tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('status')
        .eq('id', tenantId)
        .single();

      // Correção aqui: verificar primeiro se houve erro na consulta
      if (tenantError) {
        console.error("Erro ao verificar o status do tenant:", tenantError);
        setActivationInProgress(false);
        return;
      }

      if (tenantData && tenantData.status === 'active') {
        console.log("Tenant já está ativo");
        setActivationInProgress(false);
        return;
      }
      
      console.log("Chamando função setup-tenant...");
      
      // Atualizar o status do tenant para 'creating' antes de chamar a função
      try {
        const { error: updateError } = await supabase
          .from('tenants')
          .update({ 
            status: 'creating', 
            updated_at: new Date().toISOString(),
            error_message: null
          })
          .eq('id', tenantId);
          
        if (updateError) {
          console.error("Erro ao atualizar status do tenant para 'creating':", updateError);
          // Continuamos mesmo com erro no update
        }
      } catch (updateErr) {
        console.error("Erro ao atualizar status para 'creating':", updateErr);
        // Continuamos mesmo com erro
      }

      // Adicionar um timeout para garantir que a função não fique travada
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout na ativação do tenant")), 30000)
      );

      // Chamar a função Edge para configurar o tenant
      const functionPromise = supabase.functions.invoke('setup-tenant', {
        body: { tenantId }
      });

      // Usar Promise.race para implementar timeout
      const { data, error } = await Promise.race([
        functionPromise,
        timeoutPromise
      ]) as any;

      console.log("Resposta da função setup-tenant:", data, error);

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
        
        toast({
          variant: "destructive",
          title: "Erro na configuração",
          description: error.message || "Erro ao configurar o ambiente.",
        });
        
        setActivationInProgress(false);
        return;
      }

      // Tratar resultado da função
      if (data && data.success) {
        console.log("Tenant ativado com sucesso:", data);
        
        // Verificar sucesso específico do Airbyte
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
          
          toast({
            variant: "destructive",
            title: "Erro na configuração do Airbyte",
            description: data.airbyte.error || "Erro ao configurar o Airbyte.",
          });
          
          setActivationInProgress(false);
          return;
        }
        
        toast({
          title: "Configuração concluída",
          description: "Seu ambiente foi configurado com sucesso.",
        });
        
        // Buscar tenant atualizado
        await fetchTenant(user?.id || '');
      } else {
        console.error("Falha ao ativar tenant:", data?.error || "Razão desconhecida");
        
        // Atualizar status para erro
        await supabase
          .from('tenants')
          .update({ 
            status: 'error', 
            updated_at: new Date().toISOString(),
            error_message: data?.error || "Erro ao configurar o ambiente."
          })
          .eq('id', tenantId);
        
        // Buscar tenant com erro
        const errorTenant = await fetchTenant(user?.id || '');
        
        toast({
          variant: "destructive",
          title: "Erro na configuração",
          description: data?.error || "Erro ao configurar o ambiente.",
        });
      }
    } catch (error: any) {
      console.error("Exceção ao ativar tenant:", error);
      
      // Registrar erro no tenant
      await supabase
        .from('tenants')
        .update({ 
          status: 'error', 
          updated_at: new Date().toISOString(),
          error_message: error.message || "Erro ao configurar o ambiente."
        })
        .eq('id', tenantId);
      
      // Buscar tenant com erro
      const errorTenant = await fetchTenant(user?.id || '');
      
      toast({
        variant: "destructive",
        title: "Erro na configuração",
        description: error.message || "Erro ao configurar o ambiente.",
      });
    } finally {
      setActivationInProgress(false);
    }
  };

  // Efeito para monitorar mudanças na autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Evento de autenticação:", event);
        setSession(session);
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email?.split('@')[0] || "",
            email: session.user.email || "",
            avatar: session.user.user_metadata.avatar_url || "/placeholder.svg"
          };
          setUser(userData);
          
          // Buscar tenant do usuário
          const tenantData = await fetchTenant(session.user.id);
          
          // Ativar tenant se estiver em criação
          if (tenantData && tenantData.status === 'creating' && !activationInProgress) {
            console.log("Tenant em criação, ativando...");
            // Use setTimeout para evitar conflitos com o evento de autenticação
            setTimeout(() => {
              activateTenant(tenantData.id);
            }, 500);
          }
        } else {
          setUser(null);
          setTenant(null);
        }
      }
    );

    // Verificar sessão atual ao iniciar
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
        
        // Buscar tenant do usuário
        const tenantData = await fetchTenant(session.user.id);
        
        // Ativar tenant se estiver em criação
        if (tenantData && tenantData.status === 'creating' && !activationInProgress) {
          console.log("Tenant em criação, ativando...");
          // Use setTimeout para evitar conflitos com o carregamento inicial
          setTimeout(() => {
            activateTenant(tenantData.id);
          }, 500);
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login
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

  // Signup
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

      // Verificar se o tenant foi criado automaticamente
      console.log("Verificando se o tenant foi criado para o usuário:", data.user.id);
      const tenantData = await fetchTenant(data.user.id);
      
      if (!tenantData) {
        console.error("Tenant não foi criado automaticamente.");
        toast({
          variant: "destructive",
          title: "Erro na criação do ambiente",
          description: "Não foi possível criar seu ambiente. Tente novamente mais tarde.",
        });
        return;
      }
      
      console.log("Tenant criado, iniciando ativação:", tenantData.id);
      
      // Iniciar ativação do tenant com pequeno atraso
      setTimeout(() => {
        activateTenant(tenantData.id);
      }, 1000);

    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
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
