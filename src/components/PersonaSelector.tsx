
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAIPersonas } from "../hooks/useAIPersonas";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

const PersonaSelector = () => {
  const { personas, currentPersona, selectPersona, isLoading } = useAIPersonas();

  if (isLoading || personas.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      <Avatar className="h-6 w-6">
        <AvatarFallback className="bg-sightx-purple text-white text-xs">
          <Bot className="h-3 w-3" />
        </AvatarFallback>
      </Avatar>
      
      <Select
        value={currentPersona?.id || ""}
        onValueChange={(value) => {
          const persona = personas.find(p => p.id === value);
          if (persona) selectPersona(persona);
        }}
      >
        <SelectTrigger className="h-7 border-none bg-transparent shadow-none">
          <SelectValue placeholder="Selecione uma persona" />
        </SelectTrigger>
        <SelectContent>
          {personas.map((persona) => (
            <SelectItem key={persona.id} value={persona.id}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{persona.name}</span>
                {persona.is_default && (
                  <span className="text-xs bg-sightx-purple/20 text-sightx-purple px-1 rounded">
                    Padrão
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {currentPersona?.description && (
        <div className="text-xs text-muted-foreground max-w-48 truncate">
          {currentPersona.description}
        </div>
      )}
    </div>
  );
};

export default PersonaSelector;
