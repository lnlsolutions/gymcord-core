import type { User } from "../../types/domain";

export interface AuthSession {
  user: User;
  accessToken: string;
  expiresAt: string;
}

export interface AuthService {
  getCurrentSession(): Promise<AuthSession | null>;
  signIn(email: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  onAuthStateChanged(listener: (session: AuthSession | null) => void): () => void;
}
