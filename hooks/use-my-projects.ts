"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collectionGroup,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useMemo } from "react";
import { getFirestoreDb } from "@/lib/firebase";
import { mapProjectDoc } from "@/lib/firestore-map";
import type { MemberRole, Project } from "@/lib/types";

export type ProjectSummary = Project & { myRole: MemberRole };

function mergeSummaries(
  projects: Map<string, Project>,
  roles: Map<string, MemberRole>,
): ProjectSummary[] {
  const out: ProjectSummary[] = [];
  for (const [id, p] of projects) {
    const role = roles.get(id) ?? "member";
    out.push({ ...p, myRole: role });
  }
  return out.sort((a, b) => {
    const am = a.updatedAt?.toMillis?.() ?? 0;
    const bm = b.updatedAt?.toMillis?.() ?? 0;
    return bm - am;
  });
}

export function useMyProjects(userId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["my-projects", userId] as const, [userId]);

  useEffect(() => {
    if (!userId) return;

    let projectUnsubs: Array<() => void> = [];
    const db = getFirestoreDb();
    const projectsMap = new Map<string, Project>();
    const rolesMap = new Map<string, MemberRole>();

    const pushCache = () => {
      queryClient.setQueryData<ProjectSummary[]>(
        queryKey,
        mergeSummaries(projectsMap, rolesMap),
      );
    };

    const unsubMembers = onSnapshot(
      query(
        collectionGroup(db, "members"),
        where("userId", "==", userId),
      ),
      (memberSnap) => {
        projectUnsubs.forEach((u) => u());
        projectUnsubs = [];
        projectsMap.clear();
        rolesMap.clear();

        memberSnap.docs.forEach((d) => {
          const parent = d.ref.parent.parent;
          if (!parent) return;
          const projectId = parent.id;
          const role = (d.data().role as MemberRole) ?? "member";
          rolesMap.set(projectId, role);
        });

        const projectIds = [...rolesMap.keys()];

        if (projectIds.length === 0) {
          queryClient.setQueryData(queryKey, []);
          return;
        }

        projectIds.forEach((pid) => {
          const u = onSnapshot(doc(db, "projects", pid), (ps) => {
            if (!ps.exists()) {
              projectsMap.delete(pid);
              pushCache();
              return;
            }
            projectsMap.set(pid, mapProjectDoc(ps));
            pushCache();
          });
          projectUnsubs.push(u);
        });
      },
      (err) => {
        console.error(err);
        queryClient.setQueryData(queryKey, []);
      },
    );

    return () => {
      unsubMembers();
      projectUnsubs.forEach((u) => u());
    };
  }, [queryClient, queryKey, userId]);

  return useQuery({
    queryKey: queryKey,
    queryFn: () => [] as ProjectSummary[],
    enabled: !!userId,
    initialData: [],
  });
}
