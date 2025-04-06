
import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Loader2, 
  Save, 
  User, 
  Mail, 
  Lock, 
  BellRing, 
  Shield, 
  Globe,
  Camera,
  CheckCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";

const Profile = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      toast.success("Perfil atualizado com sucesso", {
        description: "Suas informações foram atualizadas.",
      });
      setIsLoading(false);
      setShowSuccess(true);
      
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Seu Perfil</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Gerencie suas informações pessoais e configurações
        </p>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="text-sm">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security" className="text-sm">
              <Lock className="h-4 w-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-sm">
              <BellRing className="h-4 w-4 mr-2" />
              Notificações
            </TabsTrigger>
          </TabsList>
        
          <TabsContent value="profile" className="space-y-6">
            <Card className="glass-panel shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Perfil
                </CardTitle>
                <CardDescription>
                  Atualize seus dados pessoais
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                        <AvatarImage 
                          src={avatarPreview || user?.avatar} 
                          alt={user?.name} 
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-sightx-purple text-white text-xl">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                        <span className="sr-only">Alterar avatar</span>
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                    
                    <div className="space-y-2 flex-1">
                      <h3 className="font-medium">Foto de Perfil</h3>
                      <p className="text-sm text-muted-foreground">
                        A imagem deve ser em formato PNG ou JPG e menor que 2MB
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs h-8"
                        >
                          Carregar imagem
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setAvatarPreview(null)}
                          className="text-xs h-8"
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">Nome</Label>
                      <div className="relative">
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="pl-10"
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="pl-10"
                          disabled
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">Para alterar o email, entre em contato com o suporte</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm">Localização</Label>
                      <div className="relative">
                        <Input
                          id="location"
                          name="location"
                          placeholder="São Paulo, Brasil"
                          className="pl-10"
                        />
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-sm">Empresa</Label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="Nome da empresa (opcional)"
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-sightx-purple hover:bg-sightx-purple-light relative"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : showSuccess ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Salvo!
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar alterações
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Preferências
                </CardTitle>
                <CardDescription>
                  Configure idioma e fuso horário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <select 
                      id="language" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <select 
                      id="timezone" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                      <option value="America/New_York">New York (GMT-4)</option>
                      <option value="Europe/London">London (GMT+1)</option>
                      <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button className="bg-sightx-purple hover:bg-sightx-purple-light">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar preferências
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Segurança
                </CardTitle>
                <CardDescription>
                  Altere sua senha e configure a autenticação em dois fatores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Alterar senha</h3>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Senha atual</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova senha</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Autenticação em dois fatores</h3>
                      <p className="text-sm text-muted-foreground">
                        Adicione uma camada extra de segurança à sua conta
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto bg-sightx-purple hover:bg-sightx-purple-light">
                  Salvar configurações de segurança
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border border-destructive/20">
              <CardHeader>
                <CardTitle className="text-xl text-destructive flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Zona de perigo
                </CardTitle>
                <CardDescription>
                  Ações irreversíveis para sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Excluir sua conta removerá permanentemente todos os seus dados, incluindo histórico de conversas.
                  Essa ação não pode ser desfeita.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Excluir minha conta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                        e removerá seus dados de nossos servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={logout}
                      >
                        Excluir minha conta
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BellRing className="h-5 w-5" />
                  Preferências de notificação
                </CardTitle>
                <CardDescription>
                  Escolha como e quando deseja ser notificado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Notificações por email</h3>
                  
                  <div className="space-y-3">
                    {[
                      { id: "email-news", label: "Novidades e atualizações" },
                      { id: "email-activity", label: "Resumo de atividades" },
                      { id: "email-security", label: "Alertas de segurança" },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <Label htmlFor={item.id} className="cursor-pointer">{item.label}</Label>
                        <Switch id={item.id} defaultChecked={item.id === "email-security"} />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Notificações no sistema</h3>
                  
                  <div className="space-y-3">
                    {[
                      { id: "push-mentions", label: "Menções e marcações" },
                      { id: "push-replies", label: "Respostas às suas mensagens" },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <Label htmlFor={item.id} className="cursor-pointer">{item.label}</Label>
                        <Switch id={item.id} defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Não perturbe</h3>
                      <p className="text-sm text-muted-foreground">
                        Pausar todas as notificações
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto bg-sightx-purple hover:bg-sightx-purple-light">
                  Salvar preferências de notificação
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
