"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api";
import type { AuthUserRow } from "@/lib/auth-user-types";
import { useAuth } from "@/providers/auth-provider";

export default function UsersPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [list, setList] = useState<AuthUserRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listErr, setListErr] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    if (!user) return;
    setListLoading(true);
    setListErr(null);
    try {
      const res = await adminApiFetch(user, "/api/admin/auth-users");
      const data = (await res.json()) as { users?: AuthUserRow[]; error?: string };
      if (!res.ok) {
        setListErr(data.error ?? "Não foi possível listar usuários.");
        setList([]);
        return;
      }
      setList(data.users ?? []);
    } catch {
      setListErr("Falha ao carregar lista.");
      setList([]);
    } finally {
      setListLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErr(null);
    setMsg(null);
    setSubmitting(true);
    try {
      const res = await adminApiFetch(user, "/api/admin/auth-users", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Não foi possível criar o usuário.");
        return;
      }
      setMsg("Usuário criado. Ele já pode entrar com e-mail e senha.");
      setEmail("");
      setPassword("");
      void loadList();
    } catch {
      setErr("Erro de rede.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
        Aqui você administra as contas que podem acessar o sistema. Essas pessoas também podem ser vinculadas como
        membros nos projetos.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-medium">Novo usuário</h2>
          <form onSubmit={(e) => void onSubmit(e)} className="mt-4 space-y-4">
            <div>
              <label htmlFor="nu-email" className="block text-sm font-medium">
                E-mail
              </label>
              <input
                id="nu-email"
                type="email"
                autoComplete="off"
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="nu-password" className="block text-sm font-medium">
                Senha
              </label>
              <input
                id="nu-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {err && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {err}
              </p>
            )}
            {msg && <p className="text-sm text-emerald-700 dark:text-emerald-400">{msg}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {submitting ? "Criando…" : "Cadastrar usuário"}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium">Usuários no Authentication</h2>
            <button
              type="button"
              onClick={() => void loadList()}
              className="text-xs text-zinc-600 underline dark:text-zinc-400"
            >
              Atualizar lista
            </button>
          </div>
          {listLoading && <p className="mt-4 text-sm text-zinc-500">Carregando…</p>}
          {!listLoading && listErr && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">{listErr}</p>
          )}
          {!listLoading && !listErr && list.length === 0 && (
            <p className="mt-4 text-sm text-zinc-500">Nenhum usuário encontrado.</p>
          )}
          {!listLoading && !listErr && list.length > 0 && (
            <ul className="mt-4 max-h-[min(420px,60vh)] space-y-2 overflow-y-auto text-sm">
              {list.map((u) => (
                <li
                  key={u.uid}
                  className="rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800"
                >
                  <div className="font-medium">{u.email ?? "(sem e-mail)"}</div>
                  {u.displayName && <div className="text-xs text-zinc-500">{u.displayName}</div>}
                  <div className="mt-1 font-mono text-[11px] text-zinc-400">{u.uid}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
