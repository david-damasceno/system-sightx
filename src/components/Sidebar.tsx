
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, History, User, LogOut, Menu, X, Plus, ChevronRight, Settings, BellRing, HelpCircle, Moon, Sun, BarChart, Bookmark, PanelLeftOpen, PanelLeftClose, Database } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
            : "hover:bg-sightx-purple/10 text-muted-foreground hover:text-sightx-purple"
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
      {isActive && <ChevronRight className="ml-auto h-4 w-4 text-white" />}
    </Link>
  );
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const { user, logout } = useAuth();
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

  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    const nameParts = user.name.trim().split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    } else {
      return nameParts[0].charAt(0).toUpperCase();
    }
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
        <div className="flex-none p-3 py-0">
          <div className={cn(
            "flex items-center py-4 transition-all duration-300",
            isCompact ? "justify-center px-0" : "justify-center px-3"
          )}>
            <img 
              src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" 
              alt="SightX Logo" 
              className={cn(
                "object-contain rounded-xl transition-all duration-300",
                isCompact ? "h-12 w-12" : "h-14 w-14"
              )} 
            />
            
            <h1 className={cn(
              "font-bold ml-2 transition-all duration-300 text-sightx-purple",
              isCompact ? "opacity-0 w-0" : "opacity-100 text-2xl"
            )}>
              SightX
            </h1>
          </div>
          
          <Separator className="my-0" />
          
          {isCompact ? (
            <NavItem to="/chat" icon={Plus} isCompact={true} isActive={false}>
              Nova Conversa
            </NavItem>
          ) : (
            <Link to="/chat" className="block mt-4 mb-3">
              <Button className="w-full flex gap-2 shadow-md bg-sightx-purple hover:bg-sightx-purple-light shadow-sightx-purple/20" size="sm">
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
                <NavItem to="/context" icon={Bookmark} isCompact={true}>
                  Contextos
                </NavItem>
                <NavItem to="/analysis" icon={BarChart} isCompact={true}>
                  Análises
                </NavItem>
                <NavItem to="/data" icon={Database} isCompact={true}>
                  Dados
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
                <NavItem to="/context" icon={Bookmark}>
                  Contextos
                </NavItem>
                <NavItem to="/analysis" icon={BarChart}>
                  Análises
                </NavItem>
                <NavItem to="/data" icon={Database}>
                  Dados
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
              <Avatar className="h-9 w-9 border-2 border-sightx-purple/20">
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={user?.name || "User"} />
                ) : (
                  <AvatarFallback className="text-white bg-sightx-purple">
                    {getUserInitials()}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="h-10 w-10 border-2 border-sightx-purple/20">
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={user?.name || "User"} />
                ) : (
                  <AvatarFallback className="text-white bg-sightx-purple">
                    {getUserInitials()}
                  </AvatarFallback>
                )}
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
