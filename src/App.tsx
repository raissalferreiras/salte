import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { OfflineProvider } from "@/contexts/OfflineContext";

// Pages
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import PessoasPage from "./pages/PessoasPage";
import NovaPessoaPage from "./pages/NovaPessoaPage";
import FamiliasPage from "./pages/FamiliasPage";
import NovaFamiliaPage from "./pages/NovaFamiliaPage";
import FamiliaDetalhesPage from "./pages/FamiliaDetalhesPage";
import CriancasPage from "./pages/CriancasPage";
import NovaCriancaPage from "./pages/NovaCriancaPage";
import CriancaDetalhesPage from "./pages/CriancaDetalhesPage";
import FrenteSementinhasPage from "./pages/FrenteSementinhasPage";
import FrenteHistoriasPage from "./pages/FrenteHistoriasPage";
import FrentePsicologicoPage from "./pages/FrentePsicologicoPage";
import NovoAtendimentoPage from "./pages/NovoAtendimentoPage";
import AtendimentoDetalhesPage from "./pages/AtendimentoDetalhesPage";
import NovaVisitaPage from "./pages/NovaVisitaPage";
import NovaPresencaPage from "./pages/NovaPresencaPage";
import PresencasDashboardPage from "./pages/PresencasDashboardPage";
import MapaPage from "./pages/MapaPage";
import CalendarioPage from "./pages/CalendarioPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/pessoas" element={<ProtectedRoute><PessoasPage /></ProtectedRoute>} />
      <Route path="/pessoas/novo" element={<ProtectedRoute><NovaPessoaPage /></ProtectedRoute>} />
      <Route path="/familias" element={<ProtectedRoute><FamiliasPage /></ProtectedRoute>} />
      <Route path="/familias/novo" element={<ProtectedRoute><NovaFamiliaPage /></ProtectedRoute>} />
      <Route path="/familias/:id" element={<ProtectedRoute><FamiliaDetalhesPage /></ProtectedRoute>} />
      <Route path="/criancas" element={<ProtectedRoute><CriancasPage /></ProtectedRoute>} />
      <Route path="/criancas/novo" element={<ProtectedRoute><NovaCriancaPage /></ProtectedRoute>} />
      <Route path="/criancas/:id" element={<ProtectedRoute><CriancaDetalhesPage /></ProtectedRoute>} />
      <Route path="/frentes/sementinhas" element={<ProtectedRoute><FrenteSementinhasPage /></ProtectedRoute>} />
      <Route path="/frentes/historias" element={<ProtectedRoute><FrenteHistoriasPage /></ProtectedRoute>} />
      <Route path="/frentes/psicologico" element={<ProtectedRoute><FrentePsicologicoPage /></ProtectedRoute>} />
      <Route path="/atendimentos/novo" element={<ProtectedRoute><NovoAtendimentoPage /></ProtectedRoute>} />
      <Route path="/atendimentos/:id" element={<ProtectedRoute><AtendimentoDetalhesPage /></ProtectedRoute>} />
      <Route path="/visitas/novo" element={<ProtectedRoute><NovaVisitaPage /></ProtectedRoute>} />
      <Route path="/presencas/novo" element={<ProtectedRoute><NovaPresencaPage /></ProtectedRoute>} />
      <Route path="/presencas/dashboard" element={<ProtectedRoute><PresencasDashboardPage /></ProtectedRoute>} />
      <Route path="/mapa" element={<ProtectedRoute><MapaPage /></ProtectedRoute>} />
      <Route path="/calendario" element={<ProtectedRoute><CalendarioPage /></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute><RelatoriosPage /></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute><ConfiguracoesPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <OfflineProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </OfflineProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
