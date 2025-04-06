
import { useState, useEffect } from "react";
import { useMode } from "../contexts/ModeContext";
import { 
  BarChart, FileText, Share2, Filter, Download, Trash2, 
  PieChart, TrendingUp, Calendar, Search, Plus, Tag, CheckCircle2, 
  AlertCircle, ChevronDown, Star, Clock, Check, CircleSlash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// Tipos para as análises
interface Analysis {
  id: string;
  title: string;
  description: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  status: "complete" | "pending" | "archived";
  favorite: boolean;
}

// Dados de exemplo para análises
const generateMockAnalyses = (): Analysis[] => {
  const businessAnalyses = [
    {
      id: "1",
      title: "Análise de Mercado Q1 2025",
      description: "Avaliação das tendências do mercado para o primeiro trimestre de 2025",
      content: "Esta análise aborda as principais tendências de mercado para o primeiro trimestre de 2025, incluindo crescimento de setores, oportunidades emergentes e riscos potenciais para investimentos.",
      createdAt: new Date(2025, 3, 1),
      updatedAt: new Date(2025, 3, 5),
      tags: ["mercado", "finanças", "tendências"],
      status: "complete" as const,
      favorite: true
    },
    {
      id: "2",
      title: "Relatório de Desempenho Financeiro",
      description: "Análise detalhada dos indicadores financeiros do último trimestre",
      content: "Este relatório apresenta uma análise completa dos indicadores financeiros da empresa no último trimestre, incluindo ROI, margem de lucro e comparativos com períodos anteriores.",
      createdAt: new Date(2025, 2, 15),
      updatedAt: new Date(2025, 2, 20),
      tags: ["finanças", "relatório", "desempenho"],
      status: "complete" as const,
      favorite: false
    },
    {
      id: "3",
      title: "Estudo de Viabilidade para Expansão",
      description: "Análise de viabilidade para expansão de operações em novos mercados",
      content: "Este estudo avalia a viabilidade de expandir as operações para três novos mercados, considerando fatores como demanda, concorrência, custos operacionais e potencial de retorno.",
      createdAt: new Date(2025, 1, 10),
      updatedAt: new Date(2025, 1, 12),
      tags: ["expansão", "estratégia", "mercado"],
      status: "pending" as const,
      favorite: true
    }
  ];

  const personalAnalyses = [
    {
      id: "1",
      title: "Análise de Hábitos de Leitura",
      description: "Estudo sobre meus padrões de leitura nos últimos 6 meses",
      content: "Esta análise examina meus hábitos de leitura ao longo dos últimos 6 meses, incluindo gêneros preferidos, tempo dedicado à leitura e insights sobre como melhorar minha rotina de leitura.",
      createdAt: new Date(2025, 3, 2),
      updatedAt: new Date(2025, 3, 4),
      tags: ["leitura", "hábitos", "desenvolvimento pessoal"],
      status: "complete" as const,
      favorite: true
    },
    {
      id: "2",
      title: "Planejamento de Viagem",
      description: "Análise de custos e roteiro para viagem de férias",
      content: "Este planejamento detalha os custos estimados, roteiro sugerido e considerações logísticas para uma viagem de férias de duas semanas, incluindo acomodações, transporte e atrações.",
      createdAt: new Date(2025, 2, 10),
      updatedAt: new Date(2025, 2, 11),
      tags: ["viagem", "planejamento", "férias"],
      status: "complete" as const,
      favorite: false
    },
    {
      id: "3",
      title: "Revisão de Metas Anuais",
      description: "Análise do progresso nas metas estabelecidas para o ano",
      content: "Esta revisão avalia o progresso nas cinco metas principais estabelecidas para este ano, identificando pontos fortes, áreas de melhoria e ajustes necessários para os próximos meses.",
      createdAt: new Date(2025, 1, 15),
      updatedAt: new Date(2025, 1, 20),
      tags: ["metas", "desenvolvimento pessoal", "planejamento"],
      status: "pending" as const,
      favorite: true
    }
  ];

  return localStorage.getItem("sightx-mode") === "business" ? businessAnalyses : personalAnalyses;
};

// Componente de filtro para as análises
const AnalysisFilter = ({ onFilterChange }: { onFilterChange: (filter: string) => void }) => {
  const { mode } = useMode();
  const [activeFilter, setActiveFilter] = useState("all");
  
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant={activeFilter === "all" ? "default" : "outline"} 
        size="sm"
        className={cn(
          activeFilter === "all" && (
            mode === "business" 
              ? "bg-sightx-green hover:bg-sightx-green/90" 
              : "bg-sightx-purple hover:bg-sightx-purple/90"
          )
        )}
        onClick={() => handleFilterChange("all")}
      >
        Todas
      </Button>
      <Button 
        variant={activeFilter === "favorites" ? "default" : "outline"} 
        size="sm"
        className={cn(
          activeFilter === "favorites" && (
            mode === "business" 
              ? "bg-sightx-green hover:bg-sightx-green/90" 
              : "bg-sightx-purple hover:bg-sightx-purple/90"
          )
        )}
        onClick={() => handleFilterChange("favorites")}
      >
        <Star className="h-4 w-4 mr-1" />
        Favoritas
      </Button>
      <Button 
        variant={activeFilter === "recent" ? "default" : "outline"} 
        size="sm"
        className={cn(
          activeFilter === "recent" && (
            mode === "business" 
              ? "bg-sightx-green hover:bg-sightx-green/90" 
              : "bg-sightx-purple hover:bg-sightx-purple/90"
          )
        )}
        onClick={() => handleFilterChange("recent")}
      >
        <Clock className="h-4 w-4 mr-1" />
        Recentes
      </Button>
      <Button 
        variant={activeFilter === "complete" ? "default" : "outline"} 
        size="sm"
        className={cn(
          activeFilter === "complete" && (
            mode === "business" 
              ? "bg-sightx-green hover:bg-sightx-green/90" 
              : "bg-sightx-purple hover:bg-sightx-purple/90"
          )
        )}
        onClick={() => handleFilterChange("complete")}
      >
        <CheckCircle2 className="h-4 w-4 mr-1" />
        Completas
      </Button>
      <Button 
        variant={activeFilter === "pending" ? "default" : "outline"} 
        size="sm"
        className={cn(
          activeFilter === "pending" && (
            mode === "business" 
              ? "bg-sightx-green hover:bg-sightx-green/90" 
              : "bg-sightx-purple hover:bg-sightx-purple/90"
          )
        )}
        onClick={() => handleFilterChange("pending")}
      >
        <AlertCircle className="h-4 w-4 mr-1" />
        Pendentes
      </Button>
      <Button 
        variant={activeFilter === "archived" ? "default" : "outline"} 
        size="sm"
        className={cn(
          activeFilter === "archived" && (
            mode === "business" 
              ? "bg-sightx-green hover:bg-sightx-green/90" 
              : "bg-sightx-purple hover:bg-sightx-purple/90"
          )
        )}
        onClick={() => handleFilterChange("archived")}
      >
        <CircleSlash className="h-4 w-4 mr-1" />
        Arquivadas
      </Button>
    </div>
  );
};

