"use client";

import {
	type Auth,
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
	type User,
	updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { getFirebaseAuth, getFirestoreDb } from "@/lib/firebase";

type AuthContextValue = {
	user: User | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (
		email: string,
		password: string,
		displayName: string,
	) => Promise<void>;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureUserProfile(user: User, displayNameFallback: string) {
	const db = getFirestoreDb();
	const ref = doc(db, "users", user.uid);
	const snap = await getDoc(ref);
	const name = user.displayName?.trim() || displayNameFallback;
	if (!snap.exists()) {
		await setDoc(ref, {
			displayName: name,
			email: user.email ?? "",
			photoURL: user.photoURL ?? null,
			createdAt: serverTimestamp(),
		});
	}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		let auth: Auth;
		try {
			auth = getFirebaseAuth();
		} catch {
			setLoading(false);
			return;
		}
		const unsub = onAuthStateChanged(auth, async (u) => {
			if (!mounted) return;
			setUser(u);
			if (u) {
				try {
					await ensureUserProfile(u, u.email?.split("@")[0] ?? "Usuário");
				} catch {
					/* perfil opcional na primeira carga */
				}
			}
			setLoading(false);
		});
		return () => {
			mounted = false;
			unsub();
		};
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		const auth = getFirebaseAuth();
		await signInWithEmailAndPassword(auth, email, password);
	}, []);

	const register = useCallback(
		async (email: string, password: string, displayName: string) => {
			const auth = getFirebaseAuth();
			const cred = await createUserWithEmailAndPassword(auth, email, password);
			if (displayName.trim()) {
				await updateProfile(cred.user, { displayName: displayName.trim() });
			}
			const fallbackName = email.split("@")[0] || "Usuário";
			await ensureUserProfile(cred.user, displayName.trim() || fallbackName);
		},
		[],
	);

	const logout = useCallback(async () => {
		const auth = getFirebaseAuth();
		await signOut(auth);
	}, []);

	const value = useMemo(
		() => ({ user, loading, login, register, logout }),
		[user, loading, login, register, logout],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth deve estar dentro de AuthProvider");
	return ctx;
}
