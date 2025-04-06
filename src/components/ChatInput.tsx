
import { useState, useRef, useEffect } from "react";
import { SendHorizonal, Paperclip, X, Smile, Mic, Camera, Search, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import FilePreview from "./FilePreview";
import VoiceRecorder from "./VoiceRecorder";
import QuickSuggestions from "./QuickSuggestions";
import { useMode } from "../contexts/ModeContext";

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  isProcessing: boolean;
  onOpenSearch: () => void;
  messages: any[]; // Replace with actual Message type
}

const ChatInput = ({
  onSendMessage,
  isProcessing,
  onOpenSearch,
  messages
}: ChatInputProps) => {
  const { mode } = useMode();
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(messages.length === 0 || messages.length === 1);
  const [focused, setFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + "px";
    }
  }, [message]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((message.trim() || selectedFile) && !isProcessing) {
      onSendMessage(message, selectedFile || undefined);
      setMessage("");
      setSelectedFile(null);
      setShowSuggestions(false);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "inherit";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }

    // Add new line with Shift+Enter or Ctrl+Enter
    if (e.key === "Enter" && (e.shiftKey || e.ctrlKey)) {
      setMessage(prev => prev + "\n");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("Arquivo muito grande! Máximo de 10MB permitido.");
        return;
      }
      setSelectedFile(file);
      toast.success(`Arquivo "${file.name}" selecionado`);
    }
  };

  const handleVoiceRecordingComplete = (audioBlob: Blob) => {
    const audioFile = new File([audioBlob], "mensagem_de_voz.webm", { type: "audio/webm" });
    setSelectedFile(audioFile);
    setShowVoiceRecorder(false);
    toast.success("Áudio gravado com sucesso!");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="border-t glass-panel bg-opacity-30 shadow-lg py-[10px] flex flex-col">
      {/* Suggestions */}
      {showSuggestions && !showVoiceRecorder && !isProcessing && (
        <QuickSuggestions onSuggestionClick={handleSuggestionClick} />
      )}

      {/* Voice recorder */}
      {showVoiceRecorder && (
        <div className="px-[100px] mb-3">
          <VoiceRecorder 
            onRecordingComplete={handleVoiceRecordingComplete} 
            onCancel={() => setShowVoiceRecorder(false)} 
          />
        </div>
      )}

      {/* File preview */}
      {selectedFile && (
        <div className="px-[100px] mb-2">
          <FilePreview 
            file={selectedFile} 
            onRemove={() => setSelectedFile(null)} 
          />
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 px-[100px]">
        <div className={cn(
          "relative flex items-end rounded-xl overflow-hidden border transition-all", 
          focused ? "ring-2 ring-sightx-purple" : "", 
          isProcessing ? "opacity-50" : ""
        )}>
          <Textarea 
            ref={textareaRef} 
            value={message} 
            onChange={e => setMessage(e.target.value)} 
            onKeyDown={handleKeyDown} 
            placeholder="Escreva sua mensagem..." 
            className="pr-24 resize-none min-h-[56px] max-h-[200px] rounded-xl py-3.5 transition-all" 
            disabled={isProcessing || showVoiceRecorder} 
            rows={1} 
            onFocus={() => setFocused(true)} 
            onBlur={() => setFocused(false)} 
            style={{
              overflowY: "auto"
            }}
          />
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1.5">
            {/* Tools */}
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-full hover:bg-sightx-purple/10 transition-colors" 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={isProcessing || showVoiceRecorder}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Anexar arquivo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-full hover:bg-sightx-purple/10 transition-colors" 
                      onClick={() => setShowVoiceRecorder(true)} 
                      disabled={isProcessing || showVoiceRecorder}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mensagem de voz</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 rounded-full hover:bg-sightx-purple/10 transition-colors" 
                      onClick={onOpenSearch} 
                      disabled={isProcessing || messages.length <= 1}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Buscar na conversa</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {!showSuggestions && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 rounded-full hover:bg-sightx-purple/10 transition-colors" 
                        onClick={() => setShowSuggestions(true)}
                        disabled={isProcessing}
                      >
                        <Lightbulb className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sugestões</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            {/* Send button */}
            <Button 
              type="submit" 
              size="icon" 
              className={cn(
                "rounded-full h-8 w-8 transition-all", 
                !isProcessing && (message.trim() || selectedFile) ? 
                  "bg-sightx-purple hover:bg-sightx-purple-light" : 
                  "bg-muted text-muted-foreground"
              )} 
              disabled={!message.trim() && !selectedFile || isProcessing || showVoiceRecorder}
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.csv" 
          />
        </div>
        
        {/* Helper text */}
        <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground">
          <div>
            <span className="opacity-70">Shift + Enter para nova linha</span>
          </div>
          <div className="flex gap-2">
            {isProcessing && <span className="animate-pulse">Processando...</span>}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