// Componente de card para análise
const AnalysisCard = ({ 
  analysis, 
  onToggleFavorite, 
  onDelete,
  onOpenAnalysis,
  onChangeStatus 
}: { 
  analysis: Analysis, 
  onToggleFavorite: (id: string) => void, 
  onDelete: (id: string) => void,
  onOpenAnalysis: (analysis: Analysis) => void,
  onChangeStatus: (id: string, status: "complete" | "pending" | "archived") => void
}) => {
  const { mode } = useMode();
  
  // Formatar data
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  };
  
  // Badge de status
  const getStatusBadge = () => {
    switch (analysis.status) {
      case 'complete':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
            <Check className="h-3 w-3 mr-1" />
            Completa
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="outline" className="bg-slate-500/10 text-slate-600 border-slate-200">
            <CircleSlash className="h-3 w-3 mr-1" />
            Arquivada
          </Badge>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card className={cn(
      "transition-all hover:shadow-md cursor-pointer group", 
      analysis.status === "archived" && "opacity-70",
      analysis.favorite && "ring-1 ring-amber-200 shadow-sm"
    )}
    onClick={() => onOpenAnalysis(analysis)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="group-hover:underline decoration-1 underline-offset-4 transition-all">{analysis.title}</CardTitle>
            <CardDescription>{analysis.description}</CardDescription>
          </div>
          <div>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 transition-colors",
                analysis.favorite ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground hover:text-amber-500"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(analysis.id);
              }}
            >
              <Star className="h-4 w-4" fill={analysis.favorite ? "currentColor" : "none"} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {analysis.content}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-3">
          {analysis.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(analysis.createdAt)}
          </span>
          {getStatusBadge()}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-white hover:bg-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(analysis.id);
            }}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm" className="ml-auto">
              Status
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onChangeStatus(analysis.id, "complete");
            }}>
              <Check className="h-4 w-4 mr-2" />
              Completa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onChangeStatus(analysis.id, "pending");
            }}>
              <Clock className="h-4 w-4 mr-2" />
              Pendente
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onChangeStatus(analysis.id, "archived");
            }}>
              <CircleSlash className="h-4 w-4 mr-2" />
              Arquivar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

