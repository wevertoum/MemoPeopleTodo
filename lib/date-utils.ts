import { Timestamp } from "firebase/firestore";

/** Input HTML type="date" (YYYY-MM-DD) → Firestore Timestamp (meio-dia local). */
export function dateOnlyToTimestamp(value: string): Timestamp | null {
  if (!value?.trim()) return null;
  const d = new Date(`${value.trim()}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return Timestamp.fromDate(d);
}

export function timestampToDateOnlyInput(ts: Timestamp | null | undefined): string {
  if (!ts) return "";
  const d = ts.toDate();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
