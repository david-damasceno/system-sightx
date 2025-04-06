
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="w-full max-w-md px-4 animate-fade-in">
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" 
            alt="SightX Logo" 
            className="h-16 w-16"
          />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sightx-purple to-sightx-green bg-clip-text text-transparent">
            SightX
          </h1>
        </div>
      </div>
      
      <Card className="glass-panel">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Digite suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/50 dark:bg-black/50"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Button variant="link" size="sm" className="text-xs px-0">
                  Esqueceu a senha?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/50 dark:bg-black/50"
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-sightx-purple hover:bg-sightx-purple-light"
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
          </CardFooter>
        </form>
      </Card>
      
      <p className="text-center mt-4 text-sm text-muted-foreground">
        <span>Credenciais demo: </span>
        <span className="font-semibold">demo@sightx.ai / password</span>
      </p>
    </div>
  );
};

export default Login;
