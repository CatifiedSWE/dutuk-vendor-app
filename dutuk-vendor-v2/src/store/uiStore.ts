import { create } from 'zustand';

interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
}

interface UIState {
    isGlobalLoading: boolean;
    toast: ToastMessage | null;

    setGlobalLoading: (loading: boolean) => void;
    showToast: (toast: Omit<ToastMessage, 'id'>) => void;
    dismissToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isGlobalLoading: false,
    toast: null,

    setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),
    showToast: (toast) =>
        set({ toast: { ...toast, id: Date.now().toString() } }),
    dismissToast: () => set({ toast: null }),
}));
