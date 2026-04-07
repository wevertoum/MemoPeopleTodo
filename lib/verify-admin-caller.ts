import { NextResponse } from 'next/server';
import {
  getFirebaseAdminAuth,
  isFirebaseAdminConfigured,
} from '@/lib/firebase-admin';

type VerifyResult =
  | { ok: true; uid: string }
  | { ok: false; response: NextResponse };

/**
 * Valida Bearer ID token. Se ADMIN_UIDS estiver definido (lista separada por vírgula),
 * só esses UIDs podem chamar rotas administrativas; caso contrário, qualquer usuário autenticado.
 */
export async function verifyAdminCaller(
  request: Request,
): Promise<VerifyResult> {
  if (!isFirebaseAdminConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            'Servidor sem credencial Admin. Configure FIREBASE_SERVICE_ACCOUNT_JSON.',
        },
        { status: 503 },
      ),
    };
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Não autorizado.' },
        { status: 401 },
      ),
    };
  }

  try {
    const decoded = await getFirebaseAdminAuth().verifyIdToken(token);
    const allowed =
      process.env.ADMIN_UIDS?.split(',')
        .map((s) => s.trim())
        .filter(Boolean) ?? [];

    if (allowed.length > 0 && !allowed.includes(decoded.uid)) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: 'Sem permissão.' },
          { status: 403 },
        ),
      };
    }

    return { ok: true, uid: decoded.uid };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Token inválido.' },
        { status: 401 },
      ),
    };
  }
}
