
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, ThumbsUp, Smile, Lightbulb, Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface Reaction {
  icon: React.ReactNode;
  label: string;
  id: string;
}

const reactions: Reaction[] = [
  { icon: <ThumbsUp className="h-3.5 w-3.5" />, label: "Concordo", id: "thumbs-up" },
  { icon: <Heart className="h-3.5 w-3.5" />, label: "Adoro", id: "heart" },
  { icon: <Smile className="h-3.5 w-3.5" />, label: "Gostei", id: "smile" },
  { icon: <Lightbulb className="h-3.5 w-3.5" />, label: "Esclarecedor", id: "lightbulb" },
];

interface MessageReactionsProps {
  messageId: string;
  isAI: boolean;
}

const MessageReactions = ({ messageId, isAI }: MessageReactionsProps) => {
  const [showReactions, setShowReactions] = useState(false);
  const [activeReactions, setActiveReactions] = useState<Record<string, number>>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReact = (reactionId: string) => {
    if (userReaction === reactionId) {
      // Remove reaction
      setUserReaction(null);
      setActiveReactions({
        ...activeReactions,
        [reactionId]: (activeReactions[reactionId] || 0) - 1
      });
    } else {
      // Add new reaction
      if (userReaction) {
        // Remove previous reaction
        setActiveReactions({
          ...activeReactions,
          [userReaction]: (activeReactions[userReaction] || 0) - 1,
          [reactionId]: (activeReactions[reactionId] || 0) + 1
        });
      } else {
        // First reaction
        setActiveReactions({
          ...activeReactions,
          [reactionId]: (activeReactions[reactionId] || 0) + 1
        });
      }
      setUserReaction(reactionId);
    }
    
    setShowReactions(false);
  };

  const handleCopyContent = () => {
    // In a real app, this would get the message content from a message store
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      navigator.clipboard.writeText(messageElement.textContent || '')
        .then(() => {
          setCopied(true);
          toast.success("Conteúdo copiado para a área de transferência");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          toast.error("Erro ao copiar conteúdo");
        });
    }
  };

  return (
    <div className="relative">
      {/* Reaction button */}
      <div className="flex gap-1 mt-1">
        {Object.entries(activeReactions).filter(([_, count]) => count > 0).map(([reactionId, count]) => (
          <Button
            key={reactionId}
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 px-2 text-xs rounded-full flex gap-1 items-center",
              isAI ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20",
              userReaction === reactionId && isAI ? "text-white" : "",
              userReaction === reactionId && !isAI ? "text-black" : ""
            )}
            onClick={() => handleReact(reactionId)}
          >
            {reactions.find(r => r.id === reactionId)?.icon}
            {count}
          </Button>
        ))}

        <div className="flex gap-1">
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
                  onClick={() => setShowReactions(!showReactions)}
                >
                  <Smile className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Reagir</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isAI && (
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
          )}
        </div>
      </div>

      {/* Reaction selector */}
      {showReactions && (
        <div 
          className={cn(
            "absolute bottom-8 bg-card shadow-lg rounded-full p-1 flex gap-1 z-10 animate-fade-in",
            isAI ? "-left-2" : "-right-2"
          )}
        >
          {reactions.map((reaction) => (
            <TooltipProvider key={reaction.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:scale-110 transition-transform"
                    onClick={() => handleReact(reaction.id)}
                  >
                    {reaction.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{reaction.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageReactions;
