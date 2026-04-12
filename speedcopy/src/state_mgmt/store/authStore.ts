import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthenticatedUser, AuthTokens } from '../../types/auth';
import { API_BASE_URL } from '../../config/env';

const DEV_USER_EMAIL = 'dev@speedcopy.in';

interface AuthState {
  user: AuthenticatedUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthenticatedUser, tokens: AuthTokens) => void;
  clearAuth: () => void;
  logout: () => void;
  updateUser: (user: Partial<AuthenticatedUser>) => void;
  fetchDevToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null as AuthenticatedUser | null,
      tokens: null,
      isAuthenticated: false,
      setAuth: (user, tokens) => set({ user, tokens, isAuthenticated: true }),
      logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
      clearAuth: () => set({ user: null, tokens: null, isAuthenticated: false }),
      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
          isAuthenticated: !!state.user
        })),
      fetchDevToken: async () => {
        try {
          const devTokenRes = await fetch(`${API_BASE_URL}/auth/dev-token-by-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: DEV_USER_EMAIL }),
          });

          if (devTokenRes.ok) {
            const tokenData = await devTokenRes.json();
            if (tokenData.success) {
              set({
                user: {
                  id: tokenData.data.userId,
                  phone: '',
                  name: 'Dev Customer',
                  email: DEV_USER_EMAIL,
                  role: 'customer',
                  profileComplete: true,
                },
                tokens: { 
                  accessToken: tokenData.data.tokens.accessToken,
                  refreshToken: tokenData.data.tokens.refreshToken || '',
                  expiresAt: tokenData.data.tokens.expiresAt || new Date(Date.now() + 86400000).toISOString()
                },
                isAuthenticated: true,
              });
              console.log('✅ Dev token obtained successfully, userId:', tokenData.data.userId);
            }
          } else {
            console.warn('⚠️ Dev token fetch returned non-OK status:', devTokenRes.status);
          }
        } catch (err) {
          console.warn('⚠️ Dev token fetch failed:', err);
        }
      },
    }),
    {
      name: 'speedcopy-auth-storage', // Key in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
