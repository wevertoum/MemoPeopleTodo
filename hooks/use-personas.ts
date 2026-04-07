"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useMemo } from "react";
import { getFirestoreDb } from "@/lib/firebase";
import { mapPersonaDoc } from "@/lib/firestore-map";
import type { Persona } from "@/lib/types";

export function usePersonas(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["personas", userId] as const, [userId]);

  useEffect(() => {
    if (!userId) return;
    const db = getFirestoreDb();
    const q = query(collection(db, "users", userId, "personas"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(mapPersonaDoc);
        list.sort(
          (a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0),
        );
        queryClient.setQueryData(queryKey, list);
      },
      () => {
        queryClient.setQueryData(queryKey, []);
      },
    );
    return unsub;
  }, [queryClient, queryKey, userId]);

  return useQuery({
    queryKey: queryKey,
    queryFn: () => [] as Persona[],
    enabled: !!userId,
    initialData: [],
  });
}
