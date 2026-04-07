import type { Timestamp } from "firebase/firestore";

export type MemberRole = "owner" | "member";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: Timestamp;
}

export interface Persona {
  id: string;
  displayName: string;
  notes: string;
  colorKey?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  startDate?: Timestamp | null;
  dueDate?: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProjectMember {
  userId: string;
  role: MemberRole;
  joinedAt?: Timestamp;
  invitedBy?: string;
}

export interface PersonaSnapshot {
  personaId?: string;
  displayName: string;
  initials: string;
  colorKey?: number | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: Timestamp | null;
  sortOrder?: number;
  createdBy: string;
  assigneeUserId?: string | null;
  personaSnapshots: PersonaSnapshot[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp | null;
}
