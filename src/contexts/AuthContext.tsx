
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in from local storage
    const storedUser = localStorage.getItem("sightx-user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("sightx-user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // This is a mock authentication - in a real app, you'd call your backend
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock validation - in real app, this would be server-side
      if (email === "demo@sightx.ai" && password === "password") {
        const userData: User = {
          id: "user-1",
          name: "Demo User",
          email: "demo@sightx.ai",
          avatar: "/placeholder.svg"
        };
        
        setUser(userData);
        localStorage.setItem("sightx-user", JSON.stringify(userData));
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao SightX!",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: "Email ou senha incorretos.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Ocorreu um erro ao tentar fazer login.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sightx-user");
    toast({
      title: "Logout bem-sucedido",
      description: "Você foi desconectado da sua conta.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
