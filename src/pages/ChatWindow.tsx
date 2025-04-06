
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import useChat from "../hooks/useChat";
import { Loader2, Info, MessageCircle, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useContextMode } from "@/hooks/use-context-mode";
import SightXLogo from "@/components/SightXLogo";
import ContextModeToggle from "@/components/ContextModeToggle";

const ChatWindow = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { messages, sendMessage, isProcessing, aiTyping } = useChat(id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const { contextMode } = useContextMode();

  // Send message handler
  const handleSendMessage = (content: string, file?: File) => {
    sendMessage(content, file);
    setAutoScroll(true);
  };

  // Handle scroll events
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 10;
    
    setAutoScroll(isAtBottom);
    setHasScrolled(true);
    setShowScrollToBottom(!isAtBottom);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, aiTyping.partialMessage, autoScroll]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setAutoScroll(true);
    setShowScrollToBottom(false);
  };

  return (
    <div className={cn("flex flex-col h-screen", contextMode === 'business' && "context-business")}>
      {/* Chat header */}
      <div className="border-b p-4 flex items-center justify-between bg-background/95 dark:bg-sightx-dark/95 backdrop-blur-lg shadow-sm z-10">
        <div className="flex items-center">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-lg animate-pulse-subtle",
            contextMode === 'business' ? "bg-blue-600" : "bg-sightx-purple"
          )}>
            <SightXLogo size="sm" colorClass="text-white" />
          </div>
          <div>
            <h2 className="font-medium text-lg">SightX Assistant</h2>
            <p className="text-xs text-muted-foreground">
              {contextMode === 'business' 
                ? "Modo Empresarial - Análises e relatórios" 
                : "Modo Pessoal - Assistente pessoal"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <ContextModeToggle variant="small" />
          
          {isProcessing && (
            <span className={cn(
              "text-xs text-muted-foreground animate-pulse flex items-center px-3 py-1 rounded-full",
              contextMode === 'business' ? "bg-blue-600/10" : "bg-sightx-purple/10"
            )}>
              <span className={cn(
                "w-2 h-2 rounded-full mr-2",
                contextMode === 'business' ? "bg-blue-600" : "bg-sightx-purple"
              )}></span>
              Processando
            </span>
          )}
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sobre o SightX</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Chat messages area */}
      <div 
        className="flex-1 overflow-y-auto p-4 pt-6 space-y-6"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg",
              contextMode === 'business'
                ? "bg-gradient-radial from-blue-600/20 to-blue-600/5"
                : "bg-gradient-radial from-sightx-purple/20 to-sightx-purple/5"
            )}>
              <SightXLogo size="lg" colorClass={contextMode === 'business' ? "text-blue-600" : "text-sightx-purple"} />
            </div>
            <h2 className={cn(
              "text-2xl font-semibold mb-3",
              contextMode === 'business' ? "text-blue-600" : "text-sightx-purple"
            )}>
              {contextMode === 'business' ? "SightX Empresarial" : "Bem-vindo ao SightX"}
            </h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {contextMode === 'business'
                ? "Assistente especializado em análises de negócios, documentos corporativos e relatórios."
                : "Comece a conversar com o SightX para obter respostas inteligentes e análises detalhadas para suas perguntas."
              }
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full mt-4">
              {[
                {
                  icon: MessageCircle,
                  title: "Converse naturalmente",
                  description: "Faça perguntas como se estivesse conversando com uma pessoa."
                },
                {
                  icon: FileText,
                  title: "Anexe documentos",
                  description: "Envie documentos para análise e receberá insights detalhados."
                },
                {
                  icon: ImageIcon,
                  title: "Anexe imagens",
                  description: "Compartilhe imagens para obter descrições e análises visuais."
                }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-4 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow hover-scale",
                    contextMode === 'business' ? "hover-scale hover:shadow-blue-600/10" : "hover:shadow-sightx-purple/10"
                  )}
                >
                  <div className={cn(
                    "mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-3",
                    contextMode === 'business' ? "bg-blue-600/10" : "bg-sightx-purple/10"
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5",
                      contextMode === 'business' ? "text-blue-600" : "text-sightx-purple"
                    )} />
                  </div>
                  <h3 className="font-medium text-base mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            // Check if this is the last AI message and is currently being typed
            const isTyping = message.isAI && 
                             index === messages.length - 1 && 
                             aiTyping.isTyping;
            
            return (
              <ChatMessage
                key={message.id}
                message={message}
                userAvatar={user?.avatar}
                typing={isTyping ? {
                  isActive: true,
                  partialContent: aiTyping.partialMessage
                } : undefined}
              />
            );
          })
        )}
        
        {/* AI is typing indicator */}
        {isProcessing && !aiTyping.isTyping && (
          <div className="flex items-center gap-2 animate-pulse ml-10 opacity-80">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              contextMode === 'business' ? "bg-blue-600" : "bg-sightx-purple"
            )}>
              <SightXLogo size="sm" colorClass="text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                contextMode === 'business' ? "bg-blue-600" : "bg-sightx-purple"
              )}></div>
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse delay-150",
                contextMode === 'business' ? "bg-blue-600" : "bg-sightx-purple"
              )}></div>
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse delay-300",
                contextMode === 'business' ? "bg-blue-600" : "bg-sightx-purple"
              )}></div>
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Scroll to bottom button */}
      <div className={cn(
        "absolute bottom-24 right-6 transition-opacity duration-300",
        showScrollToBottom ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <Button
          size="icon"
          className={cn(
            "rounded-full h-10 w-10 shadow-lg",
            contextMode === 'business' 
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-sightx-purple hover:bg-sightx-purple-light"
          )}
          onClick={scrollToBottom}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Chat input */}
      <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
    </div>
  );
};

export default ChatWindow;
