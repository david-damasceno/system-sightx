
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { Loader2 } from "lucide-react";
import { useMode } from "../contexts/ModeContext";
import { cn } from "@/lib/utils";

const ChatLayout = () => {
  const { isAuthenticated, isLoading, tenant } = useAuth();
  const { mode } = useMode();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="h-20 w-20 mb-8 rounded-[20px] flex items-center justify-center bg-sightx-purple/10">
          <img 
            src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" 
            alt="SightX Logo" 
            className="h-12 w-12 animate-pulse rounded-[20px]" 
          />
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-sightx-purple" />
        <p className="mt-4 text-muted-foreground">Carregando SightX...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Mostrar tela de carregamento se o tenant estiver sendo configurado
  if (tenant && tenant.status === 'creating') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="h-20 w-20 mb-8 rounded-[20px] flex items-center justify-center bg-sightx-purple/10">
          <img 
            src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" 
            alt="SightX Logo" 
            className="h-12 w-12 animate-pulse rounded-[20px]" 
          />
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-sightx-purple" />
        <p className="mt-4 text-muted-foreground">Configurando seu ambiente...</p>
        <p className="text-sm text-muted-foreground">Isso pode levar alguns minutos.</p>
      </div>
    );
  }

  // Mostrar tela de erro se ocorreu algum problema na configuração
  if (tenant && tenant.status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="h-20 w-20 mb-8 rounded-[20px] flex items-center justify-center bg-red-100">
          <img 
            src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" 
            alt="SightX Logo" 
            className="h-12 w-12 rounded-[20px]" 
          />
        </div>
        <p className="mt-4 text-lg font-semibold text-destructive">Erro na configuração</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
          Ocorreu um erro ao configurar seu ambiente. 
          Por favor, entre em contato com o suporte técnico.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-muted/30">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ChatLayout;
