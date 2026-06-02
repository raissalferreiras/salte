import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import logoSalteAuthPng from '@/assets/logo-salte-auth.png';
import logoSalteAuthWebp from '@/assets/logo-salte-auth.webp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const loginTabRef = useRef<HTMLButtonElement>(null);
  const registerTabRef = useRef<HTMLButtonElement>(null);

  const isLogin = mode === 'login';

  // Page title for SEO/a11y
  useEffect(() => {
    document.title = isLogin
      ? 'Entrar — Projeto Salte'
      : 'Criar conta — Projeto Salte';
  }, [isLogin]);

  const validate = () => {
    const next: typeof errors = {};
    if (!isLogin && !fullName.trim()) next.fullName = 'Informe seu nome completo';
    if (!email.trim()) next.email = 'Informe seu e-mail';
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'E-mail inválido';
    if (!password) next.password = 'Informe sua senha';
    else if (password.length < 6) next.password = 'A senha deve ter ao menos 6 caracteres';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error('Erro ao entrar', { description: error.message });
        } else {
          toast.success('Bem-vindo!');
          navigate('/dashboard');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast.error('Erro ao cadastrar', { description: error.message });
        } else {
          toast.success('Conta criada com sucesso!');
          navigate('/dashboard');
        }
      }
    } catch {
      toast.error('Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next: Mode = isLogin ? 'register' : 'login';
      setMode(next);
      (next === 'login' ? loginTabRef : registerTabRef).current?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
          <picture>
            <source srcSet={logoSalteAuthWebp} type="image/webp" />
            <img
              src={logoSalteAuthPng}
              alt="Logo Projeto Salte"
              className="w-40 h-40 object-contain mb-2"
              width={160}
              height={160}
            />
          </picture>
          <h1 className="text-3xl font-bold text-center mb-2">Gestão Projeto Salte</h1>
          <p className="text-muted-foreground text-center">Amar, servir e transformar!</p>
        </div>

        {/* Form */}
        <div className="px-6 pb-8">
          <div className="bg-card rounded-3xl shadow-lg border border-border/50 p-6">
            <div role="tablist" aria-label="Autenticação" className="flex gap-2 mb-6">
              <button
                ref={loginTabRef}
                role="tab"
                type="button"
                id="tab-login"
                aria-selected={isLogin}
                aria-controls="panel-auth"
                tabIndex={isLogin ? 0 : -1}
                onKeyDown={handleTabKeyDown}
                onClick={() => setMode('login')}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isLogin ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                Entrar
              </button>
              <button
                ref={registerTabRef}
                role="tab"
                type="button"
                id="tab-register"
                aria-selected={!isLogin}
                aria-controls="panel-auth"
                tabIndex={!isLogin ? 0 : -1}
                onKeyDown={handleTabKeyDown}
                onClick={() => setMode('register')}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  !isLogin ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                Cadastrar
              </button>
            </div>

            <form
              id="panel-auth"
              role="tabpanel"
              aria-labelledby={isLogin ? 'tab-login' : 'tab-register'}
              onSubmit={handleSubmit}
              className="space-y-4"
              noValidate
            >
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 rounded-xl"
                    autoComplete="name"
                    aria-required="true"
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    required
                  />
                  {errors.fullName && (
                    <p id="fullName-error" role="alert" className="text-sm text-destructive">
                      {errors.fullName}
                    </p>
                  )}
                </div>
              )}

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
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  required
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="text-sm text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {isLogin && (
                    <Link
                      to="/recuperar-senha"
                      className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    >
                      Esqueci minha senha
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-xl pr-12"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    aria-required="true"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : 'password-hint'}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={showPassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password ? (
                  <p id="password-error" role="alert" className="text-sm text-destructive">
                    {errors.password}
                  </p>
                ) : (
                  !isLogin && (
                    <p id="password-hint" className="text-xs text-muted-foreground">
                      Mínimo de 6 caracteres
                    </p>
                  )
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-label="Carregando" />
                ) : isLogin ? (
                  'Entrar'
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-8 text-center">
          <p className="text-xs text-muted-foreground">Favela Ventosa • Projeto Social</p>
        </div>
      </main>
    </div>
  );
}
