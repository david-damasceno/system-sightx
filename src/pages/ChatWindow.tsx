import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useMode } from "../contexts/ModeContext";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import MessageSearch from "../components/MessageSearch";
import useChat from "../hooks/useChat";
import { Loader2, Info, MessageCircle, FileText, Image as ImageIcon, Briefcase, User, Search, Download, Share2 } from "lucide-react";
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
  return <div className="flex flex-col h-screen">
      {/* Chat header */}
      <div className="border-b p-4 flex items-center justify-between bg-background/95 dark:bg-sightx-dark/95 backdrop-blur-lg shadow-sm z-10">
        <div className="flex items-center">
          <div className="py-0">
            <div className="flex items-center gap-2">
              <h2 className="font-medium text-lg">Donna</h2>
              <Badge variant={mode === "business" ? "business" : "personal"} className="text-xs flex items-center gap-1">
                {mode === "business" ? <>
                    <Briefcase className="h-3 w-3" />
                    <span>Empresarial</span>
                  </> : <>
                    <User className="h-3 w-3" />
                    <span>Pessoal</span>
                  </>}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Sua assistente pessoal e profissional!</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isProcessing && <span className="text-xs text-muted-foreground animate-pulse flex items-center bg-sightx-purple/10 px-3 py-1 rounded-full">
              <span className="bg-sightx-purple w-2 h-2 rounded-full mr-2"></span>
              Processando
            </span>}
          
          {messages.length > 1 && <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={() => setShowSearch(true)}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Buscar na conversa</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={exportChat}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exportar conversa</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={shareChat}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Compartilhar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>}
          
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
      
      {/* Search overlay */}
      {showSearch && <MessageSearch messages={messages} onSearchResult={handleSearchResult} onClose={() => setShowSearch(false)} />}
      
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 pt-6 space-y-6" ref={scrollContainerRef} onScroll={handleScroll}>
        {messages.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg", mode === "business" ? "bg-gradient-radial from-sightx-green/20 to-sightx-green/5" : "bg-gradient-radial from-sightx-purple/20 to-sightx-purple/5")}>
              <img src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" alt="SightX Logo" className="h-12 w-12 drop-shadow-md" />
            </div>
            <h2 className={cn("text-2xl font-semibold mb-3", mode === "business" ? "text-sightx-green" : "text-sightx-purple")}>
              Bem-vindo ao SightX
              {mode === "business" ? " (Modo Empresarial)" : " (Modo Pessoal)"}
            </h2>
            <p className="text-muted-foreground max-w-md mb-6">
              {mode === "business" ? "Converse no contexto empresarial para obter respostas focadas em negócios e análises profissionais." : "Comece a conversar com o SightX para obter respostas inteligentes e análises detalhadas para suas perguntas."}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full mt-4">
              {[{
            icon: MessageCircle,
            title: "Converse naturalmente",
            description: "Faça perguntas como se estivesse conversando com uma pessoa."
          }, {
            icon: FileText,
            title: "Anexe documentos",
            description: "Envie documentos para análise e receberá insights detalhados."
          }, {
            icon: ImageIcon,
            title: "Anexe imagens",
            description: "Compartilhe imagens para obter descrições e análises visuais."
          }].map((item, i) => <div key={i} className={cn("p-4 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow", mode === "business" ? "hover:border-sightx-green/30" : "hover:border-sightx-purple/30")}>
                  <div className={cn("mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-3", mode === "business" ? "bg-sightx-green/10" : "bg-sightx-purple/10")}>
                    <item.icon className={cn("h-5 w-5", mode === "business" ? "text-sightx-green" : "text-sightx-purple")} />
                  </div>
                  <h3 className="font-medium text-base mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>)}
            </div>
          </div> : messages.map((message, index) => {
        // Check if this is the last AI message and is currently being typed
        const isTyping = message.isAI && index === messages.length - 1 && aiTyping.isTyping;
        return <ChatMessage key={message.id} message={message} userAvatar={user?.avatar} typing={isTyping ? {
          isActive: true,
          partialContent: aiTyping.partialMessage
        } : undefined} isHighlighted={message.id === highlightedMessageId} />;
      })}
        
        {/* AI is typing indicator */}
        {isProcessing && !aiTyping.isTyping && <div className="flex items-center gap-2 animate-pulse ml-10 opacity-80">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", mode === "business" ? "bg-sightx-green" : "bg-sightx-purple")}>
              <img src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" alt="SightX Logo" className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", mode === "business" ? "bg-sightx-green" : "bg-sightx-purple")}></div>
              <div className={cn("w-2 h-2 rounded-full animate-pulse delay-150", mode === "business" ? "bg-sightx-green" : "bg-sightx-purple")}></div>
              <div className={cn("w-2 h-2 rounded-full animate-pulse delay-300", mode === "business" ? "bg-sightx-green" : "bg-sightx-purple")}></div>
            </div>
          </div>}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Scroll to bottom button */}
      <div className={cn("absolute bottom-24 right-6 transition-opacity duration-300", showScrollToBottom ? "opacity-100" : "opacity-0 pointer-events-none")}>
        <Button size="icon" className={cn("rounded-full h-10 w-10 shadow-lg", mode === "business" ? "bg-sightx-green hover:bg-sightx-green/90" : "bg-sightx-purple hover:bg-sightx-purple-light")} onClick={scrollToBottom}>
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Chat input */}
      <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} onOpenSearch={() => setShowSearch(true)} messages={messages} />
    </div>;
};
export default ChatWindow;