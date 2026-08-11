import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { authApi } from '../lib/auth';
import { getAPIEndpoint } from '../lib/api-config';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  language_preference?: string;
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  // OIDC login (platform)
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
  isAdmin: boolean;
  // Phase 1: Email/password login
  emailLogin: (email: string, password: string) => Promise<void>;
  emailSignup: (email: string, name: string, password: string, language?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stored token and user on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to restore auth state:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }

    // Also check platform auth
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (err) {
      // Not authenticated via OIDC, that's fine
      if (!token) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // OIDC login
  const login = async () => {
    try {
      setError(null);
      await authApi.login();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  // OIDC logout
  const logout = async () => {
    try {
      setError(null);
      // Clear token-based auth
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('language_preference');
      setToken(null);
      setUser(null);
      // Also logout from OIDC if available
      await authApi.logout();
    } catch (err) {
      // Even if there's an error, clear local state
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('language_preference');
      setToken(null);
      setUser(null);
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  // Email/password login
  const emailLogin = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await fetch(getAPIEndpoint('/api/v1/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      const authToken = data.token.access_token;
      const authUser = data.user;

      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
      throw err;
    }
  };

  // Email/password signup
  const emailSignup = async (
    email: string,
    name: string,
    password: string,
    language: string = 'english'
  ) => {
    try {
      setError(null);
      const response = await fetch(getAPIEndpoint('/api/v1/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          password,
          language_preference: language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed');
      }

      const data = await response.json();
      const authToken = data.token.access_token;
      const authUser = data.user;

      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('auth_user', JSON.stringify(authUser));

      setToken(authToken);
      setUser(authUser);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMsg);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!(token && user),
    login,
    logout,
    refetch: checkAuthStatus,
    isAdmin: user?.role === 'admin',
    emailLogin,
    emailSignup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
