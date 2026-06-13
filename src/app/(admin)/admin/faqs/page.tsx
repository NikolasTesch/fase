"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const url =
      selectedCategory === "global"
        ? "/api/admin/faqs"
        : `/api/admin/faqs?categoryId=${selectedCategory}`;
    fetch(url)
      .then((r) => r.json())
      .then(setFaqs)
      .catch(console.error);
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
    await fetch(`/api/admin/faqs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...form } : f)));
    setEditingId(null);
    setSaving(false);
  }

  async function deleteFaq(id: string) {
    if (!confirm("Remover esta pergunta?")) return;
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  }

  async function addFaq() {
    setSaving(true);
    const res = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newForm,
        categoryId: selectedCategory === "global" ? null : selectedCategory,
        sortOrder: faqs.length,
      }),
    });
    const created = await res.json();
    setFaqs((prev) => [...prev, created]);
    setNewForm({ question: "", answer: "" });
    setAdding(false);
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">FAQs</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option value="global">Global (Como Funciona)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={() => setAdding(true)}>
            Nova pergunta
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {faqs.map((faq) =>
          editingId === faq.id ? (
            <div key={faq.id} className="rounded-xl border border-border p-4 space-y-3">
              <input
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                className="w-full rounded border border-border px-3 py-2 text-sm bg-background"
                placeholder="Pergunta"
              />
              <textarea
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                rows={4}
                className="w-full rounded border border-border px-3 py-2 text-sm bg-background resize-none"
                placeholder="Resposta"
              />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  Ativo
                </label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className="w-20 rounded border border-border px-2 py-1 text-sm bg-background"
                  placeholder="Ordem"
                />
                <div className="ml-auto flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                  <Button size="sm" disabled={saving} onClick={() => saveEdit(faq.id)}>
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div
              key={faq.id}
              className="rounded-xl border border-border p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm ${!faq.isActive ? "text-muted-foreground" : ""}`}>
                  {faq.question}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => startEdit(faq)}
                  className="text-xs text-primary hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteFaq(faq.id)}
                  className="text-xs text-destructive hover:underline"
                >
                  Remover
                </button>
              </div>
            </div>
          )
        )}

        {faqs.length === 0 && !adding && (
          <p className="text-muted-foreground text-sm py-8 text-center">
            Nenhuma pergunta cadastrada para esta categoria.
          </p>
        )}

        {adding && (
          <div className="rounded-xl border border-primary/40 p-4 space-y-3">
            <input
              value={newForm.question}
              onChange={(e) => setNewForm((f) => ({ ...f, question: e.target.value }))}
              className="w-full rounded border border-border px-3 py-2 text-sm bg-background"
              placeholder="Nova pergunta"
              autoFocus
            />
            <textarea
              value={newForm.answer}
              onChange={(e) => setNewForm((f) => ({ ...f, answer: e.target.value }))}
              rows={3}
              className="w-full rounded border border-border px-3 py-2 text-sm bg-background resize-none"
              placeholder="Resposta"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>
                Cancelar
              </Button>
              <Button size="sm" disabled={saving} onClick={addFaq}>
                Adicionar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
