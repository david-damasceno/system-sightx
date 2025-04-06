
import { useState, useEffect } from "react";
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
  Plus,
  ChevronRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={to}
      className={cn(
        "nav-link transition-all duration-200 group",
        isActive && "active",
        !isActive && "hover:bg-sightx-purple/10"
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Icon className={cn("h-5 w-5 transition-transform", isHovered && "scale-110")} />
      <span>{children}</span>
      {isHovered && !isActive && (
        <ChevronRight className="ml-auto h-4 w-4 text-sightx-purple opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </Link>
  );
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Toggle compact mode for desktop
  const toggleCompact = () => {
    setIsCompact(!isCompact);
  };
  
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
          "bg-white dark:bg-sightx-dark fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out shadow-lg border-r border-border/50 md:relative",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCompact ? "w-16" : "w-72"
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className={cn(
            "flex items-center justify-center py-6 transition-all duration-300",
            isCompact ? "justify-center" : "justify-start"
          )}>
            <img 
              src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" 
              alt="SightX Logo" 
              className={cn("h-10 w-10 transition-transform", isCompact && "mx-auto")} 
            />
            {!isCompact && (
              <h1 className="text-xl font-bold ml-2 text-sightx-purple">
                SightX
              </h1>
            )}

            {/* Toggle compact button - only on desktop */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCompact}
              className="h-6 w-6 ml-auto hidden md:flex"
            >
              <ChevronRight className={cn("h-4 w-4 transition-transform", isCompact && "rotate-180")} />
            </Button>
          </div>
          
          <Separator className="my-4" />
          
          {/* New Chat button */}
          {isCompact ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button 
                  className="mx-auto bg-sightx-purple hover:bg-sightx-purple-light mb-6 h-10 w-10 rounded-full p-0" 
                  asChild
                >
                  <Link to="/chat">
                    <Plus className="h-5 w-5" />
                  </Link>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent side="right" align="start" className="p-2 text-sm">
                Nova Conversa
              </HoverCardContent>
            </HoverCard>
          ) : (
            <Link to="/chat">
              <Button className="w-full bg-sightx-purple hover:bg-sightx-purple-light mb-6 flex gap-2">
                <Plus className="h-4 w-4" />
                Nova Conversa
              </Button>
            </Link>
          )}
          
          {/* Navigation */}
          <nav className="space-y-1 mb-6">
            {isCompact ? (
              <>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Link 
                      to="/chat" 
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-md mx-auto",
                        location.pathname === "/chat" || location.pathname.startsWith("/chat/") 
                          ? "bg-sightx-purple/20 text-sightx-purple" 
                          : "hover:bg-sightx-purple/10"
                      )}
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent side="right" align="start" className="p-2 text-sm">
                    Chat
                  </HoverCardContent>
                </HoverCard>
                
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Link 
                      to="/history" 
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-md mx-auto",
                        location.pathname === "/history" 
                          ? "bg-sightx-purple/20 text-sightx-purple" 
                          : "hover:bg-sightx-purple/10"
                      )}
                    >
                      <History className="h-5 w-5" />
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent side="right" align="start" className="p-2 text-sm">
                    Histórico
                  </HoverCardContent>
                </HoverCard>
                
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Link 
                      to="/profile" 
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-md mx-auto",
                        location.pathname === "/profile" 
                          ? "bg-sightx-purple/20 text-sightx-purple" 
                          : "hover:bg-sightx-purple/10"
                      )}
                    >
                      <User className="h-5 w-5" />
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent side="right" align="start" className="p-2 text-sm">
                    Perfil
                  </HoverCardContent>
                </HoverCard>
              </>
            ) : (
              <>
                <NavItem to="/chat" icon={MessageSquare} onClick={() => setIsOpen(false)}>
                  Chat
                </NavItem>
                <NavItem to="/history" icon={History} onClick={() => setIsOpen(false)}>
                  Histórico
                </NavItem>
                <NavItem to="/profile" icon={User} onClick={() => setIsOpen(false)}>
                  Perfil
                </NavItem>
              </>
            )}
          </nav>
          
          <div className="mt-auto">
            <Separator className="my-4" />
            
            {/* User info */}
            {isCompact ? (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" className="w-10 h-10 rounded-full p-0 mx-auto">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-sightx-purple text-white">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent side="right" align="start" className="p-4 w-64">
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={logout}
                      className="mt-2 w-full"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ) : (
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
            )}
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
