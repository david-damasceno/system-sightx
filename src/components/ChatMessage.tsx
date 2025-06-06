import { Message } from "../types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { FileText, Image as ImageIcon, Film, File, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import MessageActions from "./MessageActions";
import MarkdownRenderer from "./MarkdownRenderer";
import { useMessageFavorites } from "../hooks/useMessageFavorites";
import { useMessageReactions } from "../hooks/useMessageReactions";
interface ChatMessageProps {
  message: Message;
  userAvatar?: string;
  typing?: {
    isActive: boolean;
    partialContent?: string;
  };
  isHighlighted?: boolean;
}
const ChatMessage = ({
  message,
  userAvatar,
  typing,
  isHighlighted
}: ChatMessageProps) => {
  const isAI = message.isAI;
  const content = typing?.isActive ? typing.partialContent || "" : message.content;
  const {
    toggleFavorite,
    isFavorite
  } = useMessageFavorites();
  const {
    addReaction,
    removeReaction,
    getUserReaction
  } = useMessageReactions();

  // Function to determine attachment icon
  const getAttachmentIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (type.startsWith("video/")) return <Film className="h-4 w-4" />;
    if (type.startsWith("text/")) return <FileText className="h-4 w-4" />;
    if (type.includes("pdf")) return <FileText className="h-4 w-4" />;
    if (type.includes("doc")) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };
  const handleReaction = async (messageId: string, sessionId: string, reactionType: 'like' | 'dislike' | 'helpful' | 'not_helpful'): Promise<boolean> => {
    const currentReaction = getUserReaction(messageId, reactionType);
    if (currentReaction) {
      return await removeReaction(messageId, reactionType);
    } else {
      return await addReaction(messageId, sessionId, reactionType);
    }
  };
  return;
};
export default ChatMessage;