import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import logoPng from '@/assets/logo-salte-auth.png';
import logoWebp from '@/assets/logo-salte-auth.webp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Recuperar senha — Projeto Salte';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Informe um e-mail válido');
      return;
    }
    setIsLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) {
        toast.error('Não foi possível enviar', { description: err.message });
      } else {
        setSent(true);
        toast.success('E-mail enviado!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <picture>
          <source srcSet={logoWebp} type="image/webp" />
          <img
            src={logoPng}
            alt="Logo Projeto Salte"
            className="w-28 h-28 object-contain mb-4"
            width={112}
            height={112}
          />
        </picture>
        <div className="w-full max-w-md bg-card rounded-3xl shadow-lg border border-border/50 p-6">
          <h1 className="text-2xl font-bold mb-2">Recuperar senha</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Informe o e-mail da sua conta para receber um link de redefinição.
          </p>

          {sent ? (
            <div className="space-y-4">
              <p className="text-sm">
                Se houver uma conta para <strong>{email}</strong>, enviaremos as instruções em
                instantes. Verifique sua caixa de entrada e a pasta de spam.
              </p>
              <Button asChild variant="outline" className="w-full h-12 rounded-xl">
                <Link to="/auth">Voltar para o login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl"
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'email-error' : undefined}
                  required
                />
                {error && (
                  <p id="email-error" role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enviar link'}
              </Button>
              <Link
                to="/auth"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar para o login
              </Link>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
