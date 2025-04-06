
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import SightXLogo from "@/components/SightXLogo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [animateElements, setAnimateElements] = useState(false);
  const { login, isLoading } = useAuth();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
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
          <div className="rounded-xl bg-sightx-purple flex items-center justify-center shadow-lg shadow-sightx-purple/20 mb-2 p-3">
            <SightXLogo size="lg" colorClass="text-white" />
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
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pb-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`bg-white/50 dark:bg-black/50 h-11 transition-all duration-300 ${email ? 'border-sightx-purple' : ''}`}
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <Button variant="link" size="sm" className="text-xs p-0 h-auto link-hover-effect">
                  Esqueceu a senha?
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`bg-white/50 dark:bg-black/50 h-11 pr-10 transition-all duration-300 ${password ? 'border-sightx-purple' : ''}`}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9 transition-opacity hover:opacity-80"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">
                    {showPassword ? "Ocultar senha" : "Mostrar senha"}
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button 
              type="submit" 
              className="w-full bg-sightx-purple hover:bg-sightx-purple-light h-11 shadow-lg shadow-sightx-purple/20 transition-all duration-300 hover:shadow-xl hover:shadow-sightx-purple/30"
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
              <Button 
                variant="outline" 
                className="bg-white/50 dark:bg-black/50 transition-all duration-300 hover:bg-white/70 dark:hover:bg-black/60"
              >
                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWdvb2dsZSI+PHBhdGggZD0iTTE0LjYyIDE0LjYyYy0xLjkzIDEuOTMtNS42NiAyLTcuNjYgMC0xLjcyLTEuNzItMS44Mi00LjMzLS4zMi02LjE2UzkuMjIgNi42NCAxMS41IDYuNjRjMS4xOCAwIDIuMzIuNDggMyAxLjMyIj48L3BhdGg+PHBhdGggZD0iTTExLjUgMTJIMTl2Mi4yNWMwIDEuNTMtMC45IDIuOTgtMi4zMSAzLjY2TDEzLjUgMjAiPjwvcGF0aD48cGF0aCBkPSJNMTkgMTBoLTEuNWExLjUgMS41IDAgMCAxLTEuNS0xLjUxdi0ulRCwgdjEuNVYxMGgyIj48L3BhdGg+PC9zdmc+" 
                  alt="Google" 
                  className="w-4 h-4 mr-2"
                />
                <span className="text-sm">Google</span>
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/50 dark:bg-black/50 transition-all duration-300 hover:bg-white/70 dark:hover:bg-black/60"
              >
                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWdpdGh1YiI+PHBhdGggZD0iTTE1IDIydi00YTQuOCA0LjggMCAwIDAtMS0zLjVjMyAwIDYtMiA2LTUuNS4wOC0xLjI1LS4yNi0yLjQ4LTEtMy41LjA4LS43OS4yLTIuNS0xLTMtMS45OSAwLTMuMiAxLTMuOCAyQzEyLjgyIDQgMTAgNCA4IDVjLTEyIDAtMi41IDAtMSAzYTQuOCA0LjggMCAwIDAtMSAzLjVjMCAzLjUgMyA1LjUgNiA1LjVhNC44IDQuOCAwIDAgMC0xIDMuNXY0Ij48L3BhdGg+PHBhdGggZD0iTTkgMjJjLTQuIDEuOC04IDEtOC0zIj48L3BhdGg+PC9zdmc+"
                  alt="GitHub"
                  className="w-4 h-4 mr-2"
                />
                <span className="text-sm">GitHub</span>
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      <p className={`text-center mt-4 text-sm text-muted-foreground transition-opacity duration-700 ${animateElements ? 'opacity-100' : 'opacity-0'}`}>
        <span>Credenciais para teste: </span>
        <span className="font-semibold">demo@sightx.ai / password</span>
      </p>
      
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
