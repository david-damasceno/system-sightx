
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { Loader2 } from "lucide-react";
import { useMode } from "../contexts/ModeContext";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

const ChatLayout = () => {
  const { isAuthenticated, isLoading, tenant, user } = useAuth();
  const { mode } = useMode();
  const location = useLocation();
  const navigate = useNavigate();
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Erro ao configurar o ambiente. Tente novamente mais tarde.");
  const [setupProgress, setSetupProgress] = useState(0);
  const [timeoutCount, setTimeoutCount] = useState(0);

  useEffect(() => {
    // Mostrar o diálogo de erro se o tenant tiver status de erro
    if (tenant && tenant.status === 'error') {
      console.log("Tenant com status de erro:", tenant);
      setShowErrorDialog(true);
      // Se houver uma mensagem de erro específica, exibir
      if (tenant.error_message) {
        setErrorMessage(tenant.error_message);
      }
    }
  }, [tenant]);

  // Efeito para simular progresso durante a criação
  useEffect(() => {
    let interval: number | undefined;
    
    if (tenant && tenant.status === 'creating') {
      // Inicializar o progresso se necessário
      if (setupProgress === 0) {
        setSetupProgress(5); // Começa com 5%
      }
      
      // Incrementar o progresso a cada 3 segundos até 90%
      interval = window.setInterval(() => {
        setSetupProgress(prev => {
          // Avançar mais rápido no início, mais lento conforme se aproxima de 90%
          const increment = prev < 30 ? 10 : prev < 60 ? 5 : 2;
          const next = Math.min(prev + increment, 90);
          
          // Se estamos demorando muito, aumentar o contador de timeout
          if (prev > 80) {
            setTimeoutCount(prevCount => prevCount + 1);
          }
          
          return next;
        });
      }, 3000);
    } else if (tenant && tenant.status === 'active') {
      // Se ativo, ir para 100%
      setSetupProgress(100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tenant, setupProgress]);

  // Efeito para detectar se o ambiente está demorando muito para ser configurado
  useEffect(() => {
    // Se o contador de timeout chegar a 5 (aproximadamente 15 segundos em 80%+)
    if (timeoutCount > 5 && tenant && tenant.status === 'creating') {
      // Mostrar opção ao usuário para continuar mesmo sem configuração completa
      setErrorMessage("A configuração do ambiente está demorando mais que o esperado. Deseja continuar mesmo assim?");
      setShowErrorDialog(true);
    }
  }, [timeoutCount, tenant]);

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
    // Em caso de timeout, permitir usar o app mesmo com configuração incompleta
    if (timeoutCount > 5 && tenant && tenant.status === 'creating') {
      // Não redirecionar, apenas fechar o diálogo
    } else {
      // Em caso de erro real, redirecionar para a página inicial
      navigate("/");
    }
  };

  const handleContinueAnyway = () => {
    setShowErrorDialog(false);
    // Podemos adicionar lógica adicional aqui se necessário
  };

  // Se não está autenticado, redirecionar para o login
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show loading state com timeout
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

  // Mostrar tela de carregamento se o tenant estiver sendo configurado
  // com opção para continuar após um certo tempo
  if (tenant && tenant.status === 'creating' && !showErrorDialog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="h-20 w-20 mb-8 rounded-[20px] flex items-center justify-center bg-sightx-purple/10">
          <img 
            src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" 
            alt="SightX Logo" 
            className="h-12 w-12 animate-pulse rounded-[20px]" 
          />
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-sightx-purple mb-4" />
        <p className="mt-2 text-muted-foreground">Configurando seu ambiente...</p>
        <p className="text-sm text-muted-foreground mb-4">Isso pode levar alguns minutos.</p>
        
        {/* Barra de progresso */}
        <div className="w-64 bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className="bg-sightx-purple h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${setupProgress}%` }}
          ></div>
        </div>
        <p className="text-xs text-muted-foreground">{setupProgress}% concluído</p>
        
        {/* Botão para continuar sem esperar a configuração completa */}
        {timeoutCount > 5 && (
          <Button 
            variant="outline"
            className="mt-6"
            onClick={() => {
              setShowErrorDialog(true);
            }}
          >
            Continuar mesmo assim
          </Button>
        )}
      </div>
    );
  }

  // Diálogo de erro para problemas na configuração ou opção de continuar
  return (
    <>
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={timeoutCount > 5 ? "" : "text-destructive"}>
              {timeoutCount > 5 ? "Configuração em andamento" : "Erro na configuração do ambiente"}
            </DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            {timeoutCount > 5 && tenant?.status === 'creating' ? (
              <>
                <Button variant="outline" onClick={handleCloseErrorDialog}>Aguardar</Button>
                <Button onClick={handleContinueAnyway}>Continuar mesmo assim</Button>
              </>
            ) : (
              <Button onClick={handleCloseErrorDialog}>OK</Button>
            )}
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
