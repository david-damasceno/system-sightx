
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { Loader2 } from "lucide-react";

const ChatLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <img 
          src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" 
          alt="SightX Logo" 
          className="h-20 w-20 mb-8 animate-pulse" 
        />
        <Loader2 className="h-8 w-8 text-sightx-purple animate-spin" />
        <p className="mt-4 text-muted-foreground">Carregando SightX...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default ChatLayout;
