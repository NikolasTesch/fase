"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Loader2, ShieldCheck, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "T1_GERENCIA" | "T2_VENDEDOR";

type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
};

const ROLE_LABELS: Record<Role, string> = {
  T1_GERENCIA: "T1 · Gerência",
  T2_VENDEDOR: "T2 · Vendedor",
};

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "T1_GERENCIA", label: "T1 · Gerência" },
  { value: "T2_VENDEDOR", label: "T2 · Vendedor" },
];

function RolePill({ role }: { role: Role }) {
  const isT1 = role === "T1_GERENCIA";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        isT1 ? "bg-brand/15 text-brand" : "bg-accent/15 text-accent",
      )}
    >
      {isT1 ? <ShieldCheck size={11} /> : <Shield size={11} />}
      {ROLE_LABELS[role]}
    </span>
  );
}

function StatusPill({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Ativo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
      Inativo
    </span>
  );
}

function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}

const inputClass =
  "w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring";

interface UsuariosClientProps {
  users: AdminUserRow[];
  currentUserId: string | undefined;
}

export function UsuariosClient({ users, currentUserId }: UsuariosClientProps) {
  const router = useRouter();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "T2_VENDEDOR" as Role,
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [editing, setEditing] = useState<AdminUserRow | null>(null);
  const [editRole, setEditRole] = useState<Role>("T2_VENDEDOR");
  const [editActive, setEditActive] = useState(true);
  const [editPassword, setEditPassword] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  function openCreate() {
    setCreateForm({ name: "", email: "", password: "", role: "T2_VENDEDOR" });
    setCreateError(null);
    setCreateOpen(true);
  }

  function openEdit(user: AdminUserRow) {
    setEditing(user);
    setEditRole(user.role);
    setEditActive(user.isActive);
    setEditPassword("");
    setEditError(null);
  }

  async function handleCreate() {
    const name = createForm.name.trim();
    if (name.length < 2) {
      setCreateError("O nome deve ter no mínimo 2 caracteres");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(createForm.email)) {
      setCreateError("E-mail inválido");
      return;
    }
    if (createForm.password.length < 8) {
      setCreateError("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCreateError(data.message ?? "Erro ao criar usuário");
        return;
      }
      setCreateOpen(false);
      router.refresh();
    } catch {
      setCreateError("Erro de conexão. Tente novamente.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveEdit() {
    if (editPassword && editPassword.length < 8) {
      setEditError("A nova senha deve ter no mínimo 8 caracteres");
      return;
    }

    setSavingEdit(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/admin/users/${editing!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editRole,
          isActive: editActive,
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditError(data.message ?? "Erro ao salvar");
        return;
      }
      setEditing(null);
      router.refresh();
    } catch {
      setEditError("Erro de conexão. Tente novamente.");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {users.length} usuário{users.length !== 1 ? "s" : ""} com acesso ao
            painel administrativo
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Novo usuário
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {["Nome", "E-mail", "Papel", "Status", "Criado em", "Ações"].map(
                (label) => (
                  <th
                    key={label}
                    className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider"
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {users.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="border-t border-border hover:bg-muted/40 transition-colors duration-150"
                >
                  <td className="px-4 py-3.5 font-medium">
                    {user.name}
                    {user.id === currentUserId ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (você)
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-4 py-3.5">
                    <RolePill role={user.role} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusPill active={user.isActive} />
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(user)}
                    >
                      <Pencil />
                      Editar
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>

            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhum usuário cadastrado.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog: Novo usuário */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Novo usuário</DialogTitle>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Nome
              </label>
              <input
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                placeholder="Nome completo"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                placeholder="email@fasesport.com"
                autoComplete="off"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Senha
              </label>
              <input
                type="password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Papel
              </label>
              <select
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    role: e.target.value as Role,
                  })
                }
                className={inputClass}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <FieldError message={createError} />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                disabled={creating}
                onClick={() => setCreateOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar usuário"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar usuário */}
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle>Editar usuário</DialogTitle>
          {editing && (
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Nome
                </label>
                <p className="text-sm font-medium">{editing.name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  E-mail
                </label>
                <p className="text-sm text-muted-foreground">{editing.email}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Papel
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                  className={inputClass}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="edit-active"
                  type="checkbox"
                  checked={editActive}
                  disabled={editing.id === currentUserId}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="size-4 accent-[var(--brand)] disabled:opacity-40"
                />
                <label
                  htmlFor="edit-active"
                  className={cn(
                    "text-sm",
                    editing.id === currentUserId
                      ? "text-muted-foreground"
                      : "text-foreground",
                  )}
                >
                  Ativo
                  {editing.id === currentUserId ? (
                    <span className="block text-xs text-muted-foreground">
                      Você não pode desativar a si mesmo.
                    </span>
                  ) : null}
                </label>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Nova senha{" "}
                  <span className="font-normal">(opcional)</span>
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Deixe em branco para manter"
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>

              <FieldError message={editError} />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  disabled={savingEdit}
                  onClick={() => setEditing(null)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} disabled={savingEdit}>
                  {savingEdit ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
