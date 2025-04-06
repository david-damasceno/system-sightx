
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Wand2 } from "lucide-react";
import { useMode } from "../contexts/ModeContext";
import { cn } from "@/lib/utils";

interface QuickSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const generateSuggestions = (mode: "personal" | "business") => {
  if (mode === "business") {
    return [
      "Gere ideias para melhorar a produtividade da minha equipe.",
      "Analise estes dados de vendas do trimestre.",
      "Crie um resumo executivo para uma apresentação.",
      "Como otimizar nossa estratégia de marketing digital?",
      "Quais são as tendências de mercado para o próximo ano?"
    ];
  }
  
  return [
    "Me explique o conceito de inteligência artificial.",
    "Quais são os benefícios da meditação?",
    "Preciso de ajuda com uma receita para jantar.",
    "Me dê ideias para atividades de fim de semana.",
    "Escreva um e-mail para um amigo sobre uma viagem."
  ];
};

const QuickSuggestions = ({ onSuggestionClick }: QuickSuggestionsProps) => {
  const { mode } = useMode();
  const [suggestions] = useState(generateSuggestions(mode));
  const [animateOut, setAnimateOut] = useState<number | null>(null);

  const handleSuggestionClick = (index: number, suggestion: string) => {
    setAnimateOut(index);
    
    setTimeout(() => {
      onSuggestionClick(suggestion);
    }, 300);
  };

  return (
    <div className="px-[100px] py-3 flex flex-col gap-2">
      <div className="flex items-center gap-2 mb-1">
        <Wand2 className={cn(
          "h-4 w-4",
          mode === "business" ? "text-sightx-green" : "text-sightx-purple"
        )} />
        <span className="text-sm font-medium">Sugestões de perguntas</span>
      </div>
      
      <div className="flex flex-wrap gap-2 items-center">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className={cn(
              "bg-card/50 border-border/50 text-sm rounded-full py-1 px-3 h-auto transition-all",
              mode === "business" ? "hover:border-sightx-green/40" : "hover:border-sightx-purple/40",
              animateOut === index ? "opacity-0 scale-95 transform translate-y-2" : "opacity-100"
            )}
            onClick={() => handleSuggestionClick(index, suggestion)}
          >
            <MessageSquare className="h-3 w-3 mr-2" />
            {suggestion.length > 40 ? suggestion.substring(0, 40) + "..." : suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickSuggestions;
