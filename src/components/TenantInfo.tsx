
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Database, FolderOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export const TenantInfo = () => {
  const { tenant, user } = useAuth();

  // Mostrar badge de acordo com o status
  let statusBadge;
  if (tenant?.status === 'creating') {
    statusBadge = <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800">Em configuração</Badge>;
  } else if (tenant?.status === 'active') {
    statusBadge = <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">Ativo</Badge>;
  } else if (tenant?.status === 'error') {
    statusBadge = <Badge variant="outline" className="ml-2 bg-red-100 text-red-800">Erro</Badge>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Informações do Ambiente</CardTitle>
            <CardDescription>Seu ambiente SightX {statusBadge}</CardDescription>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>
      <CardContent>
        {tenant ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Schema do banco de dados</p>
                <p className="text-sm text-muted-foreground">{tenant.schema_name}</p>
              </div>
              {tenant.status === 'active' && <CheckCircle className="h-4 w-4 ml-auto text-green-500" />}
              {tenant.status === 'creating' && <Loader2 className="h-4 w-4 ml-auto animate-spin text-yellow-500" />}
              {tenant.status === 'error' && <AlertCircle className="h-4 w-4 ml-auto text-red-500" />}
            </div>

            <div className="flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Pasta de armazenamento</p>
                <p className="text-sm text-muted-foreground">
                  {tenant.storage_folder || "Pendente de configuração"}
                </p>
              </div>
              {tenant.storage_folder && tenant.status === 'active' && <CheckCircle className="h-4 w-4 ml-auto text-green-500" />}
              {!tenant.storage_folder && tenant.status === 'creating' && <Loader2 className="h-4 w-4 ml-auto animate-spin text-yellow-500" />}
              {!tenant.storage_folder && tenant.status === 'error' && <AlertCircle className="h-4 w-4 ml-auto text-red-500" />}
            </div>

            <div className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-5 w-5 mr-2 text-muted-foreground"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <div>
                <p className="text-sm font-medium">Airbyte Destination</p>
                <p className="text-sm text-muted-foreground">
                  {tenant.airbyte_destination_id ? `ID: ${tenant.airbyte_destination_id.substring(0, 8)}...` : "Pendente de configuração"}
                </p>
              </div>
              {tenant.airbyte_destination_id && tenant.status === 'active' && <CheckCircle className="h-4 w-4 ml-auto text-green-500" />}
              {!tenant.airbyte_destination_id && tenant.status === 'creating' && <Loader2 className="h-4 w-4 ml-auto animate-spin text-yellow-500" />}
              {!tenant.airbyte_destination_id && tenant.status === 'error' && <AlertCircle className="h-4 w-4 ml-auto text-red-500" />}
            </div>

            {tenant.status === 'creating' && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-1">Configuração em andamento...</p>
                <Progress value={65} className="h-1" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center">
              <Skeleton className="h-5 w-5 mr-2" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex items-center">
              <Skeleton className="h-5 w-5 mr-2" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center">
              <Skeleton className="h-5 w-5 mr-2" />
              <div className="flex-1">
                <Skeleton className="h-4 w-36 mb-1" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TenantInfo;
