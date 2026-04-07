"use client";

import type { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { adminApiFetch } from "@/lib/admin-api";
import type { AuthUserRow } from "@/lib/auth-user-types";

/**
 * Resolve UIDs para e-mail/nome via Admin SDK (quando o servidor está configurado).
 */
export function useResolveAuthUsers(uids: string[], user: User | null) {
  const [profiles, setProfiles] = useState<Record<string, AuthUserRow>>({});

  const uidsKey = JSON.stringify([...new Set(uids)].sort());

  useEffect(() => {
    if (!user || uidsKey === "[]") {
      setProfiles((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }
    const unique = JSON.parse(uidsKey) as string[];
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await adminApiFetch(user, "/api/admin/auth-users/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uids: unique }),
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { users?: AuthUserRow[] };
        if (!res.ok) return;
        const next: Record<string, AuthUserRow> = {};
        for (const row of data.users ?? []) {
          next[row.uid] = row;
        }
        setProfiles(next);
      } catch {
        if (!ctrl.signal.aborted) {
          setProfiles((prev) => (Object.keys(prev).length === 0 ? prev : {}));
        }
      }
    })();
    return () => ctrl.abort();
  }, [user, uidsKey]);

  return profiles;
}
