"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

const links = [
	{ href: "/projects", label: "Projetos" },
	{ href: "/personas", label: "Agenda" },
	{ href: "/calendar", label: "Calendário" },
	{ href: "/users", label: "Usuários" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { user, logout } = useAuth();

	return (
		<div className="flex min-h-screen flex-col">
			<header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
				<div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
					<Link
						href="/projects"
						className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
					>
						MemoPeopleTodo
					</Link>
					<nav className="flex flex-1 gap-1">
						{links.map((l) => {
							const active =
								pathname === l.href || pathname.startsWith(`${l.href}/`);
							return (
								<Link
									key={l.href}
									href={l.href}
									className={
										active
											? "rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
											: "rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
									}
								>
									{l.label}
								</Link>
							);
						})}
					</nav>
					<div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
						<span className="max-w-[160px] truncate">{user?.email}</span>
						<button
							type="button"
							onClick={() => void logout()}
							className="rounded-md border border-zinc-200 px-3 py-1.5 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
						>
							Sair
						</button>
					</div>
				</div>
			</header>
			<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
				{children}
			</main>
		</div>
	);
}
