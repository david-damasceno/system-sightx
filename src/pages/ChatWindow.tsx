
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            userAvatar={user?.avatar}
          />
        ))}
        
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
      <ChatInput onSendMessage={sendMessage} isProcessing={isProcessing} />
    </div>
  );
};

export default ChatWindow;
