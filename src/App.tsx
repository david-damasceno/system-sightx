
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import ChatLayout from "./layouts/ChatLayout";
import Login from "./pages/Login";
import ChatWindow from "./pages/ChatWindow";
import ChatHistory from "./pages/ChatHistory";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { useContextMode } from "./hooks/use-context-mode";
import { cn } from "./lib/utils";

const ContextWrapper = ({ children }: { children: React.ReactNode }) => {
  const { contextMode } = useContextMode();
  
  return (
    <div className={cn(
      "app-container",
      contextMode === 'business' && "context-business"
    )}>
      {children}
    </div>
  );
};

const AppContent = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ContextWrapper>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* App Routes */}
            <Route element={<ChatLayout />}>
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="/chat" element={<ChatWindow />} />
              <Route path="/chat/:id" element={<ChatWindow />} />
              <Route path="/history" element={<ChatHistory />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ContextWrapper>
    </TooltipProvider>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
