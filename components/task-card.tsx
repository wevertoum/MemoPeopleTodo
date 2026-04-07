"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePersonas } from "@/hooks/use-personas";
import {
	avatarClassForColorKey,
	avatarClassFromName,
} from "@/lib/persona-utils";
import type { PersonaSnapshot, Task, TaskStatus } from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";

const statusLabels: Record<TaskStatus, string> = {
	todo: "A fazer",
	in_progress: "Em andamento",
	done: "Concluído",
};

export function TaskCard({
	task,
	onEdit,
	onStatus,
	onDelete,
}: {
	task: Task;
	onEdit: () => void;
	onStatus: (s: TaskStatus) => void;
	onDelete: () => void;
}) {
	const { user } = useAuth();
	const { data: personas } = usePersonas(user?.uid);
	const personaById = useMemo(
		() => new Map(personas.map((p) => [p.id, p])),
		[personas],
	);
	const [personaModal, setPersonaModal] = useState<PersonaSnapshot | null>(
		null,
	);

	const modalPersona = personaModal?.personaId
		? personaById.get(personaModal.personaId)
		: undefined;
	const personaModalHeaderClass = personaModal
		? personaModal.colorKey != null && personaModal.colorKey !== undefined
			? avatarClassForColorKey(personaModal.colorKey)
			: avatarClassFromName(personaModal.displayName)
		: "";

	useEffect(() => {
		if (!personaModal) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setPersonaModal(null);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [personaModal]);

	return (
		<article className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
			<div className="flex items-start justify-between gap-2">
				<button
					type="button"
					onClick={onEdit}
					className="text-left text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50"
				>
					{task.title}
				</button>
				<button
					type="button"
					onClick={onDelete}
					className="text-xs text-red-600 hover:underline dark:text-red-400"
					aria-label="Excluir tarefa"
				>
					Excluir
				</button>
			</div>
			{task.description && (
				<p className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
					{task.description}
				</p>
			)}
			{task.dueDate && (
				<p className="mt-2 text-xs text-zinc-500">
					Prazo: {format(task.dueDate.toDate(), "d MMM yyyy", { locale: ptBR })}
				</p>
			)}
			{task.personaSnapshots.length > 0 && (
				<div className="mt-2 flex flex-wrap gap-1">
					{task.personaSnapshots.map((p, i) => {
						const bg =
							p.colorKey != null && p.colorKey !== undefined
								? avatarClassForColorKey(p.colorKey)
								: avatarClassFromName(p.displayName);
						return (
							<div
								key={`${p.personaId ?? p.displayName}-${i}`}
								className="group relative"
							>
								<button
									type="button"
									onClick={() => setPersonaModal(p)}
									title={p.displayName}
									aria-label={`Ver detalhes de ${p.displayName}`}
									className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[10px] font-semibold text-white ring-offset-2 transition hover:ring-2 hover:ring-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:ring-offset-zinc-900 ${bg}`}
								>
									{p.initials}
								</button>
								<span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden w-max max-w-[200px] -translate-x-1/2 rounded-md bg-zinc-900 px-2 py-1 text-center text-xs font-medium text-white shadow-md group-hover:block dark:bg-zinc-100 dark:text-zinc-900">
									{p.displayName}
								</span>
							</div>
						);
					})}
				</div>
			)}
			<label className="mt-3 flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
				<span className="shrink-0">Coluna:</span>
				<select
					className="w-full rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-600 dark:bg-zinc-950"
					value={task.status}
					onChange={(e) => onStatus(e.target.value as TaskStatus)}
				>
					{(Object.keys(statusLabels) as TaskStatus[]).map((s) => (
						<option key={s} value={s}>
							{statusLabels[s]}
						</option>
					))}
				</select>
			</label>

			{personaModal && (
				<div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
					<button
						type="button"
						className="absolute inset-0 bg-black/40"
						aria-label="Fechar detalhes da persona"
						onClick={() => setPersonaModal(null)}
					/>
					<div
						className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
						role="dialog"
						aria-modal
						aria-labelledby="persona-modal-title"
					>
						<div className="flex items-start gap-4">
							<span
								className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${personaModalHeaderClass}`}
								aria-hidden
							>
								{personaModal.initials}
							</span>
							<div className="min-w-0 flex-1">
								<h2
									id="persona-modal-title"
									className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
								>
									{modalPersona?.displayName ?? personaModal.displayName}
								</h2>
								{modalPersona ? (
									<>
										{modalPersona.notes ? (
											<p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
												{modalPersona.notes}
											</p>
										) : (
											<p className="mt-2 text-sm text-zinc-500">
												Sem notas na agenda.
											</p>
										)}
										<p className="mt-3 text-xs text-zinc-500">
											Atualizada em{" "}
											{format(modalPersona.updatedAt.toDate(), "d MMM yyyy", {
												locale: ptBR,
											})}
										</p>
										<Link
											href="/personas"
											className="mt-4 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
										>
											Abrir na agenda
										</Link>
									</>
								) : (
									<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
										Você vê o nome e as iniciais vinculados a esta tarefa. Notas
										e demais dados aparecem aqui quando esta persona existir na
										sua agenda.
									</p>
								)}
							</div>
						</div>
						<div className="mt-6 flex justify-end">
							<button
								type="button"
								onClick={() => setPersonaModal(null)}
								className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
							>
								Fechar
							</button>
						</div>
					</div>
				</div>
			)}
		</article>
	);
}
