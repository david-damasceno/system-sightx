
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

// Componente simplificado que apenas mostra um indicador de contexto
export const ContextIndicator: React.FC = () => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-7 w-7 rounded-full",
            "text-sightx-purple hover:text-sightx-purple/90 hover:bg-sightx-purple/10"
          )}
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Contextos</p>
      </TooltipContent>
    </Tooltip>
  );
};
