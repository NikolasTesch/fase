"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Users, ThumbsUp, ThumbsDown, Bot, RefreshCw, Sparkles, TrendingUp } from "lucide-react";

type ChatMetrics = {
  totalSessions: number;
  totalMessages: number;
  chatLeadsCount: number;
  conversionRate: string;
  positiveFeedback: number;
  negativeFeedback: number;
};

type RecentSession = {
  id: string;
  userIp: string | null;
  status: string;
  leadId: string | null;
  createdAt: string;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    feedback: number | null;
  }>;
};

export default function ChatAnalyticsPage() {
  const [metrics, setMetrics] = useState<ChatMetrics | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/chat-analytics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setRecentSessions(data.recentSessions || []);
      }
    } catch (err) {
      console.error("Erro ao buscar analytics do chat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Bot className="size-8 text-primary" />
            Analytics do Chat Fabi (RAG)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Métricas de engajamento, conversão de leads e satisfação das interações da IA Fabi.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer border border-border/50 shadow-sm"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar Dados
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Conversas Iniciadas
            </span>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="size-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-3">
            {metrics?.totalSessions ?? 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics?.totalMessages ?? 0} mensagens trocadas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl border border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Leads Capturados
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Users className="size-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-3">
            {metrics?.chatLeadsCount ?? 0}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <TrendingUp className="size-3.5" />
            Taxa de conversão: {metrics?.conversionRate ?? "0%"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl border border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avaliações Positivas
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <ThumbsUp className="size-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-3">
            {metrics?.positiveFeedback ?? 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Joinhas recebidos nas respostas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl border border-border/70 bg-card shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Avaliações Negativas
            </span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
              <ThumbsDown className="size-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground mt-3">
            {metrics?.negativeFeedback ?? 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Pontos para ajuste no RAG
          </p>
        </motion.div>
      </div>

      {/* Histórico Recente de Sessões */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border/60 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            Sessões Recentes no Chat Fabi
          </h2>
          <span className="text-xs text-muted-foreground font-mono">Últimas 10 conversas</span>
        </div>

        {recentSessions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {isLoading ? "Carregando estatísticas..." : "Nenhuma conversa registrada ainda."}
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {recentSessions.map((session) => (
              <div key={session.id} className="p-4 sm:p-5 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">IP: {session.userIp || "Anônimo"}</span>
                    {session.leadId && (
                      <span className="rounded-full bg-emerald-500/10 text-emerald-500 px-2 py-0.5 text-xs font-semibold border border-emerald-500/20">
                        Lead Gerado!
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(session.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>

                <div className="space-y-1.5 mt-3">
                  {session.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`text-xs p-2.5 rounded-lg max-w-2xl ${
                        msg.role === "user"
                          ? "bg-primary/10 text-foreground font-medium"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <span className="font-bold mr-1">
                        {msg.role === "user" ? "Cliente:" : "Fabi:"}
                      </span>
                      {msg.content.slice(0, 200)}
                      {msg.content.length > 200 && "..."}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
