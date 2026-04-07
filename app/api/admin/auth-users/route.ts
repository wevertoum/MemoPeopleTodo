import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { AuthUserRow } from '@/lib/auth-user-types';
import { getFirebaseAdminAuth } from '@/lib/firebase-admin';
import { verifyAdminCaller } from '@/lib/verify-admin-caller';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const gate = await verifyAdminCaller(request);
  if (!gate.ok) return gate.response;

  const q = request.nextUrl.searchParams.get('q')?.trim().toLowerCase() ?? '';
  const auth = getFirebaseAdminAuth();
  const maxMatches = 40;
  const maxPages = 15;

  try {
    if (!q) {
      const list = await auth.listUsers(maxMatches);
      const users: AuthUserRow[] = list.users.map((u) => ({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName ?? undefined,
      }));
      return NextResponse.json({ users });
    }

    const users: AuthUserRow[] = [];
    let pageToken: string | undefined;

    for (let i = 0; i < maxPages; i++) {
      const list = await auth.listUsers(1000, pageToken);
      for (const u of list.users) {
        const email = u.email?.toLowerCase() ?? '';
        const dn = u.displayName?.toLowerCase() ?? '';
        if (
          email.includes(q) ||
          dn.includes(q) ||
          u.uid.toLowerCase().includes(q)
        ) {
          users.push({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName ?? undefined,
          });
          if (users.length >= maxMatches) break;
        }
      }
      if (users.length >= maxMatches || !list.pageToken) break;
      pageToken = list.pageToken;
    }

    return NextResponse.json({ users });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erro ao listar usuários.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await verifyAdminCaller(request);
  if (!gate.ok) return gate.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const email =
    typeof body === 'object' && body && 'email' in body
      ? String((body as { email: unknown }).email).trim()
      : '';
  const password =
    typeof body === 'object' && body && 'password' in body
      ? String((body as { password: unknown }).password)
      : '';

  if (!email || !password || password.length < 6) {
    return NextResponse.json(
      { error: 'Informe e-mail e senha (mínimo 6 caracteres).' },
      { status: 400 },
    );
  }

  try {
    const auth = getFirebaseAdminAuth();
    const created = await auth.createUser({ email, password });
    return NextResponse.json({
      uid: created.uid,
      email: created.email,
    });
  } catch (e: unknown) {
    const code =
      e && typeof e === 'object' && 'code' in e
        ? String((e as { code: string }).code)
        : '';
    if (code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'Este e-mail já está cadastrado.' },
        { status: 409 },
      );
    }
    if (code === 'auth/invalid-email') {
      return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
    }
    if (code === 'auth/weak-password') {
      return NextResponse.json(
        { error: 'Senha muito fraca.' },
        { status: 400 },
      );
    }
    const message =
      e instanceof Error ? e.message : 'Não foi possível criar o usuário.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
