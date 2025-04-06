
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <img 
            src="/lovable-uploads/9000350f-715f-4dda-9046-fd7cd24ae8ff.png" 
            alt="SightX Logo" 
            className="h-16 w-16 mx-auto"
          />
        </div>
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-sightx-purple to-sightx-green bg-clip-text text-transparent">404</h1>
        <p className="text-xl mb-6">Oops! Página não encontrada</p>
        <Button asChild className="bg-sightx-purple hover:bg-sightx-purple-light">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