// Dialog de detalhes da análise
interface AnalysisDetailDialogProps {
  analysis: Analysis | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (analysis: Analysis) => void;
  onDelete: (id: string) => void;
}

const AnalysisDetailDialog = ({ 
  analysis, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete 
}: AnalysisDetailDialogProps) => {
  const { mode } = useMode();
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState("");
  
  useEffect(() => {
    if (analysis) {
      setEditTitle(analysis.title);
      setEditDescription(analysis.description);
      setEditContent(analysis.content);
      setEditTags([...analysis.tags]);
    }
  }, [analysis]);
  
  const handleSave = () => {
    if (!analysis) return;
    
    const updatedAnalysis: Analysis = {
      ...analysis,
      title: editTitle,
      description: editDescription,
      content: editContent,
      tags: editTags,
      updatedAt: new Date()
    };
    
    onSave(updatedAnalysis);
    setIsEditing(false);
    toast.success("Análise atualizada com sucesso!");
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !editTags.includes(newTag.trim())) {
      setEditTags([...editTags, newTag.trim()]);
      setNewTag("");
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(tag => tag !== tagToRemove));
  };
  
  // Formatar data completa
  const formatFullDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (!analysis) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => {
      onClose();
      setIsEditing(false);
    }}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>
              {isEditing ? "Editar Análise" : "Detalhes da Análise"}
            </DialogTitle>
            {!isEditing && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className={cn(
                  mode === "business" ? "text-sightx-green" : "text-sightx-purple"
                )}
              >
                Editar
              </Button>
            )}
          </div>
          <DialogDescription>
            {isEditing 
              ? "Faça as alterações necessárias na análise." 
              : "Visualize os detalhes completos da análise."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Título
                </label>
                <Input
                  id="title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Título da análise"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Descrição
                </label>
                <Input
                  id="description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Breve descrição da análise"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Conteúdo
                </label>
                <Textarea
                  id="content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Conteúdo detalhado da análise"
                  className="min-h-[200px]"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {editTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="py-1 px-2">
                      {tag}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTag(tag)}
                        className="h-4 w-4 ml-1 hover:bg-transparent hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nova tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleAddTag}
                    variant="outline"
                    className={cn(
                      "whitespace-nowrap",
                      mode === "business" ? "text-sightx-green" : "text-sightx-purple"
                    )}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h2 className="text-xl font-medium mb-2">{analysis.title}</h2>
                <p className="text-muted-foreground mb-4">{analysis.description}</p>
                
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {analysis.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="space-y-1 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Criado em: {formatFullDate(analysis.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Atualizado em: {formatFullDate(analysis.updatedAt)}</span>
                  </div>
                </div>
                
                <Separator className="mb-4" />
                
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-line">{analysis.content}</p>
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
              <Button 
                className={cn(
                  mode === "business" 
                    ? "bg-sightx-green hover:bg-sightx-green/90" 
                    : "bg-sightx-purple hover:bg-sightx-purple/90"
                )}
                onClick={handleSave}
              >
                Salvar Alterações
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="destructive" 
                onClick={() => {
                  onDelete(analysis.id);
                  onClose();
                }}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                Fechar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Componente de formulário de nova análise
interface NewAnalysisFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (analysis: Omit<Analysis, "id" | "createdAt" | "updatedAt" | "status" | "favorite">) => void;
}

const NewAnalysisForm = ({ isOpen, onClose, onSave }: NewAnalysisFormProps) => {
  const { mode } = useMode();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  const handleSave = () => {
    if (!title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }
    
    if (!content.trim()) {
      toast.error("O conteúdo é obrigatório");
      return;
    }
    
    onSave({
      title,
      description,
      content,
      tags
    });
    
    // Limpar formulário
    setTitle("");
    setDescription("");
    setContent("");
    setTags([]);
    setNewTag("");
  };
  
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Análise</DialogTitle>
          <DialogDescription>
            Crie uma nova análise para salvar e compartilhar insights importantes.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Título
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da análise"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descrição
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição da análise"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Conteúdo
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Conteúdo detalhado da análise"
              className="min-h-[150px]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="py-1 px-2">
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTag(tag)}
                    className="h-4 w-4 ml-1 hover:bg-transparent hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Nova tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button 
                onClick={handleAddTag}
                variant="outline"
                className={cn(
                  "whitespace-nowrap",
                  mode === "business" ? "text-sightx-green" : "text-sightx-purple"
                )}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            className={cn(
              mode === "business" 
                ? "bg-sightx-green hover:bg-sightx-green/90" 
                : "bg-sightx-purple hover:bg-sightx-purple/90"
            )}
            onClick={handleSave}
          >
            Salvar Análise
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Componente principal para a página de análises
const Analysis = () => {
  const { mode } = useMode();
  const [analyses, setAnalyses] = useState<Analysis[]>(() => {
    const saved = localStorage.getItem(`sightx-analyses-${mode}`);
    return saved ? JSON.parse(saved) : generateMockAnalyses();
  });
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>(analyses);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isNewAnalysisOpen, setIsNewAnalysisOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Atualizar análises quando o modo mudar
  useEffect(() => {
    const saved = localStorage.getItem(`sightx-analyses-${mode}`);
    
    if (saved) {
      const parsed = JSON.parse(saved);
      setAnalyses(parsed.map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt)
      })));
    } else {
      setAnalyses(generateMockAnalyses());
    }
  }, [mode]);
  
  // Atualizar localStorage quando análises mudar
  useEffect(() => {
    localStorage.setItem(`sightx-analyses-${mode}`, JSON.stringify(analyses));
  }, [analyses, mode]);
  
  // Filtrar análises baseado na busca e filtro ativo
  useEffect(() => {
    let filtered = [...analyses];
    
    // Aplicar termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        analysis => 
          analysis.title.toLowerCase().includes(term) || 
          analysis.description.toLowerCase().includes(term) || 
          analysis.content.toLowerCase().includes(term) ||
          analysis.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Aplicar filtro
    switch (activeFilter) {
      case 'favorites':
        filtered = filtered.filter(a => a.favorite);
        break;
      case 'recent':
        filtered = filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        break;
      case 'complete':
        filtered = filtered.filter(a => a.status === 'complete');
        break;
      case 'pending':
        filtered = filtered.filter(a => a.status === 'pending');
        break;
      case 'archived':
        filtered = filtered.filter(a => a.status === 'archived');
        break;
      default:
        // 'all' - sem filtro adicional além da busca
        break;
    }
    
    setFilteredAnalyses(filtered);
  }, [analyses, searchTerm, activeFilter]);
  
  // Manipuladores de ações
  const handleToggleFavorite = (id: string) => {
    setAnalyses(prev => 
      prev.map(analysis => 
        analysis.id === id 
          ? { ...analysis, favorite: !analysis.favorite } 
          : analysis
      )
    );
    
    toast.success("Status de favorito atualizado");
  };
  
  const handleDelete = (id: string) => {
    setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
    toast.success("Análise excluída com sucesso");
  };
  
  const handleChangeStatus = (id: string, status: "complete" | "pending" | "archived") => {
    setAnalyses(prev => 
      prev.map(analysis => 
        analysis.id === id 
          ? { ...analysis, status, updatedAt: new Date() } 
          : analysis
      )
    );
    
    toast.success(`Status alterado para: ${
      status === "complete" ? "Completa" : 
      status === "pending" ? "Pendente" : 
      "Arquivada"
    }`);
  };
  
  const handleOpenAnalysis = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setIsDetailOpen(true);
  };
  
  const handleSaveAnalysis = (updatedAnalysis: Analysis) => {
    setAnalyses(prev => 
      prev.map(analysis => 
        analysis.id === updatedAnalysis.id 
          ? updatedAnalysis 
          : analysis
      )
    );
    setSelectedAnalysis(updatedAnalysis);
  };
  
  const handleCreateAnalysis = (newAnalysisData: Omit<Analysis, "id" | "createdAt" | "updatedAt" | "status" | "favorite">) => {
    const newAnalysis: Analysis = {
      id: Date.now().toString(),
      ...newAnalysisData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending",
      favorite: false
    };
    
    setAnalyses(prev => [newAnalysis, ...prev]);
    setIsNewAnalysisOpen(false);
    toast.success("Nova análise criada com sucesso");
  };
  
  // Exportar análises
  const handleExportAnalyses = () => {
    const dataStr = JSON.stringify(analyses, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `sightx-analises-${mode}-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Análises exportadas com sucesso");
  };
  
  return (
    <div className="container max-w-6xl py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            mode === "business" ? "bg-sightx-green/10" : "bg-sightx-purple/10"
          )}>
            <BarChart className={cn(
              "h-6 w-6",
              mode === "business" ? "text-sightx-green" : "text-sightx-purple"
            )} />
          </div>
          <h1 className="text-2xl font-bold">
            {mode === "business" ? "Análises Empresariais" : "Análises Pessoais"}
          </h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportAnalyses}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          
          <Button 
            className={cn(
              "flex items-center gap-2",
              mode === "business" 
                ? "bg-sightx-green hover:bg-sightx-green/90" 
                : "bg-sightx-purple hover:bg-sightx-purple/90"
            )}
            onClick={() => setIsNewAnalysisOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nova Análise
          </Button>
        </div>
      </div>
      
      {/* Visão geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Total de Análises
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analyses.filter(a => a.status !== "archived").length}
            </div>
            <p className="text-sm text-muted-foreground">
              {analyses.filter(a => a.status === "archived").length} arquivadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Análises Completas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analyses.filter(a => a.status === "complete").length}
            </div>
            <p className="text-sm text-muted-foreground">
              {Math.round((analyses.filter(a => a.status === "complete").length / analyses.length) * 100)}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Análises Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analyses.filter(a => {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return new Date(a.createdAt) > oneWeekAgo;
              }).length}
            </div>
            <p className="text-sm text-muted-foreground">
              Nos últimos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtros e busca */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-auto max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar análises..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <AnalysisFilter 
            onFilterChange={(filter) => setActiveFilter(filter)}
          />
        </div>
        
        <Separator />
      </div>
      
      {/* Lista de análises */}
      <div className="space-y-6">
        {filteredAnalyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-lg border border-dashed">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center mb-4",
              mode === "business" ? "bg-sightx-green/10" : "bg-sightx-purple/10"
            )}>
              <FileText className={cn(
                "h-8 w-8",
                mode === "business" ? "text-sightx-green" : "text-sightx-purple"
              )} />
            </div>
            <h3 className="text-lg font-medium mb-2">Nenhuma análise encontrada</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {searchTerm 
                ? "Nenhuma análise corresponde aos critérios de busca. Tente outros termos ou limpe o filtro."
                : "Você ainda não tem análises. Crie uma nova análise para começar a armazenar seus insights."
              }
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setActiveFilter("all");
                setIsNewAnalysisOpen(true);
              }}
              className={cn(
                mode === "business" 
                  ? "bg-sightx-green hover:bg-sightx-green/90" 
                  : "bg-sightx-purple hover:bg-sightx-purple/90"
              )}
            >
              <Plus className="h-4 w-4 mr-2" />
              {searchTerm ? "Limpar Filtros e Criar Nova" : "Criar Primeira Análise"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnalyses.map(analysis => (
              <AnalysisCard 
                key={analysis.id}
                analysis={analysis}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
                onOpenAnalysis={handleOpenAnalysis}
                onChangeStatus={handleChangeStatus}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Dialog de nova análise */}
      <NewAnalysisForm 
        isOpen={isNewAnalysisOpen}
        onClose={() => setIsNewAnalysisOpen(false)}
        onSave={handleCreateAnalysis}
      />
      
      {/* Dialog de detalhes da análise */}
      <AnalysisDetailDialog 
        analysis={selectedAnalysis}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onSave={handleSaveAnalysis}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Analysis;
