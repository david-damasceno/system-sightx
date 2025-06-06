
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
  isInitialized: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);
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

  const updateUserState = async (session: Session | null) => {
    try {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0] || "",
          email: session.user.email || "",
          avatar: session.user.user_metadata.avatar_url || "/placeholder.svg"
        };
        setUser(userData);
        console.log("Usuário autenticado:", userData);
        
        // Buscar tenant do usuário (sem aguardar)
        fetchTenant(session.user.id);
      } else {
        setUser(null);
        setTenant(null);
        console.log("Usuário não autenticado");
      }
    } catch (error) {
      console.error("Erro ao atualizar estado do usuário:", error);
      // Mesmo com erro, garantir que o estado seja limpo
      if (!session) {
        setUser(null);
        setTenant(null);
      }
    }
  };

  // Efeito para monitorar mudanças na autenticação
  useEffect(() => {
    console.log("Inicializando AuthProvider");
    
    let mounted = true;
    
    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Evento de autenticação:", event, session?.user?.id);
        
        if (!mounted) return;
        
        setSession(session);
        await updateUserState(session);
        
        if (!isInitialized) {
          setIsInitialized(true);
        }
      }
    );

    // Verificar sessão atual ao iniciar
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Erro ao obter sessão:", error);
        }
        
        console.log("Sessão inicial:", session?.user?.id);
        
        if (mounted) {
          setSession(session);
          await updateUserState(session);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Erro na inicialização da autenticação:", error);
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      console.log("Desconectando listener de autenticação");
      subscription.unsubscribe();
    };
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Tentando fazer login:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Erro no login:", error);
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: error.message,
        });
        throw error;
      }

      if (data.user) {
        console.log("Login bem-sucedido:", data.user.id);
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao SightX!",
        });
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
      console.log("Tentando criar conta:", email);
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
        console.error("Erro no signup:", error);
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: error.message,
        });
        throw error;
      }

      console.log("Signup bem-sucedido:", data.user?.id);
      toast({
        title: "Conta criada com sucesso",
        description: "Seu ambiente foi configurado automaticamente. Bem-vindo ao SightX!",
      });

    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log("Fazendo logout...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erro no logout:", error);
        toast({
          variant: "destructive",
          title: "Erro ao fazer logout",
          description: error.message,
        });
      } else {
        console.log("Logout bem-sucedido");
        toast({
          title: "Logout bem-sucedido",
          description: "Você foi desconectado da sua conta.",
        });
      }
    } catch (error: any) {
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
        isAuthenticated: !!user && !!session,
        login,
        signup,
        logout,
        isLoading,
        tenant,
        isInitialized
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
