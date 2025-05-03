
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import TenantInfo from "@/components/TenantInfo";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo ao SightX, {user?.name || "Usuário"}
          </h1>
          <p className="text-muted-foreground">
            Comece a analisar seus dados e obter insights acionáveis com nossa plataforma inteligente.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações do Tenant */}
          <TenantInfo />

          {/* Cartão de início rápido */}
          <Card>
            <CardHeader>
              <CardTitle>Início rápido</CardTitle>
              <CardDescription>Comece a usar a plataforma SightX</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-sightx-purple/10 text-sightx-purple mr-3">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Inicie uma nova conversa</h3>
                    <p className="text-sm text-muted-foreground">
                      Faça perguntas ao assistente SightX e obtenha insights instantâneos.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-sightx-purple/10 text-sightx-purple mr-3">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Faça upload de seus dados</h3>
                    <p className="text-sm text-muted-foreground">
                      Carregue planilhas e permita que o SightX analise seus dados.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-sightx-purple/10 text-sightx-purple mr-3">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Visualize relatórios</h3>
                    <p className="text-sm text-muted-foreground">
                      Acesse gráficos e análises para tomar melhores decisões.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button asChild className="w-full">
                  <Link to="/chat">
                    Iniciar conversa
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/analysis">
                    Ver análises
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
