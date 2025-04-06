import { useState, FormEvent, useRef, useEffect } from "react";
import { SendHorizonal, Paperclip, X, Smile, Mic, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  isProcessing: boolean;
}
const ChatInput = ({
  onSendMessage,
  isProcessing
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + "px";
    }
  }, [message]);

  // Generate preview for image files
  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);

      // Clean up preview URL when component unmounts or file changes
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((message.trim() || selectedFile) && !isProcessing) {
      onSendMessage(message, selectedFile || undefined);
      setMessage("");
      setSelectedFile(null);
      setPreviewUrl(null);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "inherit";
      }
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e);
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
  return <form onSubmit={handleSubmit} className="p-4 border-t glass-panel bg-opacity-30 shadow-lg py-[10px] px-[100px]">
      {/* File preview */}
      {selectedFile && <div className={cn("mb-3 p-2 rounded-lg bg-muted/50 border border-border animate-fade-in", previewUrl ? "p-0 overflow-hidden" : "")}>
          {previewUrl ? <div className="relative group">
              <img src={previewUrl} alt={selectedFile.name} className="w-full max-h-40 object-contain rounded-lg" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button type="button" variant="destructive" size="icon" onClick={() => {
            setSelectedFile(null);
            setPreviewUrl(null);
          }} className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                <span className="text-xs bg-black/50 text-white px-2 py-1 rounded max-w-[80%] truncate">
                  {selectedFile.name}
                </span>
              </div>
            </div> : <div className="flex items-center gap-2">
              <div className="flex-1 truncate text-sm">
                {selectedFile.name}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedFile(null)} className="h-6 w-6 p-0 hover:bg-muted">
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>}
        </div>}

      {/* Input area */}
      <div className={cn("relative flex items-end rounded-xl overflow-hidden border transition-all", focused ? "ring-2 ring-sightx-purple" : "", isProcessing ? "opacity-50" : "")}>
        <Textarea ref={textareaRef} value={message} onChange={e => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Escreva sua mensagem..." className="pr-24 resize-none min-h-[56px] max-h-[200px] rounded-xl py-3.5 transition-all" disabled={isProcessing} rows={1} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{
        overflowY: "auto"
      }} />
        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-sightx-purple/10 transition-colors" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Anexar arquivo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button type="submit" size="icon" className={cn("rounded-full h-8 w-8 transition-all", !isProcessing && (message.trim() || selectedFile) ? "bg-sightx-purple hover:bg-sightx-purple-light" : "bg-muted text-muted-foreground")} disabled={!message.trim() && !selectedFile || isProcessing}>
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.csv" />
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
    </form>;
};
export default ChatInput;