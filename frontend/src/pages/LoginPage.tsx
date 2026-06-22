import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { BookOpen, Key, Mail, ShieldAlert, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const showToast = useNotificationStore((state) => state.showToast);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showToast('Por favor, especifique dados de login válidos!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      if (!rememberMe) {
        // token stays in localStorage; user can clear manually on logout
      }
      showToast(`Bem-vindo de volta à Livraria Mulemba!`, 'success');
      navigate('/dashboard');
    } catch {
      showToast('E-mail ou senha incorrectos.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCreds = (role: 'user' | 'admin') => {
    if (role === 'admin') {
      setEmail('admin@bookverse.com');
      setPassword('adminPass55');
    } else {
      setEmail('customer@bookverse.com');
      setPassword('customerPass12');
    }
  };

  return (
    <div className="min-h-[75vh] grid grid-cols-1 md:grid-cols-12 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl" id="bookverse-login-form">
      
      {/* Visual background page split */}
      <div className="hidden md:flex md:col-span-5 relative bg-gradient-to-br from-blue-700 via-indigo-900 to-amber-950 p-8 flex-col justify-between text-white text-left select-none">
        <div className="absolute top-0 bottom-0 left-0 w-3.5 bg-black/15" />
        <div className="absolute top-0 bottom-0 left-3.5 w-[0.5px] bg-white/5" />
        
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-amber-400" />
          <span className="font-bold text-sm tracking-widest font-mono uppercase">Livraria Mulemba</span>
        </div>

        <div className="my-auto space-y-4">
          <h2 className="text-3xl font-black font-sans leading-tight">O Horizonte de Páginas Infinitas</h2>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Sincronize suas estantes digitais, tempos de leitura de capítulos e coleções de livros favoritos em tempo real e de forma transparente.
          </p>
        </div>

        <p className="text-[10px] font-mono text-zinc-400">
          PROTOCOLO SEGURO SHA-256 VERSÃO 4.1.2
        </p>
      </div>

      {/* CORE LOGIN FORM CARD COLUMN */}
      <div className="md:col-span-7 p-6 sm:p-12 flex flex-col justify-center bg-white dark:bg-zinc-900">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="text-left">
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 font-sans">Bem-vindo de Volta</h1>
            <p className="text-xs text-zinc-400 mt-1">Autentique com seus dados de acesso para ler e gerenciar seus livros virtuais.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1">E-mail de Acesso *</label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alexandredacosta595@gmail.com"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 pl-10 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
                <Mail className="absolute left-3.5 h-4.5 w-4.5 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 font-bold font-mono uppercase block mb-1">Sua Senha Pessoal *</label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha..."
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 pl-10 text-xs text-zinc-900 outline-none focus:border-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                />
                <Key className="absolute left-3.5 h-4.5 w-4.5 text-zinc-400 animate-pulse" />
              </div>
            </div>

            {/* Remember & forgot password tags */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 h-4 w-4 cursor-pointer accent-blue-600"
                />
                <label htmlFor="remember" className="text-zinc-500 dark:text-zinc-400 cursor-pointer select-none">Lembrar de mim</label>
              </div>
              <button
                type="button"
                onClick={() => showToast('Disparamos um e-mail com instruções para redefinição! (Falso/Simulado)', 'info')}
                className="text-blue-600 hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-md cursor-pointer transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {(submitting || isLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
              Entrar na Livraria Mulemba
            </button>
          </form>

          {/* DEMO BYPASS BOX */}
          <div className="rounded-2xl border border-amber-200/50 bg-amber-50/20 p-4 dark:border-amber-900/50 space-y-2">
            <span className="text-[10px] font-mono font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5" /> Credenciais de Teste / Simulação Rápida
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fillDemoCreds('user')}
                className="py-1.5 rounded-lg text-[10px] font-bold bg-amber-100/50 border border-amber-300 text-amber-800 hover:bg-amber-100 cursor-pointer text-center"
              >
                E-mail de Cliente
              </button>
              <button
                onClick={() => fillDemoCreds('admin')}
                className="py-1.5 rounded-lg text-[10px] font-bold bg-emerald-100/30 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 cursor-pointer text-center dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40"
              >
                E-mail de Administrador
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-zinc-500">
            Ainda não tem cadastro na Livraria Mulemba?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">
              Criar uma conta
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
