
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to chat if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sightx-purple/10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-sightx-green/10 rounded-full filter blur-3xl" />
      </div>
      
      {/* Auth content */}
      <div className="z-10 w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
