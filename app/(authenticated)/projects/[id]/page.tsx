"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	serverTimestamp,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AuthUserSearch } from "@/components/auth-user-search";
import { TaskCard } from "@/components/task-card";
import { useMyProjectRole } from "@/hooks/use-my-project-role";
import { usePersonas } from "@/hooks/use-personas";
import { useProject } from "@/hooks/use-project";
import { useProjectMembers } from "@/hooks/use-project-members";
import { useProjectTasks } from "@/hooks/use-project-tasks";
import { useResolveAuthUsers } from "@/hooks/use-resolve-auth-users";
import type { AuthUserRow } from "@/lib/auth-user-types";
import {
	dateOnlyToTimestamp,
	timestampToDateOnlyInput,
} from "@/lib/date-utils";
import { getFirestoreDb } from "@/lib/firebase";
import { getInitials } from "@/lib/persona-utils";
import type { PersonaSnapshot, Task, TaskStatus } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";

const COLUMNS: { status: TaskStatus; title: string }[] = [
	{ status: "todo", title: "A fazer" },
	{ status: "in_progress", title: "Em andamento" },
	{ status: "done", title: "Concluído" },
];

export default function ProjectDetailPage() {
	const params = useParams();
	const projectId = typeof params.id === "string" ? params.id : undefined;
	const { user } = useAuth();
	const { project, ready: projectReady } = useProject(projectId);
	const { data: tasks } = useProjectTasks(projectId);
	const { role, ready: roleReady } = useMyProjectRole(projectId, user?.uid);
	const { members, ready: membersReady } = useProjectMembers(projectId);
	const memberUids = useMemo(() => members.map((m) => m.userId), [members]);
	const memberProfiles = useResolveAuthUsers(memberUids, user);
	const { data: personas } = usePersonas(user?.uid);

	const [memberMsg, setMemberMsg] = useState<string | null>(null);
	const [memberSaving, setMemberSaving] = useState(false);
	const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

	const [taskOpen, setTaskOpen] = useState(false);
	const [editing, setEditing] = useState<Task | null>(null);
	const [taskTitle, setTaskTitle] = useState("");
	const [taskDescription, setTaskDescription] = useState("");
	const [taskDue, setTaskDue] = useState("");
	const [taskStatus, setTaskStatus] = useState<TaskStatus>("todo");
	const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
	const [taskSaving, setTaskSaving] = useState(false);
	const [taskError, setTaskError] = useState<string | null>(null);

	const isOwner = roleReady && role === "owner";
	/** Só o dono registrado no projeto pode remover membros (não basta ser “membro com papel”). */
	const canRemoveProjectMembers = Boolean(
		project && user?.uid && user.uid === project.ownerId,
	);

	const tasksByColumn = useMemo(() => {
		const m: Record<TaskStatus, Task[]> = {
			todo: [],
			in_progress: [],
			done: [],
		};
		for (const t of tasks) {
			if (m[t.status]) m[t.status].push(t);
			else m.todo.push(t);
		}
		return m;
	}, [tasks]);

	const openNewTask = () => {
		setEditing(null);
		setTaskTitle("");
		setTaskDescription("");
		setTaskDue("");
		setTaskStatus("todo");
		setSelectedPersonaIds([]);
		setTaskError(null);
		setTaskOpen(true);
	};

	const openEditTask = (t: Task) => {
		setEditing(t);
		setTaskTitle(t.title);
		setTaskDescription(t.description ?? "");
		setTaskDue(timestampToDateOnlyInput(t.dueDate ?? undefined));
		setTaskStatus(t.status);
		setSelectedPersonaIds(
			t.personaSnapshots
				.map((s) => s.personaId)
				.filter((id): id is string => !!id),
		);
		setTaskError(null);
		setTaskOpen(true);
	};

	const buildSnapshots = (): PersonaSnapshot[] => {
		const list: PersonaSnapshot[] = [];
		const map = new Map(personas.map((p) => [p.id, p]));
		for (const id of selectedPersonaIds) {
			const p = map.get(id);
			if (!p) continue;
			list.push({
				personaId: p.id,
				displayName: p.displayName,
				initials: getInitials(p.displayName),
				colorKey: p.colorKey ?? null,
			});
		}
		return list;
	};

	const saveTask = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!projectId || !user) return;
		setTaskError(null);
		setTaskSaving(true);
		try {
			const db = getFirestoreDb();
			const dueTs = dateOnlyToTimestamp(taskDue);
			const snaps = buildSnapshots();
			const base = {
				title: taskTitle.trim(),
				description: taskDescription.trim() || null,
				dueDate: dueTs,
				status: taskStatus,
				personaSnapshots: snaps,
				updatedAt: serverTimestamp(),
				completedAt: taskStatus === "done" ? serverTimestamp() : null,
			};
			if (editing) {
				await updateDoc(
					doc(db, "projects", projectId, "tasks", editing.id),
					base,
				);
			} else {
				await addDoc(collection(db, "projects", projectId, "tasks"), {
					...base,
					sortOrder: Date.now(),
					createdBy: user.uid,
					assigneeUserId: null,
					createdAt: serverTimestamp(),
				});
			}
			setTaskOpen(false);
		} catch {
			setTaskError("Não foi possível salvar a tarefa.");
		} finally {
			setTaskSaving(false);
		}
	};

	const setTaskColStatus = async (task: Task, status: TaskStatus) => {
		if (!projectId) return;
		const db = getFirestoreDb();
		await updateDoc(doc(db, "projects", projectId, "tasks", task.id), {
			status,
			updatedAt: serverTimestamp(),
			completedAt: status === "done" ? serverTimestamp() : null,
		});
	};

	const removeTask = async (task: Task) => {
		if (!projectId || !confirm("Excluir esta tarefa?")) return;
		const db = getFirestoreDb();
		await deleteDoc(doc(db, "projects", projectId, "tasks", task.id));
	};

	const addMemberFromPick = async (row: AuthUserRow) => {
		if (!projectId || !user?.uid) return;
		const uid = row.uid?.trim();
		if (!uid) return;
		setMemberMsg(null);
		setMemberSaving(true);
		try {
			const db = getFirestoreDb();
			await setDoc(doc(db, "projects", projectId, "members", uid), {
				userId: uid,
				role: "member",
				joinedAt: serverTimestamp(),
				invitedBy: user.uid,
			});
			setMemberMsg("Membro adicionado.");
		} catch {
			setMemberMsg("Não foi possível adicionar o membro. Tente novamente.");
		} finally {
			setMemberSaving(false);
		}
	};

	const removeMember = async (memberUserId: string) => {
		if (!projectId || !user?.uid || !project || user.uid !== project.ownerId)
			return;
		if (memberUserId === project.ownerId) return;
		if (!confirm("Remover esta pessoa do projeto?")) return;
		setMemberMsg(null);
		setRemovingMemberId(memberUserId);
		try {
			const db = getFirestoreDb();
			await deleteDoc(doc(db, "projects", projectId, "members", memberUserId));
			setMemberMsg("Membro removido.");
		} catch {
			setMemberMsg("Não foi possível remover o membro.");
		} finally {
			setRemovingMemberId(null);
		}
	};

	if (!projectId) {
		return <p className="text-sm text-zinc-500">Projeto inválido.</p>;
	}

	if (!projectReady || project === undefined) {
		return <p className="text-sm text-zinc-500">Carregando projeto…</p>;
	}

	if (project === null) {
		return (
			<div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
				<p className="text-sm">
					Projeto não encontrado ou você não tem acesso.
				</p>
				<Link
					href="/projects"
					className="mt-2 inline-block text-sm font-medium underline"
				>
					Voltar aos projetos
				</Link>
			</div>
		);
	}

	return (
		<div>
			<Link
				href="/projects"
				className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
			>
				← Projetos
			</Link>
			<header className="mt-4 flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						{project.title}
					</h1>
					{project.description && (
						<p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
							{project.description}
						</p>
					)}
					{project.dueDate && (
						<p className="mt-2 text-sm text-zinc-500">
							Prazo do projeto:{" "}
							{format(project.dueDate.toDate(), "d MMMM yyyy", {
								locale: ptBR,
							})}
						</p>
					)}
				</div>
				<button
					type="button"
					onClick={openNewTask}
					className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
				>
					Nova tarefa
				</button>
			</header>

			{roleReady && role !== null && (
				<section className="mt-8 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
					{isOwner && (
						<>
							<h2 className="text-sm font-medium">Adicionar membro</h2>
							<p className="mt-1 text-xs text-zinc-500">
								Busque entre os usuários já cadastrados no Firebase
								Authentication e clique no nome para adicionar ao projeto.
							</p>
							<div className="mt-3 max-w-xl">
								<AuthUserSearch
									currentUser={user}
									onUserPicked={(u) => void addMemberFromPick(u)}
									excludeUid={user?.uid}
									excludeUids={memberUids}
									disabled={memberSaving}
								/>
							</div>
							{memberMsg && (
								<p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
									{memberMsg}
								</p>
							)}
						</>
					)}

					<div
						className={
							isOwner
								? "mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-700"
								: ""
						}
					>
						<h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
							Membros
							{membersReady ? (
								<span className="ml-2 font-normal text-zinc-500">
									({members.length})
								</span>
							) : null}
						</h2>
						{!membersReady ? (
							<p className="mt-2 text-xs text-zinc-500">Carregando membros…</p>
						) : members.length === 0 ? (
							<p className="mt-2 text-xs text-zinc-500">
								Nenhum membro listado.
							</p>
						) : (
							<ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
								{members.map((m) => {
									const prof = memberProfiles[m.userId];
									const primary = prof?.displayName ?? prof?.email ?? m.userId;
									const secondary =
										prof?.displayName && prof?.email && primary !== prof.email
											? prof.email
											: null;
									const canRemove =
										canRemoveProjectMembers && m.userId !== project.ownerId;
									return (
										<li
											key={m.userId}
											className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
										>
											<div className="min-w-0 flex-1">
												<span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
													{primary}
												</span>
												{m.userId === user?.uid ? (
													<span className="ml-2 text-xs font-normal text-zinc-500">
														(você)
													</span>
												) : null}
												{secondary ? (
													<p className="mt-0.5 truncate text-xs text-zinc-500">
														{secondary}
													</p>
												) : null}
											</div>
											<div className="flex shrink-0 items-center gap-2">
												<div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-2">
													<span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
														{m.role === "owner" ? "Dono" : "Membro"}
													</span>
													{m.joinedAt ? (
														<span className="text-xs text-zinc-500">
															desde{" "}
															{format(m.joinedAt.toDate(), "d MMM yyyy", {
																locale: ptBR,
															})}
														</span>
													) : null}
												</div>
												{canRemove ? (
													<button
														type="button"
														className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-lg leading-none text-zinc-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
														aria-label={`Remover ${primary} do projeto`}
														disabled={removingMemberId !== null}
														onClick={() => void removeMember(m.userId)}
													>
														{removingMemberId === m.userId ? "…" : "×"}
													</button>
												) : null}
											</div>
										</li>
									);
								})}
							</ul>
						)}
					</div>
				</section>
			)}

			{roleReady && role === null && (
				<p className="mt-6 text-sm text-amber-700 dark:text-amber-300">
					Você não é membro deste projeto.
				</p>
			)}

			<section className="mt-8">
				<h2 className="sr-only">Quadro Kanban</h2>
				<div className="grid gap-4 lg:grid-cols-3">
					{COLUMNS.map((col) => (
						<div
							key={col.status}
							className="rounded-xl border border-zinc-200 bg-zinc-100/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/50"
						>
							<h3 className="mb-3 px-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
								{col.title}
								<span className="ml-2 font-normal text-zinc-500">
									({tasksByColumn[col.status].length})
								</span>
							</h3>
							<div className="flex flex-col gap-3">
								{tasksByColumn[col.status].length === 0 ? (
									<p className="px-1 text-xs text-zinc-500">Área limpa.</p>
								) : (
									tasksByColumn[col.status].map((t) => (
										<TaskCard
											key={t.id}
											task={t}
											onEdit={() => openEditTask(t)}
											onStatus={(s) => void setTaskColStatus(t, s)}
											onDelete={() => void removeTask(t)}
										/>
									))
								)}
							</div>
						</div>
					))}
				</div>
			</section>

			{taskOpen && (
				<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
					<div
						className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
						role="dialog"
						aria-modal
						aria-labelledby="task-dialog-title"
					>
						<h2 id="task-dialog-title" className="text-lg font-semibold">
							{editing ? "Editar tarefa" : "Nova tarefa"}
						</h2>
						<form onSubmit={(e) => void saveTask(e)} className="mt-4 space-y-4">
							<div>
								<label
									htmlFor="task-title"
									className="block text-sm font-medium"
								>
									Título
								</label>
								<input
									id="task-title"
									className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
									value={taskTitle}
									onChange={(e) => setTaskTitle(e.target.value)}
									required
								/>
							</div>
							<div>
								<label
									htmlFor="task-description"
									className="block text-sm font-medium"
								>
									Descrição
								</label>
								<textarea
									id="task-description"
									className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
									rows={2}
									value={taskDescription}
									onChange={(e) => setTaskDescription(e.target.value)}
								/>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label
										htmlFor="task-due"
										className="block text-sm font-medium"
									>
										Prazo (opcional)
									</label>
									<input
										id="task-due"
										type="date"
										className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
										value={taskDue}
										onChange={(e) => setTaskDue(e.target.value)}
									/>
								</div>
								<div>
									<label
										htmlFor="task-status"
										className="block text-sm font-medium"
									>
										Status
									</label>
									<select
										id="task-status"
										className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
										value={taskStatus}
										onChange={(e) =>
											setTaskStatus(e.target.value as TaskStatus)
										}
									>
										{COLUMNS.map((c) => (
											<option key={c.status} value={c.status}>
												{c.title}
											</option>
										))}
									</select>
								</div>
							</div>
							<div>
								<span className="block text-sm font-medium">
									Personas da sua agenda
								</span>
								<p className="mt-1 text-xs text-zinc-500">
									Vincula contatos à tarefa (outros membros veem só nome e
									iniciais).
								</p>
								<ul className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-700">
									{personas.length === 0 ? (
										<li className="text-xs text-zinc-500">
											Nenhuma persona cadastrada.{" "}
											<Link href="/personas" className="underline">
												Criar na agenda
											</Link>
										</li>
									) : (
										personas.map((p) => (
											<li key={p.id}>
												<label className="flex cursor-pointer items-center gap-2 text-sm">
													<input
														type="checkbox"
														checked={selectedPersonaIds.includes(p.id)}
														onChange={(e) => {
															if (e.target.checked) {
																setSelectedPersonaIds((ids) => [...ids, p.id]);
															} else {
																setSelectedPersonaIds((ids) =>
																	ids.filter((x) => x !== p.id),
																);
															}
														}}
													/>
													{p.displayName}
												</label>
											</li>
										))
									)}
								</ul>
							</div>
							{taskError && <p className="text-sm text-red-600">{taskError}</p>}
							<div className="flex justify-end gap-2 pt-2">
								<button
									type="button"
									onClick={() => setTaskOpen(false)}
									className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
								>
									Cancelar
								</button>
								<button
									type="submit"
									disabled={taskSaving}
									className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
								>
									{taskSaving ? "Salvando…" : "Salvar"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
