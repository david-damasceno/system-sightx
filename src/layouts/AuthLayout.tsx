
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AuthLayout = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to chat if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
