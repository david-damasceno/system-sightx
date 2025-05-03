
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import ChatLayout from "./layouts/ChatLayout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import ChatWindow from "./pages/ChatWindow";
import ChatHistory from "./pages/ChatHistory";
import Profile from "./pages/Profile";
import ModeContext from "./pages/ModeContext";
import Analysis from "./pages/Analysis";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ModeProvider } from "./contexts/ModeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
              </Route>

              {/* App Routes */}
              <Route element={<ChatLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/chat" element={<ChatWindow />} />
                <Route path="/chat/:id" element={<ChatWindow />} />
                <Route path="/history" element={<ChatHistory />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/mode-context" element={<ModeContext />} />
                <Route path="/analysis" element={<Analysis />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
