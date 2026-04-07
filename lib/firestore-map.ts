import type { DocumentData, DocumentSnapshot } from "firebase/firestore";
import type { MemberRole, Persona, Project, ProjectMember, Task } from "@/lib/types";

export function mapProjectMemberDoc(snap: DocumentSnapshot<DocumentData>): ProjectMember {
  const d = snap.data() ?? {};
  const role = d.role as MemberRole | undefined;
  const safeRole: MemberRole = role === "owner" || role === "member" ? role : "member";
  return {
    userId: typeof d.userId === "string" ? d.userId : snap.id,
    role: safeRole,
    joinedAt: d.joinedAt,
    invitedBy: typeof d.invitedBy === "string" ? d.invitedBy : undefined,
  };
}

export function mapProjectDoc(snap: DocumentSnapshot<DocumentData>): Project {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    title: d.title ?? "",
    description: d.description,
    ownerId: d.ownerId ?? "",
    startDate: d.startDate ?? null,
    dueDate: d.dueDate ?? null,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export function mapPersonaDoc(snap: DocumentSnapshot<DocumentData>): Persona {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    displayName: d.displayName ?? "",
    notes: d.notes ?? "",
    colorKey: d.colorKey,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export function mapTaskDoc(snap: DocumentSnapshot<DocumentData>): Task {
  const d = snap.data() ?? {};
  return {
    id: snap.id,
    title: d.title ?? "",
    description: d.description,
    status: d.status ?? "todo",
    dueDate: d.dueDate ?? null,
    sortOrder: d.sortOrder,
    createdBy: d.createdBy ?? "",
    assigneeUserId: d.assigneeUserId ?? null,
    personaSnapshots: Array.isArray(d.personaSnapshots) ? d.personaSnapshots : [],
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    completedAt: d.completedAt ?? null,
  };
}
