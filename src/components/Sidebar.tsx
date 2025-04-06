
import { useState, useEffect, useRef } from "react";
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
  ChevronRight,
  ChevronLeft,
  Settings,
  BellRing,
  HelpCircle,
  Moon,
  Sun
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useToast } from "@/hooks/use-toast";
import { useContextMode } from "@/hooks/use-context-mode";
import ContextModeToggle from "./ContextModeToggle";
import SightXLogo from "./SightXLogo";

const NavItem = ({
  to,
  icon: Icon,
  children,
  onClick,
  isActive: forced,
  isCompact,
}: {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  isCompact?: boolean;
}) => {
  const { pathname } = useLocation();
  const isActive = forced !== undefined ? forced : pathname === to || pathname.startsWith(`${to}/`);
  const [isHovered, setIsHovered] = useState(false);
  const { contextMode } = useContextMode();
  
  if (isCompact) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Link
            to={to}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl mx-auto mb-1 transition-all duration-300",
              isActive 
                ? contextMode === 'business'
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-sightx-purple text-white shadow-md shadow-sightx-purple/20"
                : "hover:bg-sightx-purple/10 text-muted-foreground hover:text-sightx-purple",
              contextMode === 'business' && "hover:bg-blue-600/10 hover:text-blue-600",
              isHovered && !isActive && "scale-110"
            )}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Icon className={cn("h-5 w-5 transition-transform", isHovered && !isActive ? "scale-110" : "")} />
          </Link>
        </HoverCardTrigger>
        <HoverCardContent side="right" className="py-2 px-3 text-sm">
          {children}
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300 group",
        isActive 
          ? contextMode === 'business'
            ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-600/20"
            : "bg-sightx-purple text-white font-medium shadow-md shadow-sightx-purple/20"
          : "hover:bg-sightx-purple/10 text-muted-foreground hover:text-sightx-purple"
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Icon className={cn("h-5 w-5 transition-all", isHovered && !isActive ? "scale-110" : "")} />
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
  const [isHovering, setIsHovering] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const { toast } = useToast();
  const { contextMode } = useContextMode();
  
  // Expand sidebar on hover when in compact mode
  const handleMouseEnter = () => {
    if (isCompact) {
      setIsHovering(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (isCompact) {
      setIsHovering(false);
    }
  };
  
  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Toggle dark mode function
  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      toast({
        title: "Tema claro ativado",
        description: "O tema da aplicação foi alterado para claro.",
      });
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      toast({
        title: "Tema escuro ativado",
        description: "O tema da aplicação foi alterado para escuro.",
      });
    }
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
        ref={sidebarRef}
        className={cn(
          "bg-background/95 dark:bg-sightx-dark/95 fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out shadow-lg border-r border-border/50 md:relative backdrop-blur-lg",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCompact && !isHovering ? "md:w-[70px]" : "md:w-64",
          contextMode === 'business' && "context-business"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col h-full p-3">
          {/* Logo */}
          <div className={cn(
            "flex items-center justify-center py-4 transition-all duration-300",
            isCompact && !isHovering ? "justify-center px-0" : "px-3"
          )}>
            <div className={cn(
              "rounded-xl flex items-center justify-center shadow-lg p-2",
              contextMode === 'business' ? "bg-blue-600 shadow-blue-600/20" : "bg-sightx-purple shadow-sightx-purple/20"
            )}>
              <SightXLogo size="sm" colorClass="text-white" />
            </div>
            
            <h1 className={cn(
              "text-xl font-bold ml-2 transition-all duration-300",
              contextMode === 'business' ? "text-blue-600" : "text-sightx-purple",
              isCompact && !isHovering ? "opacity-0 w-0" : "opacity-100"
            )}>
              SightX
            </h1>

            {/* Toggle compact button - only on desktop */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCompact(!isCompact)}
              className={cn(
                "h-6 w-6 ml-auto transition-opacity duration-300 hidden md:flex",
                isCompact && !isHovering ? "opacity-0" : "opacity-100"
              )}
            >
              {isCompact ? 
                <ChevronRight className="h-4 w-4" /> : 
                <ChevronLeft className="h-4 w-4" />
              }
            </Button>
          </div>
          
          {/* Context switcher */}
          {isCompact && !isHovering ? (
            <div className="flex justify-center mb-3 mt-1">
              <ContextModeToggle variant="small" />
            </div>
          ) : (
            <div className="px-2 mb-1">
              <ContextModeToggle />
            </div>
          )}
          
          <Separator className="my-3" />
          
          {/* New Chat button */}
          {isCompact && !isHovering ? (
            <NavItem 
              to="/chat" 
              icon={Plus} 
              isCompact={true}
              isActive={false}
            >
              Nova Conversa
            </NavItem>
          ) : (
            <Link to="/chat">
              <Button 
                className={cn(
                  "w-full mb-3 flex gap-2 shadow-md",
                  contextMode === 'business' 
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" 
                    : "bg-sightx-purple hover:bg-sightx-purple-light shadow-sightx-purple/20"
                )}
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Nova Conversa
              </Button>
            </Link>
          )}
          
          {/* Navigation */}
          <nav className="space-y-1 mt-3 mb-6">
            {isCompact && !isHovering ? (
              <>
                <NavItem to="/chat" icon={MessageSquare} isCompact={true}>Chat</NavItem>
                <NavItem to="/history" icon={History} isCompact={true}>Histórico</NavItem>
                <NavItem to="/profile" icon={User} isCompact={true}>Perfil</NavItem>
              </>
            ) : (
              <>
                <NavItem to="/chat" icon={MessageSquare}>Chat</NavItem>
                <NavItem to="/history" icon={History}>Histórico</NavItem>
                <NavItem to="/profile" icon={User}>Perfil</NavItem>
              </>
            )}
          </nav>
          
          {/* Secondary Navigation */}
          {(!isCompact || isHovering) && (
            <>
              <div className="px-3 mb-2">
                <p className="text-xs text-muted-foreground mb-2">Preferências</p>
                <div className="space-y-1">
                  <button 
                    className="flex items-center w-full gap-3 py-2 px-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                    onClick={toggleDarkMode}
                  >
                    <Sun className="h-5 w-5 dark:hidden" />
                    <Moon className="h-5 w-5 hidden dark:block" />
                    <span>Alternar tema</span>
                  </button>
                  <button className="flex items-center w-full gap-3 py-2 px-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                    <BellRing className="h-5 w-5" />
                    <span>Notificações</span>
                  </button>
                  <button className="flex items-center w-full gap-3 py-2 px-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                    <Settings className="h-5 w-5" />
                    <span>Configurações</span>
                  </button>
                </div>
              </div>
              
              <div className="px-3">
                <button className="flex items-center w-full gap-3 py-2 px-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                  <HelpCircle className="h-5 w-5" />
                  <span>Ajuda</span>
                </button>
              </div>
            </>
          )}
          
          <div className="mt-auto">
            <Separator className="my-3" />
            
            {/* User info */}
            {isCompact && !isHovering ? (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" className="w-10 h-10 rounded-full p-0 mx-auto block">
                    <Avatar className={cn(
                      "h-9 w-9 border-2",
                      contextMode === 'business' ? "border-blue-600/20" : "border-sightx-purple/20"
                    )}>
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className={cn(
                        "text-white",
                        contextMode === 'business' ? "bg-blue-600" : "bg-sightx-purple"
                      )}>
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent side="right" align="start" className="p-4 w-64 bg-card shadow-xl">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className={cn(
                          "text-lg text-white",
                          contextMode === 'business' ? "bg-blue-600" : "bg-sightx-purple"
                        )}>
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <Separator />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={logout}
                      className="w-full mt-1"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar className={cn(
                  "h-10 w-10 border-2",
                  contextMode === 'business' ? "border-blue-600/20" : "border-sightx-purple/20"
                )}>
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className={cn(
                    "text-white",
                    contextMode === 'business' ? "bg-blue-600" : "bg-sightx-purple"
                  )}>
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="text-muted-foreground hover:text-destructive h-8 w-8 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
