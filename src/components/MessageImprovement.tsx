
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Sparkles, RefreshCw } from "lucide-react";
import { useMessageImprovement } from "../hooks/useMessageImprovement";
import { toast } from "sonner";

const MessageImprovement = () => {
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Texto copiado para a área de transferência!");
  };

  const useImprovedText = () => {
    setOriginalText(improvedText);
    setImprovedText("");
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Melhoria de Texto com IA</h1>
        <p className="text-muted-foreground">
          Transforme suas mensagens em comunicação profissional e eficaz
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sightx-purple" />
              Texto Original
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Digite sua mensagem aqui..."
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Texto Melhorado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="O texto melhorado aparecerá aqui..."
              value={improvedText}
              readOnly
              className="min-h-[200px] resize-none bg-green-50 border-green-200"
            />
            
            {improvedText && (
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
                  variant="outline" 
                  size="sm"
                  onClick={useImprovedText}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Usar como Base
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessageImprovement;
