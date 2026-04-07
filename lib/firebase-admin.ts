import {
  type App,
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from 'firebase-admin/app';
import { type Auth, getAuth } from 'firebase-admin/auth';

function getServiceAccountJson(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw?.trim()) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON não configurado no servidor.',
    );
  }
  return JSON.parse(raw) as ServiceAccount;
}

let app: App | null = null;

export function getFirebaseAdminApp(): App {
  if (app) return app;
  const existing = getApps()[0];
  if (existing) {
    app = existing;
    return app;
  }
  const sa = getServiceAccountJson();
  app = initializeApp({
    credential: cert(sa),
  });
  return app;
}

export function getFirebaseAdminAuth(): Auth {
  return getAuth(getFirebaseAdminApp());
}

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim());
}
