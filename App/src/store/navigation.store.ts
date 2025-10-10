import { create } from 'zustand';
import { useAuthStore } from '@store/auth.store';

type UserRole = 'student' | 'owner' | null;
type AppScreen = 'landing' | 'auth' | 'main';

interface NavigationState {
  currentScreen: AppScreen;
  previousScreen: AppScreen | null;
  userRole: UserRole;
  tabHistory: Record<string, string[]>;
  // Actions
  setCurrentScreen: (screen: AppScreen) => void;
  setUserRole: (role: UserRole) => void;
  addToTabHistory: (tab: string, screen: string) => void;
  clearTabHistory: (tab: string) => void;
  // Navigation helpers
  canGoBack: (tab: string) => boolean;
  getPreviousScreen: (tab: string) => string | undefined;
  // Role-based navigation
  getInitialRoute: () => string;
  shouldShowOnboarding: () => boolean;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentScreen: 'landing',
  previousScreen: null,
  userRole: null,
  tabHistory: {},

  setCurrentScreen: (screen) => {
    set((state) => ({
      previousScreen: state.currentScreen,
      currentScreen: screen,
    }));
  },

  setUserRole: (role) => {
    set({ userRole: role });
  },

  addToTabHistory: (tab, screen) => {
    set((state) => ({
      tabHistory: {
        ...state.tabHistory,
        [tab]: [...(state.tabHistory[tab] || []), screen],
      },
    }));
  },

  clearTabHistory: (tab) => {
    set((state) => ({
      tabHistory: {
        ...state.tabHistory,
        [tab]: [],
      },
    }));
  },

  canGoBack: (tab) => {
    const history = get().tabHistory[tab];
    return history ? history.length > 1 : false;
  },

  getPreviousScreen: (tab) => {
    const history = get().tabHistory[tab];
    if (!history || history.length < 2) return undefined;
    return history[history.length - 2];
  },

  getInitialRoute: () => {
    const auth = useAuthStore.getState();
    const userRole = get().userRole;

    if (!auth.isAuthenticated) {
      return '/(landing)';
    }

    if (!userRole && auth.user?.role) {
      set({ userRole: auth.user.role });
    }

    // User is authenticated but no role selected
    if (!userRole) {
      return '/(auth)/select-role';
    }

    // Role-specific main screens
    return userRole === 'student' 
      ? '/(tabs)/student/explore'
      : '/(tabs)/owner/properties';
  },

  shouldShowOnboarding: () => {
    const auth = useAuthStore.getState();
    return auth.isAuthenticated && 
           !auth.user?.role && 
           get().userRole !== null;
  },
}));