
import { useState, FormEvent, useRef } from "react";
import { SendHorizonal, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  isProcessing: boolean;
}

const ChatInput = ({ onSendMessage, isProcessing }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if ((message.trim() || selectedFile) && !isProcessing) {
      onSendMessage(message, selectedFile || undefined);
      setMessage("");
      setSelectedFile(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("Arquivo muito grande! Máximo de 10MB permitido.");
        return;
      }
      
      setSelectedFile(file);
      toast.success(`Arquivo "${file.name}" selecionado`);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="p-4 border-t glass-panel bg-opacity-30"
    >
      {selectedFile && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-sightx-purple/10 rounded-md">
          <div className="text-sm text-foreground flex-1 truncate">
            {selectedFile.name}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFile(null)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      )}
      <div className="relative flex items-end">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva sua mensagem..."
          className="pr-24 resize-none min-h-[60px]"
          disabled={isProcessing}
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full hover:bg-sightx-purple/10"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Anexar arquivo</span>
          </Button>
          <Button
            type="submit"
            size="icon"
            className="rounded-full bg-sightx-purple hover:bg-sightx-purple-light h-8 w-8"
            disabled={(!message.trim() && !selectedFile) || isProcessing}
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    </form>
  );
};

export default ChatInput;
