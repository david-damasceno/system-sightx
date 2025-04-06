
import { Message } from "../types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface ChatMessageProps {
  message: Message;
  userAvatar?: string;
}

const ChatMessage = ({ message, userAvatar }: ChatMessageProps) => {
  const isAI = message.isAI;
  
  return (
    <div 
      className={cn(
        "flex items-start gap-3 group animate-fade-in",
        isAI ? "mr-12" : "ml-12 flex-row-reverse"
      )}
    >
      <Avatar>
        {isAI ? (
          <>
            <AvatarImage src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" />
            <AvatarFallback className="bg-sightx-purple text-white">AI</AvatarFallback>
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
          "relative max-w-[85%]",
          isAI ? "message-bubble-ai" : "message-bubble-user"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <time 
          className="text-xs opacity-70 absolute bottom-1 right-2"
          dateTime={message.timestamp.toISOString()}
        >
          {format(message.timestamp, "HH:mm")}
        </time>
      </div>
    </div>
  );
};

export default ChatMessage;
