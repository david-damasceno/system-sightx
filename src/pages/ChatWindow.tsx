
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
          <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-fade-in">
            <div className="w-full max-w-3xl mx-auto">
              {/* Logo e título */}
              <div className="relative mb-8">
                <div className="absolute inset-0 -z-10 bg-gradient-radial from-sightx-purple/20 via-sightx-purple/5 to-transparent blur-3xl opacity-70"></div>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto bg-gradient-to-br from-sightx-purple/30 to-sightx-purple/5 border border-sightx-purple/30">
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <img src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" alt="SightX Logo" className="h-10 w-10 drop-shadow-md animate-pulse-subtle" />
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-sightx-purple to-sightx-purple-light bg-clip-text text-transparent">
                  Bem-vindo ao SightX
                </h2>
                
                <div className="inline-flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full mb-4">
                  {mode === "business" ? (
                    <><Briefcase className="h-4 w-4 text-sightx-green" /> 
                    <span className="text-sm font-medium text-sightx-green">Modo Empresarial</span></>
                  ) : (
                    <><User className="h-4 w-4 text-sightx-purple" /> 
                    <span className="text-sm font-medium text-sightx-purple">Modo Pessoal</span></>
                  )}
                </div>
                
                <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                  {mode === "business" 
                    ? "Converse no contexto empresarial para obter respostas focadas em negócios, análises profissionais e insights estratégicos." 
                    : "Comece uma conversa inteligente e obtenha respostas detalhadas, análises personalizadas e assistência para qualquer assunto."}
                </p>
              </div>
              
              {/* Seção de recursos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {[
                  {
                    icon: MessageCircle,
                    title: "Conversas Naturais",
                    description: "Dialogue como se estivesse falando com uma pessoa. Faça perguntas complexas e receba respostas detalhadas.",
                    color: "from-sightx-purple/20 to-sightx-purple/5",
                    iconColor: "text-sightx-purple"
                  }, 
                  {
                    icon: FileText,
                    title: "Análise de Documentos",
                    description: "Envie documentos para extrair informações, resumir conteúdos e obter insights valiosos.",
                    color: mode === "business" ? "from-sightx-green/20 to-sightx-green/5" : "from-sightx-purple/20 to-sightx-purple/5",
                    iconColor: mode === "business" ? "text-sightx-green" : "text-sightx-purple"
                  }, 
                  {
                    icon: ImageIcon,
                    title: "Processamento de Imagens",
                    description: "Compartilhe imagens para identificação, descrição detalhada e análise visual avançada.",
                    color: "from-sightx-purple/20 to-sightx-purple/5",
                    iconColor: "text-sightx-purple"
                  }
                ].map((item, i) => (
                  <div key={i} className="group relative overflow-hidden">
                    <div className={`p-5 rounded-xl border bg-card transition-all duration-300 hover:shadow-md hover:shadow-${mode === "business" ? "sightx-green" : "sightx-purple"}/10 hover:border-${mode === "business" ? "sightx-green" : "sightx-purple"}/30`}>
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${item.color} opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                      <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-${mode === "business" ? "sightx-green" : "sightx-purple"}/10`}>
                        <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Dicas de uso */}
              <div className="bg-muted/40 border rounded-xl p-5 mb-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sightx-purple/20 flex items-center justify-center text-xs text-sightx-purple font-bold">?</span>
                  Como começar
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Digite uma pergunta completa para obter melhores respostas",
                    "Anexe arquivos para análise específica",
                    "Use o modo empresarial para consultas profissionais",
                    "Explore temas através de conversas continuadas"
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${mode === "business" ? "bg-sightx-green/20 text-sightx-green" : "bg-sightx-purple/20 text-sightx-purple"}`}>
                        <span className="text-xs font-bold">{i + 1}</span>
                      </div>
                      <span className="text-sm">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Botão iniciar */}
              <div className="flex justify-center">
                <Button 
                  className={`font-medium shadow-md ${mode === "business" ? "bg-sightx-green hover:bg-sightx-green/90" : "bg-sightx-purple hover:bg-sightx-purple-light"}`}
                  onClick={() => document.querySelector('textarea')?.focus()}
                >
                  Comece uma conversa agora
                </Button>
              </div>
            </div>
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
