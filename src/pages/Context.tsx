
import { useState } from "react";
import { 
  Bookmark, Lightbulb, Rocket, 
  Plus, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Contextos padrão simplificados
const defaultContexts = [
  {
    id: "1",
    title: "Assistente Geral",
    description: "Auxilia em tarefas diversas e conversas gerais",
    content: "Você é um assistente inteligente e prestativo que pode me ajudar com diversas tarefas, responder perguntas e manter conversas naturais e informativas."
  },
  {
    id: "2",
    title: "Análise de Dados",
    description: "Especializado em análise e interpretação de dados",
    content: "Você é um especialista em análise de dados. Me ajude a compreender dados, criar insights, interpretar estatísticas e gerar relatórios claros e acionáveis."
  },
  {
    id: "3",
    title: "Escrita e Comunicação",
    description: "Auxilia na criação e melhoria de textos",
    content: "Atue como um especialista em comunicação e escrita. Me ajude a criar, revisar e melhorar textos de diversos tipos, sempre com linguagem clara e adequada ao contexto."
  }
];

interface ContextItemProps {
  id: string;
  title: string;
  description: string;
  content: string;
  isActive?: boolean;
  onActivate: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ContextItem = ({ 
  id, title, description, content, isActive, onActivate, onEdit, onDelete 
}: ContextItemProps) => {
  return (
    <Card className={cn(
      "transition-all hover:shadow-md border",
      isActive 
        ? "border-sightx-purple shadow-sightx-purple/10"
        : "hover:border-muted-foreground/20"
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {isActive && (
            <Badge variant="default" className="ml-auto bg-sightx-purple">
              <Check className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 italic">
          "{content}"
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(id)}
          >
            Editar
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
            onClick={() => onDelete(id)}
          >
            Excluir
          </Button>
        </div>
        {!isActive && (
          <Button 
            size="sm" 
            className="bg-sightx-purple hover:bg-sightx-purple/90"
            onClick={() => onActivate(id)}
          >
            Ativar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

interface NewContextDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (context: { title: string; description: string; content: string }) => void;
  editingContext?: {
    id: string;
    title: string;
    description: string;
    content: string;
  } | null;
}

const NewContextDialog = ({ isOpen, onClose, onSave, editingContext }: NewContextDialogProps) => {
  const [title, setTitle] = useState(editingContext?.title || "");
  const [description, setDescription] = useState(editingContext?.description || "");
  const [content, setContent] = useState(editingContext?.content || "");
  
  const handleSave = () => {
    if (!title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    
    if (!content.trim()) {
      toast.error("O conteúdo do contexto é obrigatório");
      return;
    }
    
    onSave({ title, description, content });
    
    // Limpar campos
    setTitle("");
    setDescription("");
    setContent("");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingContext ? "Editar Contexto" : "Novo Contexto"}
          </DialogTitle>
          <DialogDescription>
            Crie um novo contexto para orientar suas conversas com o assistente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              Título
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Análise de Dados"
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descrição
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Uma breve descrição do contexto"
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="content" className="text-sm font-medium">
              Conteúdo do Contexto
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descreva detalhadamente como o assistente deve se comportar..."
              className="min-h-[120px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button 
            className="bg-sightx-purple hover:bg-sightx-purple/90"
            onClick={handleSave}
          >
            {editingContext ? "Atualizar" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Context = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContext, setEditingContext] = useState<{
    id: string;
    title: string;
    description: string;
    content: string;
  } | null>(null);
  
  // Estado para campos da empresa
  const [companyInfo, setCompanyInfo] = useState(() => {
    const saved = localStorage.getItem("sightx-company-info");
    return saved ? JSON.parse(saved) : {
      mission: "",
      vision: "",
      values: ""
    };
  });
  
  // Estado para armazenar contextos, inicializados com os padrões
  const [contexts, setContexts] = useState(() => {
    const saved = localStorage.getItem("sightx-contexts");
    return saved ? JSON.parse(saved) : defaultContexts;
  });
  
  // Estado para rastrear qual contexto está ativo
  const [activeContextId, setActiveContextId] = useState(() => {
    return localStorage.getItem("sightx-active-context") || null;
  });
  
  // Funções para gerenciar contextos
  const handleActivateContext = (id: string) => {
    setActiveContextId(id);
    localStorage.setItem("sightx-active-context", id);
    toast.success("Contexto ativado com sucesso!");
  };
  
  const handleAddContext = (contextData: { title: string; description: string; content: string }) => {
    const newContext = {
      id: Date.now().toString(),
      ...contextData
    };
    
    const updatedContexts = [...contexts, newContext];
    setContexts(updatedContexts);
    localStorage.setItem("sightx-contexts", JSON.stringify(updatedContexts));
    
    setIsAddDialogOpen(false);
    toast.success("Contexto adicionado com sucesso!");
  };
  
  const handleEditContext = (id: string) => {
    const context = contexts.find(ctx => ctx.id === id);
    if (context) {
      setEditingContext(context);
      setIsAddDialogOpen(true);
    }
  };
  
  const handleUpdateContext = (contextData: { title: string; description: string; content: string }) => {
    if (!editingContext) return;
    
    const updatedContext = {
      ...editingContext,
      ...contextData
    };
    
    const updatedContexts = contexts.map(ctx => 
      ctx.id === editingContext.id ? updatedContext : ctx
    );
    setContexts(updatedContexts);
    localStorage.setItem("sightx-contexts", JSON.stringify(updatedContexts));
    
    setEditingContext(null);
    setIsAddDialogOpen(false);
    toast.success("Contexto atualizado com sucesso!");
  };
  
  const handleDeleteContext = (id: string) => {
    // Verificar se é o contexto ativo
    if (activeContextId === id) {
      setActiveContextId(null);
      localStorage.removeItem("sightx-active-context");
    }
    
    // Remover contexto
    const updatedContexts = contexts.filter(ctx => ctx.id !== id);
    setContexts(updatedContexts);
    localStorage.setItem("sightx-contexts", JSON.stringify(updatedContexts));
    
    toast.success("Contexto excluído com sucesso!");
  };
  
  const handleSaveContext = (contextData: { title: string; description: string; content: string }) => {
    if (editingContext) {
      handleUpdateContext(contextData);
    } else {
      handleAddContext(contextData);
    }
  };
  
  const handleSaveCompanyInfo = () => {
    localStorage.setItem("sightx-company-info", JSON.stringify(companyInfo));
    toast.success("Informações da empresa salvas com sucesso!");
  };
  
  const updateCompanyField = (field: string, value: string) => {
    setCompanyInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bookmark className="h-6 w-6 text-sightx-purple" />
          <h1 className="text-2xl font-bold">Contextos</h1>
        </div>
        
        <Button 
          onClick={() => {
            setEditingContext(null);
            setIsAddDialogOpen(true);
          }}
          className="flex items-center gap-2 bg-sightx-purple hover:bg-sightx-purple/90"
        >
          <Plus className="h-4 w-4" />
          Novo Contexto
        </Button>
      </div>
      
      {/* Nova seção para informações da empresa */}
      <div className="bg-card rounded-lg p-5 border shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Bookmark className="h-5 w-5 text-sightx-purple" />
          <h2 className="text-lg font-medium">Informações da Empresa</h2>
        </div>
        
        <p className="text-muted-foreground mb-6">
          Defina a missão, visão e valores da sua empresa. Essas informações serão usadas 
          como contexto adicional para melhorar as respostas do assistente.
        </p>
        
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="mission" className="text-sm font-medium">
              Missão da Empresa
            </Label>
            <Textarea
              id="mission"
              value={companyInfo.mission}
              onChange={(e) => updateCompanyField("mission", e.target.value)}
              placeholder="Descreva a missão da sua empresa..."
              className="min-h-[80px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vision" className="text-sm font-medium">
              Visão da Empresa
            </Label>
            <Textarea
              id="vision"
              value={companyInfo.vision}
              onChange={(e) => updateCompanyField("vision", e.target.value)}
              placeholder="Descreva a visão da sua empresa..."
              className="min-h-[80px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="values" className="text-sm font-medium">
              Valores da Empresa
            </Label>
            <Textarea
              id="values"
              value={companyInfo.values}
              onChange={(e) => updateCompanyField("values", e.target.value)}
              placeholder="Liste os valores da sua empresa..."
              className="min-h-[80px]"
            />
          </div>
          
          <Button 
            onClick={handleSaveCompanyInfo}
            className="bg-sightx-purple hover:bg-sightx-purple/90 w-fit"
          >
            Salvar Informações da Empresa
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Bookmark className="h-5 w-5 text-sightx-purple" />
          <h2 className="text-xl font-medium">Sobre os Contextos</h2>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Os contextos definem como o SightX deve se comportar durante suas conversas. 
          Eles ajudam a personalizar a experiência conforme suas necessidades específicas.
        </p>
        
        <div className="flex flex-col gap-3 p-3 bg-muted/40 rounded-md">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Como funciona:</h3>
              <p className="text-sm text-muted-foreground">
                Cada contexto contém instruções detalhadas sobre como o assistente deve responder. 
                Você pode ativar apenas um contexto por vez.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Rocket className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Dica:</h3>
              <p className="text-sm text-muted-foreground">
                Crie contextos específicos para diferentes projetos ou áreas de interesse. 
                Quanto mais detalhado for o contexto, melhores serão as respostas.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Bookmark className="h-5 w-5 text-sightx-purple" />
          <h2 className="text-xl font-medium">Seus Contextos</h2>
        </div>
        
        {contexts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg border border-dashed">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-sightx-purple/10">
              <Bookmark className="h-8 w-8 text-sightx-purple" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhum contexto encontrado</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Você ainda não criou nenhum contexto. Crie um para personalizar suas interações com o assistente.
            </p>
            <Button 
              onClick={() => {
                setEditingContext(null);
                setIsAddDialogOpen(true);
              }}
              className="bg-sightx-purple hover:bg-sightx-purple/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Contexto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contexts.map(context => (
              <ContextItem 
                key={context.id}
                id={context.id}
                title={context.title}
                description={context.description}
                content={context.content}
                isActive={context.id === activeContextId}
                onActivate={handleActivateContext}
                onEdit={handleEditContext}
                onDelete={handleDeleteContext}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Dialog para adicionar/editar contexto */}
      <NewContextDialog 
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setEditingContext(null);
        }}
        onSave={handleSaveContext}
        editingContext={editingContext}
      />
    </div>
  );
};

export default Context;
