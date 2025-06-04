
import { useState } from "react";
import { 
  Database, Plug, Star, 
  ExternalLink, Check, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Connector {
  id: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  isPopular?: boolean;
  isConnected?: boolean;
}

const connectors: Connector[] = [
  {
    id: "instagram",
    name: "Instagram",
    description: "Conecte sua conta do Instagram para análise de engajamento e métricas",
    category: "Social Media",
    isPopular: true,
    isConnected: false
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Importe dados de páginas e campanhas do Facebook",
    category: "Social Media",
    isPopular: true,
    isConnected: false
  },
  {
    id: "google-maps",
    name: "Google Maps",
    description: "Análise de localização e dados geográficos do seu negócio",
    category: "Localização",
    isPopular: true,
    isConnected: false
  },
  {
    id: "totvs",
    name: "TOTVS",
    description: "Integração com sistema ERP TOTVS para dados financeiros e operacionais",
    category: "ERP",
    isPopular: true,
    isConnected: false
  },
  {
    id: "omie",
    name: "Omie",
    description: "Conecte seu ERP Omie para análise financeira e de vendas",
    category: "ERP",
    isPopular: true,
    isConnected: false
  },
  {
    id: "bling",
    name: "Bling",
    description: "Integração com Bling ERP para gestão de vendas e estoque",
    category: "ERP",
    isPopular: true,
    isConnected: false
  },
  {
    id: "tiny",
    name: "Tiny",
    description: "Conecte seu Tiny ERP para análise de vendas e produtos",
    category: "ERP",
    isConnected: false
  },
  {
    id: "senior",
    name: "Senior Sistemas",
    description: "Integração com soluções Senior para RH e gestão empresarial",
    category: "ERP",
    isConnected: false
  },
  {
    id: "agendor",
    name: "Agendor",
    description: "Conecte seu CRM Agendor para análise de pipeline de vendas",
    category: "CRM",
    isConnected: false
  },
  {
    id: "rd-station",
    name: "RD Station CRM",
    description: "Integração com RD Station para marketing e vendas",
    category: "CRM",
    isPopular: true,
    isConnected: false
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    description: "Conecte seu Pipedrive para análise de vendas e leads",
    category: "CRM",
    isPopular: true,
    isConnected: false
  },
  {
    id: "hubspot",
    name: "HubSpot CRM",
    description: "Integração completa com HubSpot para marketing e vendas",
    category: "CRM",
    isPopular: true,
    isConnected: false
  },
  {
    id: "moskit",
    name: "Moskit CRM",
    description: "Conecte seu Moskit CRM para análise de relacionamento com clientes",
    category: "CRM",
    isConnected: false
  },
  {
    id: "sharepoint",
    name: "SharePoint",
    description: "Acesse documentos e dados do SharePoint para análise",
    category: "Documentos",
    isConnected: false
  },
  {
    id: "excel",
    name: "Excel",
    description: "Importe planilhas Excel para análise de dados",
    category: "Planilhas",
    isPopular: true,
    isConnected: false
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Conecte suas planilhas do Google para análise em tempo real",
    category: "Planilhas",
    isPopular: true,
    isConnected: false
  }
];

const categories = [
  "Todos",
  "Social Media", 
  "ERP", 
  "CRM", 
  "Planilhas", 
  "Documentos", 
  "Localização"
];

const Data = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [connectedConnectors, setConnectedConnectors] = useState<Set<string>>(new Set());

  const filteredConnectors = connectors.filter(connector => 
    selectedCategory === "Todos" || connector.category === selectedCategory
  );

  const handleConnect = (connectorId: string, connectorName: string) => {
    if (connectedConnectors.has(connectorId)) {
      setConnectedConnectors(prev => {
        const newSet = new Set(prev);
        newSet.delete(connectorId);
        return newSet;
      });
      toast.success(`${connectorName} desconectado com sucesso!`);
    } else {
      setConnectedConnectors(prev => new Set(prev.add(connectorId)));
      toast.success(`${connectorName} conectado com sucesso!`);
    }
  };

  const connectedCount = connectedConnectors.size;
  const popularConnectors = connectors.filter(c => c.isPopular);

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-sightx-purple" />
          <h1 className="text-2xl font-bold">Conectores de Dados</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="px-3 py-1">
            {connectedCount} conectados
          </Badge>
          <Button className="bg-sightx-purple hover:bg-sightx-purple/90">
            <Plus className="h-4 w-4 mr-2" />
            Solicitar Conector
          </Button>
        </div>
      </div>

      {/* Informações */}
      <div className="bg-card rounded-lg p-6 border shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Plug className="h-5 w-5 text-sightx-purple" />
          <h2 className="text-lg font-medium">Conecte suas fontes de dados</h2>
        </div>
        
        <p className="text-muted-foreground mb-6">
          Integre suas principais ferramentas de negócio para ter uma visão unificada 
          dos seus dados. O SightX suporta os conectores mais utilizados no Brasil.
        </p>

        {/* Conectores populares em destaque */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Conectores Populares
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {popularConnectors.slice(0, 4).map(connector => (
              <div 
                key={connector.id}
                className="flex items-center gap-2 p-2 rounded-md bg-muted/40"
              >
                <div className="w-6 h-6 rounded bg-sightx-purple/10 flex items-center justify-center">
                  <Plug className="h-3 w-3 text-sightx-purple" />
                </div>
                <span className="text-sm font-medium">{connector.name}</span>
                {connectedConnectors.has(connector.id) && (
                  <Check className="h-3 w-3 text-green-500 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros por categoria */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={cn(
              selectedCategory === category && "bg-sightx-purple hover:bg-sightx-purple/90"
            )}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Grid de conectores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredConnectors.map(connector => {
          const isConnected = connectedConnectors.has(connector.id);
          
          return (
            <Card 
              key={connector.id} 
              className={cn(
                "transition-all hover:shadow-md border relative",
                isConnected ? "ring-2 ring-green-500 ring-opacity-50" : "hover:border-sightx-purple/50"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sightx-purple/10 flex items-center justify-center">
                      <Plug className="h-5 w-5 text-sightx-purple" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        {connector.name}
                        {connector.isPopular && (
                          <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
                        )}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {connector.category}
                      </Badge>
                    </div>
                  </div>
                  
                  {isConnected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="text-sm">
                  {connector.description}
                </CardDescription>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className={cn(
                      "flex-1",
                      isConnected 
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : "bg-sightx-purple hover:bg-sightx-purple/90"
                    )}
                    onClick={() => handleConnect(connector.id, connector.name)}
                  >
                    {isConnected ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Desconectar
                      </>
                    ) : (
                      <>
                        <Plug className="h-4 w-4 mr-2" />
                        Conectar
                      </>
                    )}
                  </Button>
                  
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredConnectors.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-muted">
            <Database className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhum conector encontrado</h3>
          <p className="text-muted-foreground">
            Não encontramos conectores para esta categoria. Tente outra categoria.
          </p>
        </div>
      )}
    </div>
  );
};

export default Data;
