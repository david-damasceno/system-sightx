
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";

const ChatLayout = () => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  // Mostrar loading apenas enquanto está inicializando
  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sightx-purple"></div>
      </div>
    );
  }

  // Se não está autenticado, redirecionar para o login
  if (!isAuthenticated) {
    console.log("Usuário não autenticado, redirecionando para login");
    return <Navigate to="/login" state={{ from: location }} replace />;
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
