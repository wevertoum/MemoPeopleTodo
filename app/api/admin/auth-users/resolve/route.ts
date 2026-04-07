import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { AuthUserRow } from "@/lib/auth-user-types";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { verifyAdminCaller } from "@/lib/verify-admin-caller";

export const runtime = "nodejs";

const MAX_UIDS = 50;

export async function POST(request: NextRequest) {
  const gate = await verifyAdminCaller(request);
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const raw =
    typeof body === "object" &&
    body !== null &&
    "uids" in body &&
    Array.isArray((body as { uids: unknown }).uids)
      ? (body as { uids: unknown[] }).uids
      : null;
  if (!raw) {
    return NextResponse.json({ error: "Informe uids (array de strings)." }, { status: 400 });
  }

  const uids = [...new Set(raw.map((u) => String(u).trim()).filter(Boolean))].slice(0, MAX_UIDS);
  if (uids.length === 0) {
    return NextResponse.json({ users: [] satisfies AuthUserRow[] });
  }

  try {
    const auth = getFirebaseAdminAuth();
    const result = await auth.getUsers(uids.map((uid) => ({ uid })));
    const users: AuthUserRow[] = result.users.map((u) => ({
      uid: u.uid,
      email: u.email,
      displayName: u.displayName ?? undefined,
    }));
    return NextResponse.json({ users });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erro ao resolver usuários.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
