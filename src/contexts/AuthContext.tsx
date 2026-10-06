import { createContext, ReactNode, useContext, useState } from 'react';
import { getToken, setToken } from '@/services/api';

interface AuthValue {
  token: string | null;
  signIn: (token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken());
  const signIn = (value: string) => {
    setToken(value);
    setTokenState(value);
  };
  const signOut = () => {
    setToken(null);
    setTokenState(null);
  };
  return <AuthContext.Provider value={{ token, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
