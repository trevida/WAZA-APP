import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      
      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken });
      },
      
      setAccessToken: (accessToken) => {
        set({ accessToken });
      },
      
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },
      
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null });
      },
      
      isAuthenticated: () => {
        return !!get().accessToken;
      },
    }),
    {
      name: 'waza-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

export default useAuthStore;
