
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
          await fetchTenant(session.user.id);
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
        await fetchTenant(session.user.id);
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
        description: "Seu ambiente foi configurado automaticamente. Bem-vindo ao SightX!",
      });

      // O tenant já é criado automaticamente pelo trigger, então apenas aguardamos
      console.log("Usuário criado com sucesso:", data.user?.id);

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
