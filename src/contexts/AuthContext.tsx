import { createContext, ReactNode, useContext, useState } from 'react';
import { AuthState, loadAuth, saveAuth } from '@/services/api';

interface AuthValue {
  auth: AuthState | null;
  signIn: (state: AuthState) => void;
  signOut: () => void;
  setActiveCustomer: (customerId: number) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(loadAuth());

  const update = (state: AuthState | null) => {
    saveAuth(state);
    setAuth(state);
  };

  const setActiveCustomer = (customerId: number) => {
    if (auth) update({ ...auth, activeCustomerId: customerId });
  };

  return (
    <AuthContext.Provider value={{ auth, signIn: update, signOut: () => update(null), setActiveCustomer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
