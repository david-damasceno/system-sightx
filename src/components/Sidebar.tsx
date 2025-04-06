
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  History,
  User,
  LogOut,
  Menu,
  X,
  Plus
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const NavItem = ({
  to,
  icon: Icon,
  children,
  onClick,
}: {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const { pathname } = useLocation();
  const isActive = pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={cn("nav-link", isActive && "active")}
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </Link>
  );
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  
  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white dark:bg-sightx-dark fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center justify-center py-6">
            <img 
              src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" 
              alt="SightX Logo" 
              className="h-12 w-12" 
            />
            <h1 className="text-xl font-bold ml-2 bg-gradient-to-r from-sightx-purple to-sightx-green bg-clip-text text-transparent">
              SightX
            </h1>
          </div>
          
          <Separator className="my-4" />
          
          {/* New Chat button */}
          <Link to="/chat">
            <Button className="w-full bg-sightx-purple hover:bg-sightx-purple-light mb-6 flex gap-2">
              <Plus className="h-4 w-4" />
              Nova Conversa
            </Button>
          </Link>
          
          {/* Navigation */}
          <nav className="space-y-1 mb-6">
            <NavItem to="/chat" icon={MessageSquare} onClick={() => setIsOpen(false)}>
              Chat
            </NavItem>
            <NavItem to="/history" icon={History} onClick={() => setIsOpen(false)}>
              Histórico
            </NavItem>
            <NavItem to="/profile" icon={User} onClick={() => setIsOpen(false)}>
              Perfil
            </NavItem>
          </nav>
          
          <div className="mt-auto">
            <Separator className="my-4" />
            
            {/* User info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-sightx-purple text-white">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {user?.email}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
