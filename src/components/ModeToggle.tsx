
import React from "react";
import { useMode } from "../contexts/ModeContext";
import { Briefcase, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export const ModeToggle: React.FC = () => {
  const { mode, setMode } = useMode();

  return (
    <div className="mb-2">
      <p className="text-xs text-muted-foreground mb-1.5 px-1">Modo de contexto</p>
      <ToggleGroup 
        type="single" 
        value={mode}
        onValueChange={(value) => {
          if (value) setMode(value as "personal" | "business");
        }}
        className="flex justify-between rounded-lg p-1 bg-muted/60 border shadow-sm"
      >
        <ToggleGroupItem 
          value="personal" 
          className={cn(
            "flex-1 gap-1.5 h-8 data-[state=on]:bg-background data-[state=on]:shadow",
            mode === "personal" ? "text-sightx-purple font-medium" : "text-muted-foreground"
          )}
        >
          <User className="h-3.5 w-3.5" />
          <span className="text-xs">Pessoal</span>
        </ToggleGroupItem>
        
        <ToggleGroupItem 
          value="business" 
          className={cn(
            "flex-1 gap-1.5 h-8 data-[state=on]:bg-background data-[state=on]:shadow",
            mode === "business" ? "text-sightx-green font-medium" : "text-muted-foreground"
          )}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span className="text-xs">Empresarial</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export const ModeIndicator: React.FC = () => {
  const { mode } = useMode();
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-7 w-7 rounded-full",
            mode === "business" ? "text-sightx-green hover:text-sightx-green/90 hover:bg-sightx-green/10" 
                                : "text-sightx-purple hover:text-sightx-purple/90 hover:bg-sightx-purple/10"
          )}
        >
          {mode === "business" ? (
            <Briefcase className="h-4 w-4" />
          ) : (
            <User className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Modo {mode === "business" ? "Empresarial" : "Pessoal"}</p>
      </TooltipContent>
    </Tooltip>
  );
};
