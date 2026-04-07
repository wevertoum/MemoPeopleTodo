"use client";

import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { dateOnlyToTimestamp } from "@/lib/date-utils";
import { getFirestoreDb } from "@/lib/firebase";
import { useMyProjects } from "@/hooks/use-my-projects";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { data: projects, isFetched, isError } = useMyProjects(user?.uid);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null);
    setSaving(true);
    try {
      const db = getFirestoreDb();
      const batch = writeBatch(db);
      const pref = doc(collection(db, "projects"));
      const dueTs = dateOnlyToTimestamp(due);
      batch.set(pref, {
        title: title.trim(),
        description: description.trim() || null,
        ownerId: user.uid,
        startDate: null,
        dueDate: dueTs,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, "projects", pref.id, "members", user.uid), {
        userId: user.uid,
        role: "owner",
        joinedAt: serverTimestamp(),
      });
      await batch.commit();
      setTitle("");
      setDescription("");
      setDue("");
      setOpen(false);
    } catch {
      setFormError("Não foi possível criar o projeto. Verifique o Firebase e suas regras.");
    } finally {
      setSaving(false);
    }
  };

  const empty = isFetched && projects.length === 0;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Quadros compartilhados com sua equipe.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Novo projeto
        </button>
      </div>

      {open && (
        <form
          onSubmit={(e) => void createProject(e)}
          className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="font-medium">Novo projeto</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">Título</label>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium">Descrição (opcional)</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Prazo (opcional)</label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </div>
          </div>
          {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {saving ? "Salvando…" : "Criar"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {isError && (
        <p className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          Não foi possível carregar os projetos. Verifique a conexão e se as regras do Firestore permitem leitura para
          membros.
        </p>
      )}

      {!isFetched && !isError ? (
        <p className="mt-8 text-sm text-zinc-500">Carregando projetos…</p>
      ) : empty && !open ? (
        <p className="mt-8 text-sm text-zinc-500">
          Nenhum projeto ainda. Crie um para começar o quadro Kanban.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{p.title}</h2>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {p.myRole === "owner" ? "Dono" : "Membro"}
                  </span>
                </div>
                {p.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{p.description}</p>
                )}
                {p.dueDate && (
                  <p className="mt-3 text-xs text-zinc-500">
                    Prazo:{" "}
                    {format(p.dueDate.toDate(), "d MMM yyyy", { locale: ptBR })}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
