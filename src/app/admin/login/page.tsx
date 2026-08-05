"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message ?? "Credenciais inválidas");
        return;
      }

      router.refresh();
      router.push("/admin/dashboard");
    } catch {
      setError("Erro de conexão com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Background Decorator Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-card/80 backdrop-blur-xl rounded-3xl border border-border/80 p-8 sm:p-10 shadow-2xl shadow-black/5 dark:shadow-black/40"
      >
        {/* Top Header & Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-lg" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-red-600 to-red-700 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 ring-1 ring-white/20">
              <Zap size={28} className="fill-current text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Fase Sport
          </h1>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
            Painel Administrativo
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2">
              E-mail de Acesso
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                required
                placeholder="admin@fasesport.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-background/60 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-background/60 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>

          {/* Error Message Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive"
              role="alert"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={loading}
            variant="default"
            className="w-full h-11 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 transition-all duration-200 hover:shadow-primary/30 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                <span>Entrando...</span>
              </span>
            ) : (
              "Acessar Painel"
            )}
          </Button>
        </form>

        {/* Back Link */}
        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Voltar ao site público</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
