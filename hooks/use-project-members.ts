"use client";

import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getFirestoreDb } from "@/lib/firebase";
import { mapProjectMemberDoc } from "@/lib/firestore-map";
import type { ProjectMember } from "@/lib/types";

/** Referência estável: evita novo `[]` a cada render quando o snapshot ainda não chegou. */
const EMPTY_MEMBERS: ProjectMember[] = [];

export function useProjectMembers(projectId: string | undefined) {
  const [members, setMembers] = useState<ProjectMember[] | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setMembers(undefined);
      setReady(false);
      return;
    }
    const db = getFirestoreDb();
    const unsub = onSnapshot(
      collection(db, "projects", projectId, "members"),
      (snap) => {
        const list = snap.docs.map(mapProjectMemberDoc);
        list.sort((a, b) => {
          if (a.role === "owner" && b.role !== "owner") return -1;
          if (b.role === "owner" && a.role !== "owner") return 1;
          return a.userId.localeCompare(b.userId);
        });
        setMembers(list);
        setReady(true);
      },
      () => {
        setMembers([]);
        setReady(true);
      },
    );
    return unsub;
  }, [projectId]);

  return { members: members ?? EMPTY_MEMBERS, ready };
}
