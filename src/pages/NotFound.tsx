import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import logoPng from "@/assets/logo-salte-auth.png";
import logoWebp from "@/assets/logo-salte-auth.webp";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Página não encontrada — Projeto Salte";
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12 text-center">
      <picture>
        <source srcSet={logoWebp} type="image/webp" />
        <img
          src={logoPng}
          alt="Logo Projeto Salte"
          className="w-28 h-28 object-contain mb-6"
          width={112}
          height={112}
        />
      </picture>
      <p className="text-sm font-medium text-primary mb-2">Erro 404</p>
      <h1 className="text-3xl font-bold mb-3">Página não encontrada</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        A página que você tentou acessar não existe ou foi movida. Verifique o endereço ou volte
        para a tela inicial.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Button asChild className="h-12 rounded-xl flex-1">
          <Link to="/dashboard">
            <Home className="h-4 w-4 mr-2" /> Ir para o início
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-xl flex-1">
          <Link to="/auth">
            <ArrowLeft className="h-4 w-4 mr-2" /> Entrar
          </Link>
        </Button>
      </div>
    </main>
  );
};

export default NotFound;
