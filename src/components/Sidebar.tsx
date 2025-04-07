
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMode } from "../contexts/ModeContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle, ModeIndicator } from "./ModeToggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, History, User, LogOut, Menu, X, Plus, 
  ChevronRight, ChevronLeft, Settings, BellRing, HelpCircle, 
  Moon, Sun, Briefcase, BarChart, Bookmark, PanelLeftOpen, PanelLeftClose
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useToast } from "@/hooks/use-toast";

const NavItem = ({
  to,
  icon: Icon,
  children,
  onClick,
  isActive: forced,
  isCompact
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
  
  if (isCompact) {
    return (
      <Link
        to={to}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl mx-auto mb-1 transition-all duration-300",
          isActive
            ? "bg-sightx-purple text-white shadow-md shadow-sightx-purple/20"
            : "hover:bg-sightx-purple/10 text-muted-foreground hover:text-sightx-purple",
        )}
        onClick={onClick}
        title={String(children)}
      >
        <Icon className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300",
        isActive
          ? "bg-sightx-purple text-white font-medium shadow-md shadow-sightx-purple/20"
          : "hover:bg-sightx-purple/10 text-muted-foreground hover:text-sightx-purple"
      )}
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
      {isActive && (
        <ChevronRight className="ml-auto h-4 w-4 text-white" />
      )}
    </Link>
  );
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const { user, logout } = useAuth();
  const { mode } = useMode();
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      toast({
        title: "Tema claro ativado",
        description: "O tema da aplicação foi alterado para claro."
      });
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      toast({
        title: "Tema escuro ativado",
        description: "O tema da aplicação foi alterado para escuro."
      });
    }
  };

  const toggleCompactMode = () => {
    setIsCompact(!isCompact);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      <aside
        ref={sidebarRef}
        className={cn(
          "bg-background/95 dark:bg-sightx-dark/95 fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out shadow-lg border-r border-border/50 md:relative backdrop-blur-lg flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCompact ? "md:w-[70px]" : "md:w-64"
        )}
      >
        <div className="flex-none p-3">
          <div
            className={cn(
              "flex items-center py-4 transition-all duration-300",
              isCompact ? "justify-center px-0" : "px-3"
            )}
          >
            <img
              src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png"
              alt="SightX Logo"
              className="h-10 w-10 object-contain rounded-xl"
            />
            
            <h1
              className={cn(
                "text-xl font-bold ml-2 transition-all duration-300 text-sightx-purple",
                isCompact ? "opacity-0 w-0" : "opacity-100"
              )}
            >
              SightX
            </h1>
          </div>
          
          <Separator className="my-3" />
          
          {!isCompact && <ModeToggle />}
          
          {isCompact ? (
            <NavItem to="/chat" icon={Plus} isCompact={true} isActive={false}>
              Nova Conversa
            </NavItem>
          ) : (
            <Link to="/chat">
              <Button
                className="w-full mb-3 flex gap-2 shadow-md bg-sightx-purple hover:bg-sightx-purple-light shadow-sightx-purple/20"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Nova Conversa
              </Button>
            </Link>
          )}
        </div>
          
        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1 mt-3 mb-6">
            {isCompact ? (
              <>
                <NavItem to="/chat" icon={MessageSquare} isCompact={true}>
                  Chat
                </NavItem>
                <NavItem to="/history" icon={History} isCompact={true}>
                  Histórico
                </NavItem>
                <NavItem to="/mode-context" icon={Bookmark} isCompact={true}>
                  Contextos
                </NavItem>
                <NavItem to="/analysis" icon={BarChart} isCompact={true}>
                  Análises
                </NavItem>
                <NavItem to="/profile" icon={User} isCompact={true}>
                  Perfil
                </NavItem>
              </>
            ) : (
              <>
                <NavItem to="/chat" icon={MessageSquare}>
                  Chat
                </NavItem>
                <NavItem to="/history" icon={History}>
                  Histórico
                </NavItem>
                <NavItem to="/mode-context" icon={Bookmark}>
                  Contextos
                </NavItem>
                <NavItem to="/analysis" icon={BarChart}>
                  Análises
                </NavItem>
                <NavItem to="/profile" icon={User}>
                  Perfil
                </NavItem>
              </>
            )}
          </nav>
          
          {!isCompact && (
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
        </ScrollArea>
        
        <div className="flex-none p-3">
          <Separator className="my-3" />
          
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleCompactMode}
              className="w-full flex items-center justify-center gap-2 text-xs"
            >
              {isCompact ? (
                <>
                  <PanelLeftOpen className="h-4 w-4" />
                  <span className="sr-only">Expandir</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4" />
                  <span>Recolher menu</span>
                </>
              )}
            </Button>
          </div>
          
          {isCompact ? (
            <Button
              variant="ghost"
              className="w-10 h-10 rounded-full p-0 mx-auto block"
              onClick={() => logout()}
            >
              <Avatar
                className="h-9 w-9 border-2 border-sightx-purple/20"
              >
                <AvatarImage src={user?.avatar} />
                <AvatarFallback
                  className="text-white bg-sightx-purple"
                >
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar
                className="h-10 w-10 border-2 border-sightx-purple/20"
              >
                <AvatarImage src={user?.avatar} />
                <AvatarFallback
                  className="text-white bg-sightx-purple"
                >
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
                className="text-muted-foreground hover:text-destructive h-8 w-8"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>
      
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
