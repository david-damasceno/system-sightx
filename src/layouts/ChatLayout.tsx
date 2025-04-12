
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { Loader2 } from "lucide-react";
import { useMode } from "../contexts/ModeContext";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const ChatLayout = () => {
  const { isAuthenticated, isLoading, tenant } = useAuth();
  const { mode } = useMode();
  const location = useLocation();
  const navigate = useNavigate();
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Erro ao configurar o ambiente. Tente novamente mais tarde.");

  useEffect(() => {
    // Mostrar o diálogo de erro se o tenant tiver status de erro
    if (tenant && tenant.status === 'error') {
      setShowErrorDialog(true);
      // Se houver uma mensagem de erro específica, exibir
      if (tenant.error_message) {
        setErrorMessage(tenant.error_message);
      }
    }
  }, [tenant]);

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
    navigate("/");
  };

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

  // Diálogo de erro para problemas na configuração
  return (
    <>
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Erro na configuração do ambiente</DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCloseErrorDialog}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="h-screen flex overflow-hidden bg-muted/30">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default ChatLayout;
