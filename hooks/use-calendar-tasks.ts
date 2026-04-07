"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  collectionGroup,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useMemo } from "react";
import { getFirestoreDb } from "@/lib/firebase";
import { mapTaskDoc } from "@/lib/firestore-map";
import type { Task } from "@/lib/types";

export type CalendarTaskItem = Task & { projectId: string; projectTitle: string };

export function useCalendarTasks(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["calendar-tasks", userId] as const, [userId]);

  useEffect(() => {
    if (!userId) return;

    let childUnsubs: Array<() => void> = [];
    const db = getFirestoreDb();
    const itemsMap = new Map<string, CalendarTaskItem>();
    const projectTitles = new Map<string, string>();

    const push = () => {
      queryClient.setQueryData<CalendarTaskItem[]>(
        queryKey,
        [...itemsMap.values()].sort((a, b) => {
          const ta = a.dueDate?.toMillis?.() ?? 0;
          const tb = b.dueDate?.toMillis?.() ?? 0;
          return ta - tb;
        }),
      );
    };

    const unsubMembers = onSnapshot(
      query(
        collectionGroup(db, "members"),
        where("userId", "==", userId),
      ),
      (memberSnap) => {
        childUnsubs.forEach((u) => u());
        childUnsubs = [];
        itemsMap.clear();
        projectTitles.clear();

        const projectIds = [
          ...new Set(
            memberSnap.docs
              .map((d) => d.ref.parent.parent?.id)
              .filter((id): id is string => !!id),
          ),
        ];

        if (projectIds.length === 0) {
          queryClient.setQueryData(queryKey, []);
          return;
        }

        projectIds.forEach((pid) => {
          const pu = onSnapshot(doc(db, "projects", pid), (ps) => {
            if (ps.exists()) {
              projectTitles.set(pid, (ps.data().title as string) || "Projeto");
            }
            for (const [k, item] of itemsMap) {
              if (item.projectId === pid) {
                itemsMap.set(k, {
                  ...item,
                  projectTitle: projectTitles.get(pid) ?? item.projectTitle,
                });
              }
            }
            push();
          });
          childUnsubs.push(pu);

          const tu = onSnapshot(collection(db, "projects", pid, "tasks"), (snap) => {
            for (const itemKey of [...itemsMap.keys()]) {
              if (itemKey.startsWith(`${pid}_`)) itemsMap.delete(itemKey);
            }
            snap.docs.forEach((d) => {
              const task = mapTaskDoc(d);
              if (!task.dueDate) return;
              const cid = `${pid}_${d.id}`;
              itemsMap.set(cid, {
                ...task,
                projectId: pid,
                projectTitle: projectTitles.get(pid) ?? "Projeto",
              });
            });
            push();
          });
          childUnsubs.push(tu);
        });
      },
      () => {
        queryClient.setQueryData(queryKey, []);
      },
    );

    return () => {
      unsubMembers();
      childUnsubs.forEach((u) => u());
    };
  }, [queryClient, queryKey, userId]);

  return useQuery({
    queryKey: queryKey,
    queryFn: () => [] as CalendarTaskItem[],
    enabled: !!userId,
    initialData: [],
  });
}
