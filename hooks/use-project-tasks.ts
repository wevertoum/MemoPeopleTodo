"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useMemo } from "react";
import { getFirestoreDb } from "@/lib/firebase";
import { mapTaskDoc } from "@/lib/firestore-map";
import type { Task } from "@/lib/types";

export function useProjectTasks(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["tasks", projectId] as const, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    const db = getFirestoreDb();
    const q = query(collection(db, "projects", projectId, "tasks"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(mapTaskDoc);
        list.sort((a, b) => {
          const ao = a.sortOrder ?? a.createdAt?.toMillis?.() ?? 0;
          const bo = b.sortOrder ?? b.createdAt?.toMillis?.() ?? 0;
          return ao - bo;
        });
        queryClient.setQueryData(queryKey, list);
      },
      () => {
        queryClient.setQueryData(queryKey, []);
      },
    );
    return unsub;
  }, [queryClient, queryKey, projectId]);

  return useQuery({
    queryKey: queryKey,
    queryFn: () => [] as Task[],
    enabled: !!projectId,
    initialData: [],
  });
}
