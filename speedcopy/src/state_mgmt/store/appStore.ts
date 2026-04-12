import { create } from 'zustand';

export type AppMode = 'print' | 'gift' | 'shopping';

interface AppState {
    mode: AppMode;
    setMode: (mode: AppMode) => void;
}

export const useAppStore = create<AppState>((set) => ({
    mode: 'print',
    setMode: (mode) => set({ mode }),
}));
