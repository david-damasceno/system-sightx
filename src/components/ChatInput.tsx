
import { useState, FormEvent } from "react";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

const ChatInput = ({ onSendMessage, isProcessing }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !isProcessing) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="p-4 border-t glass-panel bg-opacity-30"
    >
      <div className="relative flex items-end">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva sua mensagem..."
          className="pr-12 resize-none min-h-[60px]"
          disabled={isProcessing}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute bottom-2 right-2 bg-sightx-purple hover:bg-sightx-purple-light"
          disabled={!message.trim() || isProcessing}
        >
          <SendHorizonal className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
