"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { getFirestoreDb } from "@/lib/firebase";
import { mapProjectDoc } from "@/lib/firestore-map";
import type { Project } from "@/lib/types";

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setProject(undefined);
      setReady(false);
      return;
    }
    const db = getFirestoreDb();
    const unsub = onSnapshot(
      doc(db, "projects", projectId),
      (snap) => {
        if (!snap.exists()) setProject(null);
        else setProject(mapProjectDoc(snap));
        setReady(true);
      },
      () => {
        setProject(null);
        setReady(true);
      },
    );
    return unsub;
  }, [projectId]);

  return { project, ready };
}
