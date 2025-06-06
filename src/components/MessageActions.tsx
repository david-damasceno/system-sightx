
import { Button } from "@/components/ui/button";
import { Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import MessageFavoriteButton from "./MessageFavoriteButton";

interface MessageActionsProps {
  messageId: string;
  sessionId: string;
  isAI: boolean;
  isFavorite: boolean;
  onToggleFavorite: (messageId: string, sessionId: string) => Promise<boolean>;
  onReaction: (messageId: string, sessionId: string, reactionType: 'like' | 'dislike' | 'helpful' | 'not_helpful') => Promise<boolean>;
  getUserReaction: (messageId: string, reactionType: 'like' | 'dislike' | 'helpful' | 'not_helpful') => boolean;
}

const MessageActions = ({
  messageId,
  sessionId,
  isAI,
  isFavorite,
  onToggleFavorite,
  onReaction,
  getUserReaction
}: MessageActionsProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyContent = () => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      navigator.clipboard.writeText(messageElement.textContent || '')
        .then(() => {
          setCopied(true);
          toast.success("Conteúdo copiado");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          toast.error("Erro ao copiar conteúdo");
        });
    }
  };

  const handleReaction = (reactionType: 'like' | 'dislike' | 'helpful' | 'not_helpful') => {
    onReaction(messageId, sessionId, reactionType);
  };

  return (
    <div className="flex gap-1 mt-1">
      {/* Favoritos */}
      <MessageFavoriteButton
        messageId={messageId}
        sessionId={sessionId}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        isAI={isAI}
      />

      {/* Reações para mensagens da IA */}
      {isAI && (
        <>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                    "hover:bg-white/10",
                    getUserReaction(messageId, 'helpful') && "opacity-100 text-green-500"
                  )}
                  onClick={() => handleReaction('helpful')}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Útil</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                    "hover:bg-white/10",
                    getUserReaction(messageId, 'not_helpful') && "opacity-100 text-red-500"
                  )}
                  onClick={() => handleReaction('not_helpful')}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Não útil</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}

      {/* Copiar */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                isAI ? "hover:bg-white/10" : "hover:bg-black/10"
              )}
              onClick={handleCopyContent}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Copiar conteúdo</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default MessageActions;
