import { useState, useRef, useEffect, FormEvent } from "react";
import { SendHorizonal, Paperclip, Mic, Search, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import FilePreview from "./FilePreview";
import VoiceRecorder from "./VoiceRecorder";
import useChat from "../hooks/useChat";
interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  isProcessing: boolean;
  onOpenSearch: () => void;
  messages: any[];
}
const ChatInput = ({
  onSendMessage,
  isProcessing,
  onOpenSearch,
  messages
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [originalMessage, setOriginalMessage] = useState("");
  const [isImproved, setIsImproved] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [focused, setFocused] = useState(false);
  const [improvingMessage, setImprovingMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    improveMessage: improveMessageAPI
  } = useChat();
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + "px";
    }
  }, [message]);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((message.trim() || selectedFile) && !isProcessing && !improvingMessage) {
      console.log("ChatInput: Enviando mensagem:", message);
      onSendMessage(message, selectedFile || undefined);
      setMessage("");
      setSelectedFile(null);
      setIsImproved(false);
      setOriginalMessage("");
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
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande! Máximo de 10MB permitido.");
        return;
      }
      setSelectedFile(file);
      toast.success(`Arquivo "${file.name}" selecionado`);
    }
  };
  const handleVoiceRecordingComplete = (audioBlob: Blob) => {
    const audioFile = new File([audioBlob], "mensagem_de_voz.webm", {
      type: "audio/webm"
    });
    setSelectedFile(audioFile);
    setShowVoiceRecorder(false);
    toast.success("Áudio gravado com sucesso!");
  };
  const improveMessage = async () => {
    if (!message.trim() || message.trim().length < 10) {
      toast.error("Digite uma mensagem com pelo menos 10 caracteres");
      return;
    }
    setImprovingMessage(true);
    setOriginalMessage(message);
    try {
      console.log("Melhorando mensagem:", message);
      const improvedText = await improveMessageAPI(message);
      if (improvedText && improvedText.trim() !== message.trim()) {
        setMessage(improvedText);
        setIsImproved(true);
        toast.success("Mensagem melhorada com IA!");
      } else {
        toast.info("A mensagem já está bem escrita!");
      }
    } catch (error) {
      console.error("Erro na melhoria:", error);
      toast.error("Erro ao melhorar mensagem. Tente novamente.");
    } finally {
      setImprovingMessage(false);
    }
  };
  const restoreOriginalMessage = () => {
    if (originalMessage) {
      setMessage(originalMessage);
      setIsImproved(false);
      toast.info("Restaurada mensagem original");
    }
  };
  const isDisabled = isProcessing || showVoiceRecorder || improvingMessage;
  return <div className="border-t glass-panel bg-opacity-30 shadow-lg py-[10px] flex flex-col">
      {showVoiceRecorder && <div className="px-[100px] mb-3">
          <VoiceRecorder onRecordingComplete={handleVoiceRecordingComplete} onCancel={() => setShowVoiceRecorder(false)} />
        </div>}

      {selectedFile && <div className="px-[100px] mb-2">
          <FilePreview file={selectedFile} onRemove={() => setSelectedFile(null)} />
        </div>}

      <form onSubmit={handleSubmit} className="p-4 flex items-center justify-between px-[200px] py-[10px]">
        <div className={cn("relative flex items-end rounded-xl overflow-hidden border transition-all flex-1", focused ? "ring-2 ring-sightx-purple" : "", isDisabled ? "opacity-50" : "")}>
          <Textarea ref={textareaRef} value={message} onChange={e => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder={isImproved ? "Mensagem melhorada com IA - pressione Enter para enviar" : "Escreva sua mensagem para análise de negócios..."} className={cn("pr-24 resize-none min-h-[56px] max-h-[200px] rounded-xl py-3.5 transition-all", isImproved && "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800")} disabled={isDisabled} rows={1} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
          <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1.5">
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-sightx-purple/10 transition-colors" onClick={() => fileInputRef.current?.click()} disabled={isDisabled}>
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
                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-sightx-purple/10 transition-colors" onClick={() => setShowVoiceRecorder(true)} disabled={isDisabled}>
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
                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-sightx-purple/10 transition-colors" onClick={onOpenSearch} disabled={isDisabled || messages.length <= 1}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Buscar na conversa</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {!isImproved && message.trim().length >= 10 ? <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-sightx-purple/10 transition-colors" onClick={improveMessage} disabled={isDisabled}>
                        {improvingMessage ? <span className="animate-spin h-4 w-4 border-2 border-sightx-purple border-t-transparent rounded-full" /> : <Sparkles className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Melhorar com IA</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider> : isImproved ? <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-sightx-purple/10 transition-colors" onClick={restoreOriginalMessage} disabled={isDisabled}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Restaurar texto original</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider> : null}
            </div>
            
            <Button type="submit" size="icon" className={cn("rounded-full h-8 w-8 transition-all", !isDisabled && (message.trim() || selectedFile) ? "bg-sightx-purple hover:bg-sightx-purple-light" : "bg-muted text-muted-foreground")} disabled={!message.trim() && !selectedFile || isDisabled}>
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.csv" />
        </div>
        
        <div className="mt-2 absolute bottom-1 left-[100px] flex justify-between items-center text-xs text-muted-foreground">
          <div>
            
          </div>
          <div className="flex gap-2">
            {isProcessing && <span className="animate-pulse">Processando...</span>}
            {improvingMessage && <span className="animate-pulse text-sightx-purple">Melhorando com IA...</span>}
            {isImproved && !improvingMessage && <span className="flex items-center gap-1 px-[100px] text-black">
                <Sparkles className="h-3 w-3" />
                Melhorado com IA
              </span>}
          </div>
        </div>
      </form>
    </div>;
};
export default ChatInput;