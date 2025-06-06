
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MessageFavoriteButtonProps {
  messageId: string;
  sessionId: string;
  isFavorite: boolean;
  onToggleFavorite: (messageId: string, sessionId: string) => Promise<boolean>;
  isAI: boolean;
}

const MessageFavoriteButton = ({ 
  messageId, 
  sessionId, 
  isFavorite, 
  onToggleFavorite, 
  isAI 
}: MessageFavoriteButtonProps) => {
  const handleToggle = () => {
    onToggleFavorite(messageId, sessionId);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
              isAI ? "hover:bg-white/10" : "hover:bg-black/10",
              isFavorite && "opacity-100"
            )}
            onClick={handleToggle}
          >
            <Heart 
              className={cn(
                "h-3.5 w-3.5",
                isFavorite ? "fill-red-500 text-red-500" : ""
              )} 
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MessageFavoriteButton;
