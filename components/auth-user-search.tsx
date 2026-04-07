"use client";

import type { User } from "firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api";
import type { AuthUserRow } from "@/lib/auth-user-types";

type Props = {
  currentUser: User | null;
  /** UIDs que não devem aparecer nos resultados (ex.: o próprio usuário logado). */
  excludeUid?: string;
  /** UIDs adicionais a ocultar (ex.: quem já é membro do projeto). */
  excludeUids?: readonly string[];
  disabled?: boolean;
} & (
  | {
      /** Clique na lista confirma a escolha (ex.: abre modal); mostra resumo + “Alterar”. */
      selected: AuthUserRow | null;
      onSelect: (u: AuthUserRow | null) => void;
      onUserPicked?: undefined;
    }
  | {
      /** Clique na lista dispara a ação direto, sem passo extra. */
      onUserPicked: (u: AuthUserRow) => void | Promise<void>;
      selected?: undefined;
      onSelect?: undefined;
    }
);

export function AuthUserSearch({
  currentUser,
  selected,
  onSelect,
  onUserPicked,
  excludeUid,
  excludeUids,
  disabled,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AuthUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const fetchUsers = useCallback(
    async (q: string) => {
      if (!currentUser) return;
      setLoading(true);
      setError(null);
      try {
        const url = q.trim()
          ? `/api/admin/auth-users?q=${encodeURIComponent(q.trim())}`
          : "/api/admin/auth-users";
        const res = await adminApiFetch(currentUser, url);
        const data = (await res.json()) as { users?: AuthUserRow[]; error?: string };
        if (!res.ok) {
          setResults([]);
          setError(data.error ?? "Não foi possível buscar usuários.");
          return;
        }
        const list = data.users ?? [];
        const excluded = new Set<string>();
        if (excludeUid) excluded.add(excludeUid);
        for (const id of excludeUids ?? []) {
          if (id) excluded.add(id);
        }
        setResults(list.filter((u) => !excluded.has(u.uid)));
      } catch {
        setResults([]);
        setError("Falha na busca.");
      } finally {
        setLoading(false);
      }
    },
    [currentUser, excludeUid, excludeUids],
  );

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!currentUser) return;
    timer.current = setTimeout(() => {
      void fetchUsers(query);
    }, 320);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query, currentUser, fetchUsers]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!onUserPicked && selected) {
    return (
      <div className="flex min-w-[240px] flex-1 flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950">
          <span className="font-medium">{selected.email ?? selected.uid}</span>
          {selected.displayName && (
            <span className="ml-2 text-zinc-500">({selected.displayName})</span>
          )}
        </div>
        <button
          type="button"
          disabled={disabled}
          className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
          onClick={() => {
            onSelect?.(null);
            setQuery("");
            setOpen(true);
          }}
        >
          Alterar
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="relative min-w-[240px] flex-1">
      <label className="sr-only" htmlFor="auth-user-search">
        Buscar usuário por e-mail ou nome
      </label>
      <input
        id="auth-user-search"
        type="search"
        autoComplete="off"
        disabled={disabled}
        placeholder="Buscar por e-mail ou nome…"
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          void fetchUsers(query);
        }}
      />
      {open && !(selected && !onUserPicked) && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {loading && <li className="px-3 py-2 text-zinc-500">Buscando…</li>}
          {!loading && error && <li className="px-3 py-2 text-red-600">{error}</li>}
          {!loading && !error && results.length === 0 && (
            <li className="px-3 py-2 text-zinc-500">Nenhum usuário encontrado.</li>
          )}
          {!loading &&
            !error &&
            results.map((u) => (
              <li key={u.uid}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={() => {
                    if (onUserPicked) {
                      void Promise.resolve(onUserPicked(u));
                      setOpen(false);
                      setQuery("");
                    } else {
                      onSelect?.(u);
                      setOpen(false);
                    }
                  }}
                >
                  <span className="block font-medium">{u.email ?? u.uid}</span>
                  {u.displayName && <span className="text-xs text-zinc-500">{u.displayName}</span>}
                  <span className="sr-only"> UID {u.uid}</span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
