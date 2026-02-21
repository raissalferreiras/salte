import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import logoSalteAuth from '@/assets/logo-salte-auth.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        if (!fullName.trim()) {
          toast.error('Digite seu nome completo');
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast.error('Erro ao cadastrar', { description: error.message });
        } else {
          toast.success('Conta criada com sucesso!');
          navigate('/dashboard');
        }
      }
    } catch (err) {
      toast.error('Erro inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
        <img src={logoSalteAuth} alt="Projeto Salte" className="w-40 h-40 object-contain mb-2" />
        <h1 className="text-3xl font-bold text-center mb-2">Gestão Projeto Salte
        </h1>
        <p className="text-muted-foreground text-center">Amar, servir e transformar!


        </p>
      </div>

      {/* Form */}
      <div className="px-6 pb-8">
        <div className="bg-card rounded-3xl shadow-lg border border-border/50 p-6">
          <div className="flex gap-2 mb-6">
            <button onClick={() => setIsLogin(true)} className={cn(
              'flex-1 py-2.5 text-sm font-medium rounded-xl transition-all',
              isLogin ?
              'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground'
            )}>

              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium rounded-xl transition-all',
                !isLogin ?
                'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              )}>

              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin &&
            <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-xl"
                required={!isLogin} />

              </div>
            }

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
                required />

            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl pr-12"
                  required
                  minLength={6} />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">

                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-medium"
              disabled={isLoading}>

              {isLoading ?
              <Loader2 className="h-5 w-5 animate-spin" /> :
              isLogin ?
              'Entrar' :

              'Criar Conta'
              }
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 text-center">
        <p className="text-xs text-muted-foreground">
          Favela Ventosa • Projeto Social
        </p>
      </div>
    </div>);

}