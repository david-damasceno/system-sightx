
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import useChat from "../hooks/useChat";
import { Loader2 } from "lucide-react";

const ChatWindow = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { messages, sendMessage, isProcessing } = useChat(id);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Send message handler that accepts a file
  const handleSendMessage = (content: string, file?: File) => {
    sendMessage(content, file);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* Chat header */}
      <div className="border-b p-4 flex items-center justify-between bg-white/50 dark:bg-sightx-dark/50 backdrop-blur-sm">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-sightx-purple flex items-center justify-center mr-3">
            <img 
              src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" 
              alt="SightX Logo" 
              className="h-5 w-5" 
            />
          </div>
          <h2 className="font-medium">Conversa com SightX</h2>
        </div>
        {isProcessing && (
          <span className="text-xs text-muted-foreground animate-pulse flex items-center">
            <span className="bg-sightx-purple/30 w-2 h-2 rounded-full mr-2"></span>
            Processando...
          </span>
        )}
      </div>
      
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-sightx-purple/10 flex items-center justify-center mb-4">
              <img 
                src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" 
                alt="SightX Logo" 
                className="h-10 w-10" 
              />
            </div>
            <h2 className="text-xl font-medium text-sightx-purple mb-2">Bem-vindo ao SightX</h2>
            <p className="text-muted-foreground max-w-md">
              Comece a conversar com o SightX para obter respostas inteligentes para suas perguntas. 
              Você pode anexar arquivos e receber análises detalhadas.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              userAvatar={user?.avatar}
            />
          ))
        )}
        
        {/* AI is typing indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2 animate-pulse ml-10">
            <div className="w-8 h-8 rounded-full bg-sightx-purple flex items-center justify-center">
              <img 
                src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" 
                alt="SightX Logo" 
                className="h-5 w-5" 
              />
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-sightx-purple animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-sightx-purple animate-pulse delay-150"></div>
              <div className="w-2 h-2 rounded-full bg-sightx-purple animate-pulse delay-300"></div>
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
    </div>
  );
};

export default ChatWindow;
