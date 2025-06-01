
import { useState } from "react";
import { 
  User, Bookmark, Lightbulb, Rocket, 
  PieChart, Plus, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Template contexts pré-definidos para o modo pessoal
const defaultPersonalContexts = [
  {
    id: "1",
    title: "Escrita Criativa",
    description: "Ajuda na criação de textos criativos e literários",
    content: "Você é um autor experiente que pode me auxiliar na criação de histórias, poemas e textos criativos com estilo literário sofisticado."
  },
  {
    id: "2",
    title: "Assistente de Estudo",
    description: "Auxilia em atividades acadêmicas e de estudo",
    content: "Atue como um tutor para me ajudar a entender conceitos complexos, revisar materiais de estudo e preparar resumos explicativos."
  },
  {
    id: "3",
    title: "Pesquisa Pessoal",
    description: "Aprofunda-se em tópicos de interesse pessoal",
    content: "Atue como um pesquisador que pode fornecer informações detalhadas e bem fundamentadas sobre meus tópicos de interesse pessoal."
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
            <Badge variant="personal" className="ml-auto">
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
            Crie um novo contexto pessoal para orientar suas conversas.
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

const ModeContext = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContext, setEditingContext] = useState<{
    id: string;
    title: string;
    description: string;
    content: string;
  } | null>(null);
  
  // Estado para armazenar contextos pessoais, inicializados com os padrões
  const [personalContexts, setPersonalContexts] = useState(() => {
    const saved = localStorage.getItem("sightx-personal-contexts");
    return saved ? JSON.parse(saved) : defaultPersonalContexts;
  });
  
  // Estado para rastrear qual contexto está ativo
  const [activePersonalContextId, setActivePersonalContextId] = useState(() => {
    return localStorage.getItem("sightx-active-personal-context") || null;
  });
  
  // Funções para gerenciar contextos
  const handleActivateContext = (id: string) => {
    setActivePersonalContextId(id);
    localStorage.setItem("sightx-active-personal-context", id);
    toast.success("Contexto ativado com sucesso!");
  };
  
  const handleAddContext = (contextData: { title: string; description: string; content: string }) => {
    const newContext = {
      id: Date.now().toString(),
      ...contextData
    };
    
    const updatedContexts = [...personalContexts, newContext];
    setPersonalContexts(updatedContexts);
    localStorage.setItem("sightx-personal-contexts", JSON.stringify(updatedContexts));
    
    setIsAddDialogOpen(false);
    toast.success("Contexto adicionado com sucesso!");
  };
  
  const handleEditContext = (id: string) => {
    const context = personalContexts.find(ctx => ctx.id === id);
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
    
    const updatedContexts = personalContexts.map(ctx => 
      ctx.id === editingContext.id ? updatedContext : ctx
    );
    setPersonalContexts(updatedContexts);
    localStorage.setItem("sightx-personal-contexts", JSON.stringify(updatedContexts));
    
    setEditingContext(null);
    setIsAddDialogOpen(false);
    toast.success("Contexto atualizado com sucesso!");
  };
  
  const handleDeleteContext = (id: string) => {
    // Verificar se é o contexto ativo
    if (activePersonalContextId === id) {
      setActivePersonalContextId(null);
      localStorage.removeItem("sightx-active-personal-context");
    }
    
    // Remover contexto
    const updatedContexts = personalContexts.filter(ctx => ctx.id !== id);
    setPersonalContexts(updatedContexts);
    localStorage.setItem("sightx-personal-contexts", JSON.stringify(updatedContexts));
    
    toast.success("Contexto excluído com sucesso!");
  };
  
  const handleSaveContext = (contextData: { title: string; description: string; content: string }) => {
    if (editingContext) {
      handleUpdateContext(contextData);
    } else {
      handleAddContext(contextData);
    }
  };
  
  return (
    <div className="container max-w-6xl py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-sightx-purple" />
          <h1 className="text-2xl font-bold">Contextos Pessoais</h1>
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
      
      <div className="bg-card rounded-lg p-5 border shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Bookmark className="h-5 w-5 text-sightx-purple" />
          <h2 className="text-lg font-medium">Sobre os Contextos</h2>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Os contextos pessoais definem como o SightX deve se comportar durante suas conversas. 
          Eles ajudam a personalizar a experiência conforme suas necessidades individuais.
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
          <User className="h-5 w-5 text-sightx-purple" />
          <h2 className="text-xl font-medium">Seus Contextos Pessoais</h2>
        </div>
        
        {personalContexts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg border border-dashed">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-sightx-purple/10">
              <Bookmark className="h-8 w-8 text-sightx-purple" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhum contexto encontrado</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Você ainda não criou nenhum contexto pessoal. Crie um para personalizar suas interações com o assistente.
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
            {personalContexts.map(context => (
              <ContextItem 
                key={context.id}
                id={context.id}
                title={context.title}
                description={context.description}
                content={context.content}
                isActive={context.id === activePersonalContextId}
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

export default ModeContext;
