
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Database, FolderOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export const TenantInfo = () => {
  const { tenant, user } = useAuth();

  // Mostrar badge de acordo com o status
  let statusBadge;

  if (tenant?.status === 'active') {
    statusBadge = <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">Ativo</Badge>;
  } else if (tenant?.status === 'error') {
    statusBadge = <Badge variant="outline" className="ml-2 bg-red-100 text-red-800">Erro</Badge>;
  } else {
    statusBadge = <Badge variant="outline" className="ml-2 bg-gray-100 text-gray-800">Configurando</Badge>;
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
              {tenant.status === 'error' && <AlertCircle className="h-4 w-4 ml-auto text-red-500" />}
            </div>

            <div className="flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Pasta de armazenamento</p>
                <p className="text-sm text-muted-foreground">
                  {tenant.storage_folder || "Configurando..."}
                </p>
              </div>
              {tenant.storage_folder && tenant.status === 'active' && <CheckCircle className="h-4 w-4 ml-auto text-green-500" />}
              {tenant.status === 'error' && <AlertCircle className="h-4 w-4 ml-auto text-red-500" />}
            </div>

            {tenant.status === 'error' && tenant.error_message && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-xs text-red-800 font-medium">Erro na configuração:</p>
                <p className="text-xs text-red-600 mt-1">{tenant.error_message}</p>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TenantInfo;
