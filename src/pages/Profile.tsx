
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import TenantInfo from "@/components/TenantInfo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Camera, Lock, Mail, Pen, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface ProfileFormValues {
  name: string;
  email: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
}

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      notifications: {
        email: true,
        push: false,
      }
    }
  });

  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    const nameParts = user.name.trim().split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    } else {
      return nameParts[0].charAt(0).toUpperCase();
    }
  };
  
  const handleSaveProfile = (data: ProfileFormValues) => {
    // Simulando atualização de perfil
    toast.success("Perfil atualizado com sucesso!");
    setIsEditing(false);
  };
  
  const handlePasswordReset = () => {
    toast.success("Email de redefinição de senha enviado!");
  };

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      {/* Cabeçalho da página com informações básicas */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações de perfil e configurações</p>
        </div>
        
        <Button variant="default" className="gap-2 bg-sightx-purple hover:bg-sightx-purple-light">
          <Shield className="w-4 h-4" />
          Verificar Conta
        </Button>
      </div>
      
      {/* Seção principal com abas para diferentes configurações */}
      <div className="grid gap-8">
        {/* Cartão do perfil */}
        <Card className="border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-sightx-purple/30 to-sightx-purple-light/20 rounded-t-lg">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt={user?.name || "Usuário"} />
                  ) : (
                    <AvatarFallback className="text-2xl bg-sightx-purple text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="absolute bottom-0 right-0 rounded-full shadow-md h-8 w-8"
                  onClick={() => toast.info("Funcionalidade para alterar a foto em breve!")}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-2">
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <Badge className="bg-sightx-purple text-white">Premium</Badge>
                </div>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-sm mt-1">Membro desde Maio 2025</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6">
            <Tabs defaultValue="perfil" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="perfil" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Informações Pessoais</span>
                  <span className="sm:hidden">Perfil</span>
                </TabsTrigger>
                <TabsTrigger value="seguranca" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">Segurança</span>
                  <span className="sm:hidden">Segurança</span>
                </TabsTrigger>
                <TabsTrigger value="notificacoes" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notificações</span>
                  <span className="sm:hidden">Avisos</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="perfil" className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSaveProfile)} className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Informações Pessoais</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2"
                      >
                        <Pen className="h-4 w-4" />
                        {isEditing ? "Cancelar" : "Editar"}
                      </Button>
                    </div>
                    
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={!isEditing} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} disabled type="email" />
                            </FormControl>
                            <FormDescription>
                              O email não pode ser alterado
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div>
                      <FormLabel>ID de Usuário</FormLabel>
                      <Input value={user?.id} disabled className="font-mono text-sm" />
                      <p className="text-sm text-muted-foreground mt-1">
                        Este é seu identificador único no sistema
                      </p>
                    </div>
                    
                    {isEditing && (
                      <Button type="submit" className="bg-sightx-purple hover:bg-sightx-purple-light">
                        Salvar Alterações
                      </Button>
                    )}
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="seguranca" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Segurança da Conta</h3>
                </div>
                
                <Card className="border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Recomendação de Segurança
                    </CardTitle>
                    <CardDescription className="text-amber-700 dark:text-amber-400">
                      Recomendamos a configuração de autenticação em dois fatores para aumentar a segurança da sua conta.
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Senha</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">
                        Última alteração: 3 meses atrás
                      </p>
                    </div>
                    <Button variant="outline" onClick={handlePasswordReset}>
                      Alterar Senha
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">
                        Proteja sua conta com segurança adicional
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => toast.info("Funcionalidade disponível em breve!")}>
                      Configurar 2FA
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Sessões Ativas</h4>
                  <div className="space-y-2">
                    <div className="rounded-lg border p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Chrome - Windows</p>
                          <p className="text-sm text-muted-foreground">São Paulo, Brasil • Ativo agora</p>
                        </div>
                        <Badge className="bg-green-500 text-white">Atual</Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => toast.success("Todas as outras sessões foram encerradas")}>
                    Encerrar todas as outras sessões
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="notificacoes" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Preferências de Notificações</h3>
                </div>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Notificações por Email</CardTitle>
                      <CardDescription>
                        Gerencie como você recebe comunicações por email
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid gap-6">
                        <div className="flex items-center justify-between space-x-2">
                          <Label htmlFor="email-updates" className="flex flex-col space-y-1">
                            <span>Atualizações do Sistema</span>
                            <span className="font-normal text-xs text-muted-foreground">Receba notificações sobre novas funcionalidades e melhorias</span>
                          </Label>
                          <Switch id="email-updates" checked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between space-x-2">
                          <Label htmlFor="email-security" className="flex flex-col space-y-1">
                            <span>Alertas de Segurança</span>
                            <span className="font-normal text-xs text-muted-foreground">Notificações sobre atividades suspeitas ou logins de novos dispositivos</span>
                          </Label>
                          <Switch id="email-security" checked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between space-x-2">
                          <Label htmlFor="email-marketing" className="flex flex-col space-y-1">
                            <span>Comunicações de Marketing</span>
                            <span className="font-normal text-xs text-muted-foreground">Receba informativos sobre ofertas e novidades</span>
                          </Label>
                          <Switch id="email-marketing" />
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button className="w-full" variant="outline" onClick={() => toast.success("Preferências de notificações salvas")}>
                        Salvar Preferências
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Informações do Tenant */}
        <div className="bg-gradient-to-r from-sightx-purple/5 to-sightx-purple-light/5 p-6 rounded-lg shadow-sm border border-sightx-purple/10">
          <h2 className="text-xl font-semibold mb-4 text-sightx-purple">Informações do Ambiente</h2>
          <TenantInfo />
        </div>
      </div>
    </div>
  );
};

export default Profile;
