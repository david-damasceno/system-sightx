
import { Message } from "../types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { FileText, Image, Film, File, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import MessageReactions from "./MessageReactions";

interface ChatMessageProps {
  message: Message;
  userAvatar?: string;
  typing?: {
    isActive: boolean;
    partialContent?: string;
  };
  isHighlighted?: boolean;
}

const ChatMessage = ({ message, userAvatar, typing, isHighlighted }: ChatMessageProps) => {
  const isAI = message.isAI;
  const content = typing?.isActive ? typing.partialContent || "" : message.content;
  
  // Function to determine attachment icon
  const getAttachmentIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (type.startsWith("video/")) return <Film className="h-4 w-4" />;
    if (type.startsWith("text/")) return <FileText className="h-4 w-4" />;
    if (type.includes("pdf")) return <FileText className="h-4 w-4" />;
    if (type.includes("doc")) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };
  
  return (
    <div 
      id={`message-container-${message.id}`}
      className={cn(
        "flex items-start gap-3 group",
        isAI ? "mr-12" : "ml-12 flex-row-reverse",
        typing?.isActive ? "animate-pulse" : "animate-fade-in",
        isHighlighted && "bg-primary/5 py-2 -mx-4 px-4 rounded-lg"
      )}
    >
      <Avatar className={cn("transition-all duration-300", isAI ? "border-sightx-purple/20" : "border-sightx-green/20")}>
        {isAI ? (
          <>
            <AvatarImage src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" />
            <AvatarFallback className="bg-sightx-purple text-white">SX</AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-sightx-green text-black">U</AvatarFallback>
          </>
        )}
      </Avatar>
      
      <div 
        className={cn(
          "relative max-w-[85%] shadow-lg transition-all",
          isAI ? 
            "message-bubble-ai rounded-2xl rounded-tl-sm" : 
            "message-bubble-user rounded-2xl rounded-tr-sm",
          typing?.isActive && "animate-pulse"
        )}
      >
        {/* Message content */}
        <p id={`message-${message.id}`} className="whitespace-pre-wrap">{content}</p>
        
        {/* File attachment */}
        {message.attachment && (
          <div className={cn(
            "mt-3 p-2 rounded-md flex items-center gap-2",
            isAI ? "bg-white/10" : "bg-black/10" 
          )}>
            {message.attachment.type.startsWith("image/") ? (
              <div className="w-full">
                <img 
                  src={message.attachment.url} 
                  alt={message.attachment.name} 
                  className="rounded-md w-full max-h-48 object-contain"
                />
                <div className="flex justify-between items-center mt-1 px-1 text-xs">
                  <span>{message.attachment.name}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className={cn(
                            "h-6 w-6 p-0 rounded-full",
                            isAI ? "hover:bg-white/20" : "hover:bg-black/20"
                          )}
                          onClick={() => window.open(message.attachment?.url, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="sr-only">Abrir em nova aba</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Abrir em nova aba</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ) : message.attachment.type.startsWith("audio/") ? (
              <div className="w-full">
                <audio 
                  controls 
                  src={message.attachment.url} 
                  className="w-full h-12 rounded my-1"
                >
                  Seu navegador não suporta áudio.
                </audio>
                <div className="text-xs opacity-80">{message.attachment.name}</div>
              </div>
            ) : (
              <>
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white/20">
                  {getAttachmentIcon(message.attachment.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm">{message.attachment.name}</div>
                  <div className="text-xs opacity-70">{message.attachment.type.split('/')[1]?.toUpperCase()}</div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className={cn(
                    "h-8 w-8 p-0 rounded-full",
                    isAI ? "hover:bg-white/20" : "hover:bg-black/20"
                  )}
                  onClick={() => window.open(message.attachment.url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Abrir arquivo</span>
                </Button>
              </>
            )}
          </div>
        )}
        
        <time 
          className={cn(
            "text-xs absolute bottom-1 right-2 transition-opacity",
            isAI ? "opacity-60" : "opacity-70",
            "group-hover:opacity-100"
          )}
          dateTime={message.timestamp.toISOString()}
        >
          {format(message.timestamp, "HH:mm")}
        </time>
      </div>
      
      {/* Message reactions */}
      <MessageReactions messageId={message.id} isAI={isAI} />
    </div>
  );
};

export default ChatMessage;
