
import { useState } from "react";
import { 
  BarChart3, Plus, Search, Filter, Share2, 
  Download, Eye, Star, Bookmark, 
  TrendingUp, Users, DollarSign, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Dashboard {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  isShared: boolean;
  isFavorite: boolean;
  author: string;
  tags: string[];
  thumbnail?: string;
}

const mockDashboards: Dashboard[] = [
  {
    id: "1",
    title: "Vendas por Região",
    description: "Análise detalhada de vendas segmentada por regiões geográficas",
    category: "Vendas",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    views: 245,
    isShared: true,
    isFavorite: true,
    author: "Você",
    tags: ["vendas", "regional", "geografia"]
  },
  {
    id: "2", 
    title: "Performance de Marketing",
    description: "Métricas de ROI e conversão das campanhas de marketing digital",
    category: "Marketing",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    views: 189,
    isShared: false,
    isFavorite: false,
    author: "Você",
    tags: ["marketing", "roi", "conversão"]
  },
  {
    id: "3",
    title: "Análise Financeira",
    description: "Dashboard executivo com indicadores financeiros principais",
    category: "Financeiro",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-22"),
    views: 312,
    isShared: true,
    isFavorite: true,
    author: "Você",
    tags: ["financeiro", "executivo", "kpis"]
  },
  {
    id: "4",
    title: "Satisfação do Cliente",
    description: "Métricas de NPS, CSAT e análise de feedback dos clientes",
    category: "Atendimento",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-19"),
    views: 156,
    isShared: false,
    isFavorite: false,
    author: "Você",
    tags: ["cliente", "nps", "satisfação"]
  },
  {
    id: "5",
    title: "Operações e Logística",
    description: "Monitoramento de entregas, estoque e eficiência operacional",
    category: "Operações",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-21"),
    views: 98,
    isShared: true,
    isFavorite: false,
    author: "Você",
    tags: ["operações", "logística", "estoque"]
  },
  {
    id: "6",
    title: "Recursos Humanos",
    description: "Análise de turnover, produtividade e engagement da equipe",
    category: "RH",
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-17"),
    views: 134,
    isShared: false,
    isFavorite: true,
    author: "Você",
    tags: ["rh", "turnover", "produtividade"]
  }
];

const categories = [
  "Todos",
  "Vendas",
  "Marketing", 
  "Financeiro",
  "Atendimento",
  "Operações",
  "RH"
];

const Analysis = () => {
  const [dashboards, setDashboards] = useState(mockDashboards);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updated");

  const filteredDashboards = dashboards
    .filter(dashboard => {
      const matchesCategory = selectedCategory === "Todos" || dashboard.category === selectedCategory;
      const matchesSearch = dashboard.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dashboard.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dashboard.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "views":
          return b.views - a.views;
        case "created":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default: // updated
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

  const toggleFavorite = (dashboardId: string) => {
    setDashboards(prev => prev.map(d => 
      d.id === dashboardId ? { ...d, isFavorite: !d.isFavorite } : d
    ));
    toast.success("Dashboard atualizado!");
  };

  const shareDashboard = (dashboard: Dashboard) => {
    setDashboards(prev => prev.map(d => 
      d.id === dashboard.id ? { ...d, isShared: !d.isShared } : d
    ));
    toast.success(dashboard.isShared ? "Dashboard privado" : "Dashboard compartilhado!");
  };

  const openDashboard = (dashboard: Dashboard) => {
    // Incrementar views
    setDashboards(prev => prev.map(d => 
      d.id === dashboard.id ? { ...d, views: d.views + 1 } : d
    ));
    toast.info(`Abrindo dashboard: ${dashboard.title}`);
    // Aqui seria a navegação para a página do dashboard
  };

  const exportDashboard = (dashboard: Dashboard) => {
    toast.success(`Exportando dashboard: ${dashboard.title}`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Vendas": return TrendingUp;
      case "Marketing": return Activity;
      case "Financeiro": return DollarSign;
      case "Atendimento": return Users;
      case "Operações": return BarChart3;
      case "RH": return Users;
      default: return BarChart3;
    }
  };

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-sightx-purple" />
          <h1 className="text-2xl font-bold">Análise de Negócios</h1>
        </div>
        
        <Button className="bg-sightx-purple hover:bg-sightx-purple/90">
          <Plus className="h-4 w-4 mr-2" />
          Criar Dashboard
        </Button>
      </div>

      {/* Informações */}
      <div className="bg-card rounded-lg p-6 border shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-5 w-5 text-sightx-purple" />
          <h2 className="text-lg font-medium">Central de Dashboards</h2>
        </div>
        
        <p className="text-muted-foreground mb-6">
          Crie, gerencie e compartilhe dashboards personalizados para análise de dados do seu negócio. 
          Transforme dados em insights acionáveis com visualizações poderosas.
        </p>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/40">
            <div className="font-semibold text-lg">{dashboards.length}</div>
            <div className="text-sm text-muted-foreground">Dashboards</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/40">
            <div className="font-semibold text-lg">{dashboards.filter(d => d.isShared).length}</div>
            <div className="text-sm text-muted-foreground">Compartilhados</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/40">
            <div className="font-semibold text-lg">{dashboards.filter(d => d.isFavorite).length}</div>
            <div className="text-sm text-muted-foreground">Favoritos</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/40">
            <div className="font-semibold text-lg">{dashboards.reduce((sum, d) => sum + d.views, 0)}</div>
            <div className="text-sm text-muted-foreground">Visualizações</div>
          </div>
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar dashboards, tags ou descrições..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Última atualização</SelectItem>
              <SelectItem value="created">Data de criação</SelectItem>
              <SelectItem value="views">Mais visualizados</SelectItem>
              <SelectItem value="alphabetical">Ordem alfabética</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid de dashboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDashboards.map(dashboard => {
          const CategoryIcon = getCategoryIcon(dashboard.category);
          
          return (
            <Card key={dashboard.id} className="group hover:shadow-lg transition-all duration-200 border hover:border-sightx-purple/50">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sightx-purple/10 flex items-center justify-center">
                      <CategoryIcon className="h-5 w-5 text-sightx-purple" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg font-semibold line-clamp-1">
                        {dashboard.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {dashboard.category}
                        </Badge>
                        {dashboard.isFavorite && (
                          <Star className="h-3 w-3 text-amber-500" fill="currentColor" />
                        )}
                        {dashboard.isShared && (
                          <Share2 className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => toggleFavorite(dashboard.id)}
                  >
                    <Bookmark className={cn(
                      "h-4 w-4",
                      dashboard.isFavorite ? "text-amber-500" : "text-muted-foreground"
                    )} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-sm line-clamp-2">
                  {dashboard.description}
                </CardDescription>
                
                <div className="flex flex-wrap gap-1">
                  {dashboard.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {dashboard.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{dashboard.tags.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {dashboard.views} visualizações
                  </div>
                  <div>
                    Atualizado {dashboard.updatedAt.toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-sightx-purple hover:bg-sightx-purple/90"
                    onClick={() => openDashboard(dashboard)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Abrir
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => shareDashboard(dashboard)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => exportDashboard(dashboard)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDashboards.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-muted">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhum dashboard encontrado</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm ? "Nenhum dashboard corresponde aos seus critérios de busca" : "Você ainda não criou nenhum dashboard"}
          </p>
          <Button className="bg-sightx-purple hover:bg-sightx-purple/90">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Dashboard
          </Button>
        </div>
      )}
    </div>
  );
};

export default Analysis;
