import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import logoPng from '@/assets/logo-salte-auth.png';
import logoWebp from '@/assets/logo-salte-auth.webp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Redefinir senha — Projeto Salte';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não conferem');
      return;
    }
    setIsLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        toast.error('Não foi possível redefinir', { description: err.message });
      } else {
        toast.success('Senha redefinida com sucesso!');
        navigate('/dashboard');
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
          <h1 className="text-2xl font-bold mb-2">Redefinir senha</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Defina uma nova senha para acessar sua conta.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl pr-12"
                  autoComplete="new-password"
                  aria-required="true"
                  aria-invalid={!!error}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <Input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-12 rounded-xl"
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={!!error}
                aria-describedby={error ? 'reset-error' : undefined}
                required
                minLength={6}
              />
              {error && (
                <p id="reset-error" role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Redefinir senha'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
