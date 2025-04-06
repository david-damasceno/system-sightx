
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
});

const signupSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme sua senha")
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não correspondem",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [animateElements, setAnimateElements] = useState(false);
  const { login, signup, isLoading } = useAuth();
  const isMobile = useIsMobile();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    await login(data.email, data.password);
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    await signup(data.email, data.password, data.name);
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateElements(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-md px-4">
      <div className={`flex justify-center mb-8 transition-all duration-700 ${animateElements ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-8'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-xl bg-sightx-purple flex items-center justify-center shadow-lg shadow-sightx-purple/20 mb-2">
            <img 
              src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" 
              alt="SightX Logo" 
              className="h-10 w-10 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-sightx-purple">
            SightX
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Inteligência artificial ao seu dispor</p>
        </div>
      </div>
      
      <Card 
        className={`glass-panel shadow-xl transition-all duration-700 ${animateElements ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'}`}
      >
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Digite suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>
        
        <Form {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
            <CardContent className="space-y-4 pb-2">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>E-mail</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="nome@exemplo.com"
                          {...field}
                          className={`bg-white/50 dark:bg-black/50 h-11 pl-10 transition-all duration-300 ${
                            field.value ? 'border-sightx-purple' : ''
                          }`}
                          autoComplete="email"
                        />
                      </FormControl>
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Senha</FormLabel>
                      <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                        Esqueceu a senha?
                      </Button>
                    </div>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className={`bg-white/50 dark:bg-black/50 h-11 pl-10 pr-10 transition-all duration-300 ${
                            field.value ? 'border-sightx-purple' : ''
                          }`}
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">
                          {showPassword ? "Ocultar senha" : "Mostrar senha"}
                        </span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button 
                type="submit" 
                className="w-full bg-sightx-purple hover:bg-sightx-purple-light h-11 shadow-lg shadow-sightx-purple/20 transition-all hover:shadow-xl hover:shadow-sightx-purple/30"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">ou continue com</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="bg-white/50 dark:bg-black/50">
                  <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWdvb2dsZSI+PHBhdGggZD0iTTE0LjYyIDE0LjYyYy0xLjkzIDEuOTMtNS42NiAyLTcuNjYgMC0xLjcyLTEuNzItMS44Mi00LjMzLS4zMi02LjE2UzkuMjIgNi42NCAxMS41IDYuNjRjMS4xOCAwIDIuMzIuNDggMyAxLjMyIj48L3BhdGg+PHBhdGggZD0iTTExLjUgMTJIMTl2Mi4yNWMwIDEuNTMtMC45IDIuOTgtMi4zMSAzLjY2TDEzLjUgMjAiPjwvcGF0aD48cGF0aCBkPSJNMTkgMTBoLTEuNWExLjUgMS41IDAgMCAxLTEuNS0xLjVWNCI+PC9wYXRoPjxwYXRoIGQ9Ik00IDEyaDhWNG04IDB2MGE0IDQgMCAwIDAgLTQgLTRoNFY0Ij48L3BhdGg+PC9zdmc+" 
                    alt="Google" 
                    className="w-4 h-4 mr-2"
                  />
                  <span className="text-sm">Google</span>
                </Button>
                <Button variant="outline" className="bg-white/50 dark:bg-black/50">
                  <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWdpdGh1YiI+PHBhdGggZD0iTTE1IDIydi00YTQuOCA0LjggMCAwIDAtMS0zLjVjMyAwIDYtMiA2LTUuNS4wOC0xLjI1LS4yNi0yLjQ4LTEtMy41LjA4LS43OS4yLTIuNS0xLTMtMS45OSAwLTMuMiAxLTMuOCAyQzEyLjgyIDQgMTAgNCA4IDVjLTEyIDAtMi41IDAtMSAzYTQuOCA0LjggMCAwIDAtMSAzLjVjMCAzLjUgMyA1LjUgNiA1LjVhNC44IDQuOCAwIDAgMC0xIDMuNXY0Ij48L3BhdGg+PHBhdGggZD0iTTkgMjJjLTQuIDEuOC04IDEtOC0zIj48L3BhdGg+PC9zdmc+"
                    alt="GitHub"
                    className="w-4 h-4 mr-2"
                  />
                  <span className="text-sm">GitHub</span>
                </Button>
              </div>
              
              <p className="text-center text-sm">
                Não tem uma conta?{" "}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" className="p-0 h-auto text-sightx-purple">
                      Criar conta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Criar conta</DialogTitle>
                      <DialogDescription>
                        Preencha os dados abaixo para criar sua conta no SightX.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4 py-4">
                        <FormField
                          control={signupForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    placeholder="Seu nome"
                                    {...field}
                                    className="pl-10"
                                  />
                                </FormControl>
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-mail</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    placeholder="nome@exemplo.com"
                                    {...field}
                                    className="pl-10"
                                  />
                                </FormControl>
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    type={showSignupPassword ? "text" : "password"}
                                    {...field}
                                    className="pl-10 pr-10"
                                  />
                                </FormControl>
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                                >
                                  {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={signupForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar senha</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    type={showSignupConfirmPassword ? "text" : "password"}
                                    {...field}
                                    className="pl-10 pr-10"
                                  />
                                </FormControl>
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                                  onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                                >
                                  {showSignupConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            className="w-full bg-sightx-purple hover:bg-sightx-purple-light" 
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Criando conta...
                              </>
                            ) : (
                              "Criar conta"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {!isMobile && (
        <>
          <div className="fixed top-1/4 -left-20 w-64 h-64 bg-sightx-purple/10 rounded-full filter blur-3xl animate-pulse-subtle" />
          <div className="fixed bottom-1/4 -right-20 w-80 h-80 bg-sightx-green/10 rounded-full filter blur-3xl animate-pulse-subtle" />
        </>
      )}
    </div>
  );
};

export default Login;
