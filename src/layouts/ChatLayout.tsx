
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import { Loader2 } from "lucide-react";
import { useMode } from "../contexts/ModeContext";
import { cn } from "@/lib/utils";

const ChatLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { mode } = useMode();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className={cn(
          "h-20 w-20 mb-8 rounded-2xl flex items-center justify-center",
          mode === "business" ? "bg-sightx-green/10" : "bg-sightx-purple/10"
        )}>
          <img 
            src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" 
            alt="SightX Logo" 
            className="h-12 w-12 animate-pulse" 
          />
        </div>
        <Loader2 className={cn(
          "h-8 w-8 animate-spin",
          mode === "business" ? "text-sightx-green" : "text-sightx-purple"
        )} />
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
