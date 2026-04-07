"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { CalendarTaskItem } from "@/hooks/use-calendar-tasks";
import { useCalendarTasks } from "@/hooks/use-calendar-tasks";
import { useAuth } from "@/providers/auth-provider";

function tasksForDay(items: CalendarTaskItem[], day: Date) {
  const key = format(day, "yyyy-MM-dd");
  return items.filter((t) => format(t.dueDate!.toDate(), "yyyy-MM-dd") === key);
}

export function CalendarView() {
  const { user } = useAuth();
  const { data: items, isFetched, isError } = useCalendarTasks(user?.uid);
  const [cursor, setCursor] = useState(() => new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Calendário</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Prazos das tarefas nos projetos em que você participa.
      </p>

      {isError && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          Não foi possível carregar os eventos.
        </p>
      )}

      {!isFetched ? (
        <p className="mt-8 text-sm text-zinc-500">Carregando…</p>
      ) : (
        <>
          {items.length === 0 ? (
            <p className="mt-6 text-sm text-zinc-500">
              Nenhuma tarefa com prazo. Defina datas nas tarefas dos projetos.
            </p>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
              <button
                type="button"
                className="rounded-md border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700"
                onClick={() =>
                  setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
                }
                aria-label="Mês anterior"
              >
                ←
              </button>
              <h2 className="text-sm font-semibold capitalize">
                {format(cursor, "MMMM yyyy", { locale: ptBR })}
              </h2>
              <button
                type="button"
                className="rounded-md border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700"
                onClick={() =>
                  setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
                }
                aria-label="Próximo mês"
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((w) => (
                <div
                  key={w}
                  className="bg-zinc-50 px-2 py-2 text-center text-xs font-medium text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400"
                >
                  {w}
                </div>
              ))}
              {days.map((day) => {
                const inMonth = isSameMonth(day, cursor);
                const dayTasks = tasksForDay(items, day);
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[88px] bg-white p-1 text-left dark:bg-zinc-900 ${
                      inMonth ? "" : "opacity-40"
                    }`}
                  >
                    <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {format(day, "d")}
                    </div>
                    <ul className="mt-1 space-y-1">
                      {dayTasks.map((t) => (
                        <li key={`${t.projectId}-${t.id}`}>
                          <Link
                            href={`/projects/${t.projectId}`}
                            className="block truncate rounded bg-zinc-100 px-1 py-0.5 text-[10px] text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                            title={`${t.title} · ${t.projectTitle}`}
                          >
                            {t.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
