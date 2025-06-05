
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, RefreshCw } from "lucide-react";
import { useMessageImprovement } from "../hooks/useMessageImprovement";
import { toast } from "sonner";

interface MessageImprovementDialogProps {
  children: React.ReactNode;
  onImprovedMessage?: (improvedText: string) => void;
}

const MessageImprovementDialog = ({ children, onImprovedMessage }: MessageImprovementDialogProps) => {
  const [open, setOpen] = useState(false);
  const [originalText, setOriginalText] = useState("");
  const [improvedText, setImprovedText] = useState("");
  const [improvementType, setImprovementType] = useState("general");
  const { improveMessage, isImproving } = useMessageImprovement();

  const handleImprove = async () => {
    if (!originalText.trim()) {
      toast.error("Digite uma mensagem para melhorar");
      return;
    }

    const result = await improveMessage(originalText, improvementType);
    if (result) {
      setImprovedText(result);
    }
  };

  const handleUseImproved = () => {
    if (improvedText && onImprovedMessage) {
      onImprovedMessage(improvedText);
      setOpen(false);
      setOriginalText("");
      setImprovedText("");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Texto copiado!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sightx-purple" />
            Melhorar Mensagem com IA
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mensagem Original</label>
            <Textarea
              placeholder="Digite sua mensagem aqui..."
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Melhoria</label>
            <Select value={improvementType} onValueChange={setImprovementType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Geral</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="persuasive">Persuasivo</SelectItem>
                <SelectItem value="concise">Conciso</SelectItem>
                <SelectItem value="friendly">Amigável</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleImprove} 
            disabled={isImproving || !originalText.trim()}
            className="w-full"
          >
            {isImproving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Melhorando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Melhorar Texto
              </>
            )}
          </Button>

          {improvedText && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-600">Texto Melhorado</label>
              <Textarea
                value={improvedText}
                readOnly
                className="min-h-[120px] bg-green-50 border-green-200"
              />
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(improvedText)}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button 
                  size="sm"
                  onClick={handleUseImproved}
                  className="flex-1"
                >
                  Usar Esta Versão
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageImprovementDialog;
