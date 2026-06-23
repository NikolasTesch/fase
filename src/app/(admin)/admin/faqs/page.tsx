"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, HelpCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Faq = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
  categoryId: string | null;
  category?: { slug: string; name: string } | null;
};

type Category = { id: string; slug: string; name: string };

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("global");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", sortOrder: 0, isActive: true });
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState({ question: "", answer: "" });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const url =
      selectedCategory === "global"
        ? "/api/admin/faqs"
        : `/api/admin/faqs?categoryId=${selectedCategory}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then(setFaqs)
      .catch(() => setFaqs([]));
  }, [selectedCategory]);

  function startEdit(faq: Faq) {
    setEditingId(faq.id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder,
      isActive: faq.isActive,
    });
  }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...form } : f)));
      setEditingId(null);
    } catch (err) {
      console.error("[saveEdit]", err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteFaq(id: string) {
    if (!confirm("Remover esta pergunta?")) return;
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao remover");
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("[deleteFaq]", err);
    }
  }

  async function addFaq() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newForm,
          categoryId: selectedCategory === "global" ? null : selectedCategory,
          sortOrder: faqs.length,
        }),
      });
      if (!res.ok) throw new Error("Erro ao criar FAQ");
      const created = await res.json();
      setFaqs((prev) => [...prev, created]);
      setNewForm({ question: "", answer: "" });
      setAdding(false);
    } catch (err) {
      console.error("[addFaq]", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {faqs.length} pergunta{faqs.length !== 1 ? "s" : ""} nesta seção
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          >
            <option value="global">Global (Como Funciona)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={() => setAdding(true)} className="gap-2">
            <Plus size={14} />
            Nova pergunta
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {faqs.map((faq) =>
            editingId === faq.id ? (
              <motion.div
                key={faq.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-primary/40 bg-primary/4 p-5 space-y-3"
              >
                <input
                  value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Pergunta"
                />
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Resposta"
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, isActive: e.target.checked }))
                      }
                      className="rounded"
                    />
                    Ativo
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Ordem:</span>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))
                      }
                      className="w-16 rounded-lg border border-border px-2 py-1 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      disabled={saving}
                      onClick={() => saveEdit(faq.id)}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={faq.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "rounded-2xl border border-border p-4 flex items-start justify-between gap-4 group",
                  "hover:border-border/80 hover:bg-muted/20 transition-all duration-200",
                  !faq.isActive && "opacity-60",
                )}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-medium text-sm",
                      !faq.isActive && "text-muted-foreground",
                    )}
                  >
                    {faq.question}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => startEdit(faq)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteFaq(faq.id)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ),
          )}
        </AnimatePresence>

        {/* Empty state */}
        {faqs.length === 0 && !adding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <HelpCircle size={32} className="opacity-30" />
              <p className="text-sm">Nenhuma pergunta cadastrada para esta categoria.</p>
              <button
                onClick={() => setAdding(true)}
                className="text-xs text-primary hover:underline underline-offset-2"
              >
                Adicionar primeira pergunta
              </button>
            </div>
          </motion.div>
        )}

        {/* Form de nova FAQ */}
        <AnimatePresence>
          {adding && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-primary/40 bg-primary/4 p-5 space-y-3"
            >
              <input
                value={newForm.question}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, question: e.target.value }))
                }
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Nova pergunta..."
                autoFocus
              />
              <textarea
                value={newForm.answer}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, answer: e.target.value }))
                }
                rows={3}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Resposta..."
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAdding(false)}
                >
                  Cancelar
                </Button>
                <Button size="sm" disabled={saving} onClick={addFaq}>
                  Adicionar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
