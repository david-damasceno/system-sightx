
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMode } from "../contexts/ModeContext";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import MessageSearch from "../components/MessageSearch";
import useChat from "../hooks/useChat";
import { Loader2, MessageCircle, FileText, Image as ImageIcon, Briefcase, User, Search, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ChatWindow = () => {
  const {
    id
  } = useParams();
  const {
    user
  } = useAuth();
  const {
    mode
  } = useMode();
  const {
    messages,
    sendMessage,
    isProcessing,
    aiTyping,
    chatSession
  } = useChat(id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // Send message handler
  const handleSendMessage = (content: string, file?: File) => {
    sendMessage(content, file);
    setAutoScroll(true);
  };

  // Handle scroll events
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const {
      scrollTop,
      scrollHeight,
      clientHeight
    } = scrollContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
    setAutoScroll(isAtBottom);
    setHasScrolled(true);
    setShowScrollToBottom(!isAtBottom);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth"
      });
    }
  }, [messages, aiTyping.partialMessage, autoScroll]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
    setAutoScroll(true);
    setShowScrollToBottom(false);
  };

  // Scroll to highlighted message
  useEffect(() => {
    if (highlightedMessageId) {
      const messageEl = document.getElementById(`message-container-${highlightedMessageId}`);
      if (messageEl) {
        messageEl.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }
  }, [highlightedMessageId]);

  // Handle search result
  const handleSearchResult = (messageId: string | null) => {
    setHighlightedMessageId(messageId);
  };

  // Export chat as text
  const exportChat = () => {
    const chatText = messages.map(message => {
      const sender = message.isAI ? "SightX" : "Você";
      const timestamp = message.timestamp.toLocaleString();
      return `[${timestamp}] ${sender}: ${message.content}`;
    }).join("\n\n");
    const blob = new Blob([chatText], {
      type: "text/plain"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = chatSession?.title ? `${chatSession.title}.txt` : "conversa-sightx.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Conversa exportada com sucesso!");
  };

  // Share chat
  const shareChat = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: chatSession?.title || "Conversa SightX",
          text: "Confira minha conversa com SightX!"
        });
      } catch (err) {
        toast.error("Erro ao compartilhar conversa");
      }
    } else {
      toast.info("Compartilhamento não suportado neste navegador");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Search overlay */}
      {showSearch && <MessageSearch messages={messages} onSearchResult={handleSearchResult} onClose={() => setShowSearch(false)} />}
      
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 pt-6 space-y-6" ref={scrollContainerRef} onScroll={handleScroll}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Comece uma nova conversa digitando abaixo</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isTyping = message.isAI && index === messages.length - 1 && aiTyping.isTyping;
            return <ChatMessage 
              key={message.id} 
              message={message} 
              userAvatar={user?.avatar} 
              typing={isTyping ? {
                isActive: true,
                partialContent: aiTyping.partialMessage
              } : undefined} 
              isHighlighted={message.id === highlightedMessageId} 
            />;
          })
        )}
        
        {/* AI is typing indicator */}
        {isProcessing && !aiTyping.isTyping && (
          <div className="flex items-center gap-2 animate-pulse ml-10 opacity-80">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-sightx-purple">
              <img src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" alt="SightX Logo" className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full animate-pulse bg-sightx-purple"></div>
              <div className="w-2 h-2 rounded-full animate-pulse delay-150 bg-sightx-purple"></div>
              <div className="w-2 h-2 rounded-full animate-pulse delay-300 bg-sightx-purple"></div>
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} onOpenSearch={() => setShowSearch(true)} messages={messages} />
    </div>
  );
};

export default ChatWindow;
