"use client";

import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore";
import { useState } from "react";
import { usePersonas } from "@/hooks/use-personas";
import { getFirestoreDb } from "@/lib/firebase";
import { useAuth } from "@/providers/auth-provider";

export default function PersonasPage() {
	const { user } = useAuth();
	const { data: personas, isFetched, isError } = usePersonas(user?.uid);

	const [open, setOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [name, setName] = useState("");
	const [notes, setNotes] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const resetForm = () => {
		setEditingId(null);
		setName("");
		setNotes("");
		setError(null);
	};

	const openNew = () => {
		resetForm();
		setOpen(true);
	};

	const openEdit = (id: string, n: string, no: string) => {
		setEditingId(id);
		setName(n);
		setNotes(no);
		setError(null);
		setOpen(true);
	};

	const save = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) return;
		setSaving(true);
		setError(null);
		try {
			const db = getFirestoreDb();
			const col = collection(db, "users", user.uid, "personas");
			if (editingId) {
				await updateDoc(doc(db, "users", user.uid, "personas", editingId), {
					displayName: name.trim(),
					notes: notes.trim(),
					updatedAt: serverTimestamp(),
				});
			} else {
				await addDoc(col, {
					displayName: name.trim(),
					notes: notes.trim(),
					colorKey: Math.floor(Math.random() * 8),
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp(),
				});
			}
			setOpen(false);
			resetForm();
		} catch {
			setError("Não foi possível salvar. Verifique as regras do Firestore.");
		} finally {
			setSaving(false);
		}
	};

	const remove = async (id: string) => {
		if (!user || !confirm("Excluir esta persona?")) return;
		const db = getFirestoreDb();
		await deleteDoc(doc(db, "users", user.uid, "personas", id));
	};

	const empty = isFetched && personas.length === 0;

	return (
		<div>
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">
						Agenda de personas
					</h1>
					<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
						Lembre quem é quem: nome e anotações só para você.
					</p>
				</div>
				<button
					type="button"
					onClick={openNew}
					className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
				>
					Nova persona
				</button>
			</div>

			{isError && (
				<p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
					Erro ao carregar a agenda.
				</p>
			)}

			{open && (
				<form
					onSubmit={(e) => void save(e)}
					className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
				>
					<h2 className="font-medium">
						{editingId ? "Editar persona" : "Nova persona"}
					</h2>
					<div className="mt-4 space-y-4">
						<div>
							<label
								htmlFor="persona-name"
								className="block text-sm font-medium"
							>
								Nome
							</label>
							<input
								id="persona-name"
								className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</div>
						<div>
							<label
								htmlFor="persona-notes"
								className="block text-sm font-medium"
							>
								Observações
							</label>
							<textarea
								id="persona-notes"
								className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
								rows={4}
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Ex.: Fulano que trabalha em…"
							/>
						</div>
					</div>
					{error && <p className="mt-3 text-sm text-red-600">{error}</p>}
					<div className="mt-4 flex gap-2">
						<button
							type="submit"
							disabled={saving}
							className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
						>
							{saving ? "Salvando…" : "Salvar"}
						</button>
						<button
							type="button"
							onClick={() => {
								setOpen(false);
								resetForm();
							}}
							className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-600"
						>
							Cancelar
						</button>
					</div>
				</form>
			)}

			{!isFetched && !isError ? (
				<p className="mt-8 text-sm text-zinc-500">Carregando…</p>
			) : empty && !open ? (
				<p className="mt-8 text-sm text-zinc-500">
					Nenhuma persona cadastrada.
				</p>
			) : (
				<ul className="mt-8 space-y-3">
					{personas.map((p) => (
						<li
							key={p.id}
							className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
						>
							<div className="flex flex-wrap items-start justify-between gap-2">
								<div>
									<h2 className="font-semibold">{p.displayName}</h2>
									{p.notes && (
										<p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
											{p.notes}
										</p>
									)}
								</div>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => openEdit(p.id, p.displayName, p.notes)}
										className="text-sm text-zinc-700 underline dark:text-zinc-300"
									>
										Editar
									</button>
									<button
										type="button"
										onClick={() => void remove(p.id)}
										className="text-sm text-red-600 dark:text-red-400"
									>
										Excluir
									</button>
								</div>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
