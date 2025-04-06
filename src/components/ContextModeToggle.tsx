
import React from 'react';
import { Button } from '@/components/ui/button';
import { Briefcase, UserCircle2 } from 'lucide-react';
import { useContextMode, ContextMode } from '@/hooks/use-context-mode';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

interface ContextModeToggleProps {
  className?: string;
  variant?: 'default' | 'small';
}

const ContextModeToggle: React.FC<ContextModeToggleProps> = ({ 
  className,
  variant = 'default'
}) => {
  const { contextMode, switchContextMode } = useContextMode();
  
  if (variant === 'small') {
    return (
      <div className={cn("flex gap-1 items-center rounded-full bg-muted p-1", className)}>
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "rounded-full h-7 w-7 p-0",
            contextMode === 'personal' && "bg-white dark:bg-sightx-purple text-sightx-purple dark:text-white shadow-sm"
          )}
          onClick={() => switchContextMode('personal')}
        >
          <UserCircle2 className="h-4 w-4" />
          <span className="sr-only">Modo Pessoal</span>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "rounded-full h-7 w-7 p-0",
            contextMode === 'business' && "bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-sm"
          )}
          onClick={() => switchContextMode('business')}
        >
          <Briefcase className="h-4 w-4" />
          <span className="sr-only">Modo Empresarial</span>
        </Button>
      </div>
    );
  }
  
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex gap-2 items-center rounded-full bg-muted p-1">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "rounded-full px-3 h-8 transition-all duration-300",
                contextMode === 'personal' 
                  ? "bg-white dark:bg-sightx-purple/90 text-sightx-purple dark:text-white shadow-md"
                  : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10"
              )}
              onClick={() => switchContextMode('personal')}
            >
              <UserCircle2 className="h-4 w-4 mr-2" />
              Pessoal
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-72 p-3">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Modo Pessoal</h4>
              <p className="text-xs text-muted-foreground">
                Assistente adaptado para suas necessidades pessoais e cotidianas.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
        
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "rounded-full px-3 h-8 transition-all duration-300",
                contextMode === 'business' 
                  ? "bg-white dark:bg-blue-600/90 text-blue-600 dark:text-white shadow-md"
                  : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10"
              )}
              onClick={() => switchContextMode('business')}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Empresarial
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-72 p-3">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Modo Empresarial</h4>
              <p className="text-xs text-muted-foreground">
                Assistente focado em análises corporativas, documentos e relatórios.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
};

export default ContextModeToggle;
