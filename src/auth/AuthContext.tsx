import { createContext, useContext, useState, type ReactNode } from 'react';
import type { LoginResponse } from '../api/types';
import { tokenStorage } from './tokenStorage';

interface AuthState {
  token: string | null;
  userName: string | null;
  isAuthenticated: boolean;
  login: (response: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStorage.getToken());
  const [userName, setUserName] = useState<string | null>(() => tokenStorage.getName());

  const login = (response: LoginResponse) => {
    tokenStorage.set(response.accessToken, response.usuario.nombre);
    setToken(response.accessToken);
    setUserName(response.usuario.nombre);
  };

  const logout = () => {
    tokenStorage.clear();
    setToken(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ token, userName, isAuthenticated: token != null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
