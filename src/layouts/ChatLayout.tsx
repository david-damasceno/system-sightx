
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

const ChatLayout = () => {
  const { isAuthenticated, isLoading, tenant } = useAuth();
  const location = useLocation();
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Erro ao configurar o ambiente. Tente novamente mais tarde.");
  const [setupProgress, setSetupProgress] = useState(0);
  const [timeoutCount, setTimeoutCount] = useState(0);
  const [showSetupProgress, setShowSetupProgress] = useState(false);

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
    // Não redirecionar, apenas fechar o diálogo
  };

  const handleContinueAnyway = () => {
    setShowErrorDialog(false);
    // Podemos adicionar lógica adicional aqui se necessário
  };

  const toggleSetupProgress = () => {
    setShowSetupProgress(!showSetupProgress);
  };

  // Se não está autenticado, redirecionar para o login
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

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
          {/* Barra de progresso opcional que pode ser mostrada na parte superior */}
          {tenant && tenant.status === 'creating' && showSetupProgress && (
            <div className="bg-sightx-purple/5 p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Configurando ambiente: {setupProgress}%</span>
                <Button variant="ghost" size="sm" className="h-6 px-2" onClick={toggleSetupProgress}>
                  Esconder
                </Button>
              </div>
              <Progress value={setupProgress} className="h-1" />
            </div>
          )}
          
          {/* Mostrar botão para exibir progresso se estiver configurando e não estiver visível */}
          {tenant && tenant.status === 'creating' && !showSetupProgress && (
            <div className="absolute top-4 right-4 z-10">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-background/80 backdrop-blur-sm" 
                onClick={toggleSetupProgress}
              >
                Ver progresso da configuração
              </Button>
            </div>
          )}
          
          {/* Conteúdo principal sempre visível */}
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default ChatLayout;
