"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getFirestoreDb } from "@/lib/firebase";
import type { MemberRole } from "@/lib/types";

export function useMyProjectRole(projectId: string | undefined, userId: string | undefined) {
  const [role, setRole] = useState<MemberRole | null | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!projectId || !userId) {
      setRole(undefined);
      setReady(false);
      return;
    }
    const db = getFirestoreDb();
    const unsub = onSnapshot(
      doc(db, "projects", projectId, "members", userId),
      (snap) => {
        if (!snap.exists()) setRole(null);
        else setRole((snap.data().role as MemberRole) ?? null);
        setReady(true);
      },
      () => {
        setRole(null);
        setReady(true);
      },
    );
    return unsub;
  }, [projectId, userId]);

  return { role, ready };
}
