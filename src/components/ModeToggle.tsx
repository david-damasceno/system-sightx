
import React from "react";
import { useMode } from "../contexts/ModeContext";
import { Button } from "@/components/ui/button";
import { Briefcase, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const ModeToggle: React.FC = () => {
  const { mode, setMode } = useMode();

  return (
    <div className="px-3 mb-3">
      <p className="text-xs text-muted-foreground mb-2">Modo de contexto</p>
      <ToggleGroup 
        type="single" 
        value={mode}
        onValueChange={(value) => {
          if (value) setMode(value as "personal" | "business");
        }}
        className="flex justify-between border rounded-lg p-1 bg-muted/50"
      >
        <ToggleGroupItem 
          value="personal" 
          className={cn(
            "flex-1 gap-2 h-9 data-[state=on]:bg-background data-[state=on]:shadow-sm",
            mode === "personal" && "text-sightx-purple"
          )}
        >
          <User className="h-4 w-4" />
          <span className="text-xs">Pessoal</span>
        </ToggleGroupItem>
        
        <ToggleGroupItem 
          value="business" 
          className={cn(
            "flex-1 gap-2 h-9 data-[state=on]:bg-background data-[state=on]:shadow-sm",
            mode === "business" && "text-sightx-purple"
          )}
        >
          <Briefcase className="h-4 w-4" />
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
          className="h-7 w-7 rounded-full text-sightx-purple"
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
