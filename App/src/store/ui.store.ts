import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  isLoading: boolean;
  toastMessage: {
    type: 'success' | 'error' | 'info' | 'warning' | null;
    message: string | null;
  };
  bottomSheetContent: React.ReactNode | null;
  searchModalVisible: boolean;
  filterModalVisible: boolean;
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (isLoading: boolean) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
  hideToast: () => void;
  setBottomSheetContent: (content: React.ReactNode | null) => void;
  toggleSearchModal: (visible?: boolean) => void;
  toggleFilterModal: (visible?: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  isLoading: false,
  toastMessage: {
    type: null,
    message: null,
  },
  bottomSheetContent: null,
  searchModalVisible: false,
  filterModalVisible: false,

  setTheme: (theme) => set({ theme }),

  setLoading: (isLoading) => set({ isLoading }),

  showToast: (type, message) => {
    set({ toastMessage: { type, message } });
    // Auto hide toast after 3 seconds
    setTimeout(() => {
      set({ toastMessage: { type: null, message: null } });
    }, 3000);
  },

  hideToast: () => set({ toastMessage: { type: null, message: null } }),

  setBottomSheetContent: (content) => set({ bottomSheetContent: content }),

  toggleSearchModal: (visible) => 
    set((state) => ({ 
      searchModalVisible: visible !== undefined ? visible : !state.searchModalVisible 
    })),

  toggleFilterModal: (visible) => 
    set((state) => ({ 
      filterModalVisible: visible !== undefined ? visible : !state.filterModalVisible 
    })),
}));