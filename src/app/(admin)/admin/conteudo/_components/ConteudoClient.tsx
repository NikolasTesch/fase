"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminRole, ArtFile, ArtTag } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Check,
  Download,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Search,
  Tag as TagIcon,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ArtWithTags = ArtFile & {
  tags: ArtTag[];
  createdBy: { name: string } | null;
};

interface ConteudoClientProps {
  tags: ArtTag[];
  arts: ArtWithTags[];
  role: AdminRole;
  userId: string;
}

const ORIGINAL_ACCEPT =
  ".cdr,.svg,.pdf,.ai,.eps,.png,.jpg,.jpeg,.webp,.gif";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring";

export function ConteudoClient({ tags, arts, role, userId }: ConteudoClientProps) {
  const router = useRouter();
  const isT1 = role === "T1_GERENCIA";

  const [tab, setTab] = useState<"artes" | "tags">("artes");
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | "all">("all");

  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTagIds, setNewTagIds] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editing, setEditing] = useState<ArtWithTags | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTagIds, setEditTagIds] = useState<string[]>([]);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [newTagName, setNewTagName] = useState("");
  const [tagBusy, setTagBusy] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState("");
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

  const canManageArt = (art: ArtWithTags) => isT1 || art.createdById === userId;

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const art of arts) {
      for (const tag of art.tags) {
        counts.set(tag.id, (counts.get(tag.id) ?? 0) + 1);
      }
    }
    return counts;
  }, [arts]);

  const filteredArts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return arts.filter((art) => {
      if (tagFilter !== "all" && !art.tags.some((t) => t.id === tagFilter)) {
        return false;
      }
      if (!q) return true;
      return (
        art.name.toLowerCase().includes(q) ||
        (art.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [arts, query, tagFilter]);

  function resetNewForm() {
    setNewName("");
    setNewDescription("");
    setNewTagIds([]);
    setPreviewFile(null);
    setOriginalFile(null);
    setFormError(null);
  }

  function openEdit(art: ArtWithTags) {
    setEditing(art);
    setEditName(art.name);
    setEditDescription(art.description ?? "");
    setEditTagIds(art.tags.map((t) => t.id));
    setEditError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!previewFile || !originalFile) {
      setFormError("Selecione a imagem de preview e o arquivo original.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const fd = new FormData();
      fd.append("file", previewFile);
      fd.append("original", originalFile);
      fd.append("name", newName.trim());
      if (newDescription.trim()) fd.append("description", newDescription.trim());
      fd.append("tagIds", JSON.stringify(newTagIds));
      const res = await fetch("/api/admin/arts/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.message ?? "Erro ao enviar a arte.");
        return;
      }
      router.refresh();
      resetNewForm();
      setNewOpen(false);
    } catch {
      setFormError("Erro de conexão ao enviar a arte.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/admin/arts/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() ? editDescription.trim() : null,
          tagIds: editTagIds,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditError(data.message ?? "Erro ao salvar a arte.");
        return;
      }
      router.refresh();
      setEditing(null);
    } catch {
      setEditError("Erro de conexão ao salvar a arte.");
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDeleteArt(art: ArtWithTags) {
    if (!confirm(`Excluir a arte "${art.name}"? Essa ação não pode ser desfeita.`)) return;
    try {
      const res = await fetch(`/api/admin/arts/${art.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message ?? "Erro ao excluir a arte.");
        return;
      }
      router.refresh();
    } catch {
      alert("Erro de conexão ao excluir a arte.");
    }
  }

  async function handleCreateTag(e: React.FormEvent) {
    e.preventDefault();
    const name = newTagName.trim();
    if (name.length < 2) return;
    setTagBusy(true);
    setTagError(null);
    try {
      const res = await fetch("/api/admin/art-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTagError(data.message ?? "Erro ao criar a tag.");
        return;
      }
      setNewTagName("");
      router.refresh();
    } catch {
      setTagError("Erro de conexão ao criar a tag.");
    } finally {
      setTagBusy(false);
    }
  }

  async function handleRenameTag(tagId: string) {
    const name = renamingName.trim();
    if (name.length < 2) return;
    setTagBusy(true);
    setTagError(null);
    try {
      const res = await fetch(`/api/admin/art-tags/${tagId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTagError(data.message ?? "Erro ao renomear a tag.");
        return;
      }
      setRenamingId(null);
      router.refresh();
    } catch {
      setTagError("Erro de conexão ao renomear a tag.");
    } finally {
      setTagBusy(false);
    }
  }

  async function handleDeleteTag(tag: ArtTag) {
    if (!confirm(`Excluir a tag "${tag.name}"? As artes não serão removidas.`)) return;
    setDeletingTagId(tag.id);
    setTagError(null);
    try {
      const res = await fetch(`/api/admin/art-tags/${tag.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setTagError(data.message ?? "Erro ao excluir a tag.");
        return;
      }
      router.refresh();
    } catch {
      setTagError("Erro de conexão ao excluir a tag.");
    } finally {
      setDeletingTagId(null);
    }
  }

  function toggleTag(list: string[], id: string): string[] {
    return list.includes(id) ? list.filter((t) => t !== id) : [...list, id];
  }

  const tagCheckboxes = (
    <div className="grid gap-2 sm:grid-cols-2">
      {tags.length === 0 ? (
        <p className="text-xs text-muted-foreground sm:col-span-2">
          Nenhuma tag cadastrada ainda — crie tags na aba &quot;Tags&quot;.
        </p>
      ) : (
        tags.map((tag) => {
          const checked = newTagIds.includes(tag.id);
          return (
            <label
              key={tag.id}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/50"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setNewTagIds((prev) => toggleTag(prev, tag.id))}
                className="size-4 accent-primary"
              />
              {tag.name}
            </label>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <ImageIcon size={13} />
            <span>Biblioteca de Artes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Conteúdo
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {arts.length} arte{arts.length !== 1 ? "s" : ""} no acervo ·{" "}
            {tags.length} tag{tags.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setTab("artes")}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
            tab === "artes"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Artes
        </button>
        {isT1 && (
          <button
            type="button"
            onClick={() => setTab("tags")}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === "tags"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Tags
          </button>
        )}
      </div>

      {tab === "artes" ? (
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome ou descrição..."
                className={cn(inputClass, "pl-9")}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTagFilter("all")}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  tagFilter === "all"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                Todas
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setTagFilter(tagFilter === tag.id ? "all" : tag.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    tagFilter === tag.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tag.name} ({tagCounts.get(tag.id) ?? 0})
                </button>
              ))}
            </div>
            <Button
              variant="default"
              className="gap-2 shrink-0 shadow-md shadow-primary/20"
              onClick={() => setNewOpen(true)}
            >
              <Plus size={16} />
              Nova arte
            </Button>
          </div>

          {/* Grid */}
          {arts.length === 0 ? (
            <div className="rounded-3xl border border-border/80 bg-card/60 px-4 py-16 text-center shadow-sm">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50">
                  <ImageIcon size={24} className="opacity-40" />
                </div>
                <p className="text-sm font-medium">Nenhuma arte cadastrada ainda.</p>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 mt-1"
                  onClick={() => setNewOpen(true)}
                >
                  <Plus size={14} />
                  Adicionar primeira arte
                </Button>
              </div>
            </div>
          ) : filteredArts.length === 0 ? (
            <div className="rounded-3xl border border-border/80 bg-card/60 px-4 py-16 text-center shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">
                Nenhuma arte encontrada.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredArts.map((art) => (
                <div
                  key={art.id}
                  className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="aspect-square w-full overflow-hidden bg-muted/40">
                    <img
                      src={`/api/admin/arts/${art.id}/preview`}
                      alt={art.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col gap-2 p-3">
                    <h3 className="truncate text-sm font-semibold text-foreground" title={art.name}>
                      {art.name}
                    </h3>
                    {art.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {art.description}
                      </p>
                    )}
                    {art.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {art.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2">
                      <p className="truncate text-[11px] text-muted-foreground">
                        por {art.createdBy?.name ?? "usuário removido"} ·{" "}
                        {formatDate(art.createdAt)}
                      </p>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-[11px] px-2"
                          render={<a href={`/api/admin/arts/${art.id}/download`} />}
                        >
                          <Download size={12} />
                          Baixar
                        </Button>
                        {canManageArt(art) && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(art)}
                              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              aria-label={`Editar ${art.name}`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteArt(art)}
                              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                              aria-label={`Excluir ${art.name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Tags tab (T1 only) */
        <div className="space-y-5">
          <form
            onSubmit={handleCreateTag}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <TagIcon
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Nome da nova tag (mín. 2 caracteres)"
                className={cn(inputClass, "pl-9")}
              />
            </div>
            <Button
              type="submit"
              variant="default"
              className="gap-2 shrink-0"
              disabled={newTagName.trim().length < 2 || tagBusy}
            >
              {tagBusy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Criar tag
            </Button>
          </form>

          {tagError && (
            <p className="text-xs font-medium text-destructive">{tagError}</p>
          )}

          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
            {tags.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                Nenhuma tag cadastrada. Crie a primeira acima.
              </p>
            ) : (
              <ul className="divide-y divide-border/60">
                {tags.map((tag) => (
                  <li
                    key={tag.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    {renamingId === tag.id ? (
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          value={renamingName}
                          onChange={(e) => setRenamingName(e.target.value)}
                          autoFocus
                          className={cn(inputClass, "max-w-xs")}
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameTag(tag.id)}
                          disabled={renamingName.trim().length < 2 || tagBusy}
                          className="rounded-lg bg-primary p-2 text-primary-foreground transition-opacity disabled:opacity-50"
                          aria-label="Salvar nome da tag"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRenamingId(null)}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Cancelar edição"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {tag.name}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {tagCounts.get(tag.id) ?? 0} arte
                            {(tagCounts.get(tag.id) ?? 0) !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setRenamingId(tag.id);
                              setRenamingName(tag.name);
                              setTagError(null);
                            }}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label={`Renomear ${tag.name}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTag(tag)}
                            disabled={deletingTagId === tag.id}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:opacity-50"
                            aria-label={`Excluir ${tag.name}`}
                          >
                            {deletingTagId === tag.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* New art dialog */}
      <Dialog
        open={newOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetNewForm();
            setNewOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogTitle>Nova arte</DialogTitle>
          <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Nome *
              </label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                placeholder="Ex.: Escudo Corinthians"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Descrição
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                maxLength={1000}
                rows={2}
                placeholder="Detalhes opcionais sobre a arte"
                className={cn(inputClass, "resize-none")}
              />
            </div>

            <div>
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Tags
              </span>
              {tagCheckboxes}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Preview (imagem) *
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setPreviewFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-muted/80"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Arquivo original *
              </label>
              <input
                type="file"
                accept={ORIGINAL_ACCEPT}
                required
                onChange={(e) => setOriginalFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-muted/80"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Formatos aceitos: CDR, SVG, PDF, AI, EPS, PNG, JPG, WEBP, GIF
              </p>
            </div>

            {formError && (
              <p className="text-xs font-medium text-destructive">{formError}</p>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => {
                  resetNewForm();
                  setNewOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 size={14} className="mr-1 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Salvar arte"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit art dialog */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogTitle>Editar arte</DialogTitle>
          <form onSubmit={handleEditSave} className="mt-4 flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Nome *
              </label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Descrição
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={1000}
                rows={2}
                className={cn(inputClass, "resize-none")}
              />
            </div>

            <div>
              <span className="mb-1 block text-xs font-medium text-muted-foreground">
                Tags
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                {tags.map((tag) => {
                  const checked = editTagIds.includes(tag.id);
                  return (
                    <label
                      key={tag.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setEditTagIds((prev) => toggleTag(prev, tag.id))
                        }
                        className="size-4 accent-primary"
                      />
                      {tag.name}
                    </label>
                  );
                })}
              </div>
            </div>

            {editError && (
              <p className="text-xs font-medium text-destructive">{editError}</p>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={editSubmitting}
                onClick={() => setEditing(null)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={editSubmitting}>
                {editSubmitting ? (
                  <>
                    <Loader2 size={14} className="mr-1 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
