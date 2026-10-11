'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  apiLoginWithPassword,
  apiVerifyPhoneOtp,
  apiSignup,
  apiSendEmailOtp,
  apiVerifyEmailOtp,
  apiSendPhoneOtp,
  apiVerifyDemoAadhaar,
  apiSkipAadhaar,
  BackendUser,
  AuthTokens,
} from '../lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'owner' | 'admin';
  avatar: string;
  university?: string;
  isSuperhost?: boolean;
  verified: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isAadhaarVerified?: boolean;
  maskedAadhaar?: string;
}

export interface VerificationState {
  emailVerified: boolean;
  phoneVerified: boolean;
  aadhaarVerified: boolean;
  aadhaarStatus: 'unverified' | 'verified' | 'skipped' | 'coming_soon';
}

export type AuthModalStep = 'login' | 'signup' | 'email_verify' | 'phone_verify' | 'aadhaar_verify';

export const DEMO_STUDENT_DATA = {
  email: 'student@studentnest.demo',
  password: 'Password123!',
};

export const DEMO_OWNER_DATA = {
  email: 'owner@studentnest.demo',
  password: 'Password123!',
};

export const DEMO_ADMIN_DATA = {
  email: 'admin@studentnest.demo',
  password: 'AdminPassword123!',
};

interface AuthContextType {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  verification: VerificationState;
  isAuthModalOpen: boolean;
  authModalStep: AuthModalStep;
  openAuthModal: (step?: AuthModalStep) => void;
  closeAuthModal: () => void;
  setAuthModalStep: (step: AuthModalStep) => void;
  loginWithPassword: (email: string, password: string) => Promise<UserProfile>;
  loginWithPhone: (phone: string, otp: string) => Promise<UserProfile>;
  registerUser: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: 'STUDENT' | 'OWNER';
    collegeName?: string;
  }) => Promise<UserProfile>;
  requestEmailOtp: (email: string) => Promise<{ devOtp?: string; message: string }>;
  confirmEmailOtp: (email: string, otp: string) => Promise<boolean>;
  requestPhoneOtp: (phone: string) => Promise<{ devOtp?: string; message: string }>;
  verifyAadhaar: (aadhaarNumber: string, otp: string) => Promise<boolean>;
  skipAadhaarVerification: () => Promise<boolean>;
  loginAsDemoStudent: () => Promise<void>;
  loginAsDemoOwner: () => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
  switchRole: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapBackendUserToProfile(backendUser: BackendUser): UserProfile {
  const isAdmin = backendUser.role === 'ADMIN';
  const isStudent = backendUser.role === 'STUDENT';
  return {
    id: backendUser.id,
    name: backendUser.fullName || (isAdmin ? 'Admin Moderator' : isStudent ? 'Student Scholar' : 'Property Host'),
    email: backendUser.email,
    phone: backendUser.phone,
    role: isAdmin ? 'admin' : isStudent ? 'student' : 'owner',
    avatar: isAdmin
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      : isStudent
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    university: backendUser.collegeName || (isStudent ? 'Verified University Scholar' : undefined),
    isSuperhost: !isStudent && !isAdmin,
    verified: Boolean(backendUser.isAadhaarVerified || backendUser.isEmailVerified),
    isEmailVerified: backendUser.isEmailVerified,
    isPhoneVerified: backendUser.isPhoneVerified,
    isAadhaarVerified: backendUser.isAadhaarVerified,
    maskedAadhaar: backendUser.maskedAadhaar,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [verification, setVerification] = useState<VerificationState>({
    emailVerified: false,
    phoneVerified: false,
    aadhaarVerified: false,
    aadhaarStatus: 'unverified',
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalStep, setAuthModalStep] = useState<AuthModalStep>('login');

  // Load persisted session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('studentnest_user');
      const savedTokens = localStorage.getItem('studentnest_tokens');
      const savedVerif = localStorage.getItem('studentnest_verification');

      if (savedUser && savedTokens) {
        setUser(JSON.parse(savedUser));
        setTokens(JSON.parse(savedTokens));
      }
      if (savedVerif) {
        setVerification(JSON.parse(savedVerif));
      }
    } catch (e) {
      console.error('Error loading session from localStorage:', e);
    }
  }, []);

  const persistSession = (newUser: UserProfile | null, newTokens: AuthTokens | null, newVerif: VerificationState) => {
    setUser(newUser);
    setTokens(newTokens);
    setVerification(newVerif);
    try {
      if (newUser && newTokens) {
        localStorage.setItem('studentnest_user', JSON.stringify(newUser));
        localStorage.setItem('studentnest_tokens', JSON.stringify(newTokens));
        localStorage.setItem('studentnest_verification', JSON.stringify(newVerif));
      } else {
        localStorage.removeItem('studentnest_user');
        localStorage.removeItem('studentnest_tokens');
        localStorage.removeItem('studentnest_verification');
      }
    } catch (e) {
      console.error('Error saving session to localStorage:', e);
    }
  };

  const openAuthModal = (step: AuthModalStep = 'login') => {
    setAuthModalStep(step);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // 1. Password Login
  const loginWithPassword = async (email: string, pass: string): Promise<UserProfile> => {
    const data = await apiLoginWithPassword(email, pass);
    const profile = mapBackendUserToProfile(data.user);
    const verif: VerificationState = {
      emailVerified: true,
      phoneVerified: Boolean(profile.phone),
      aadhaarVerified: Boolean(data.user.isAadhaarVerified),
      aadhaarStatus: data.user.isAadhaarVerified ? 'verified' : 'unverified',
    };
    persistSession(profile, data.tokens, verif);
    return profile;
  };

  // 2. Phone + OTP Login (Twilio)
  const loginWithPhone = async (phone: string, otp: string): Promise<UserProfile> => {
    const data = await apiVerifyPhoneOtp(phone, otp);
    const profile = mapBackendUserToProfile(data.user);
    const verif: VerificationState = {
      emailVerified: Boolean(data.user.isEmailVerified),
      phoneVerified: true,
      aadhaarVerified: Boolean(data.user.isAadhaarVerified),
      aadhaarStatus: data.user.isAadhaarVerified ? 'verified' : 'unverified',
    };
    persistSession(profile, data.tokens, verif);
    return profile;
  };

  // 3. Signup with SendGrid & Twilio verified fields
  const registerUser = async (dto: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: 'STUDENT' | 'OWNER';
    collegeName?: string;
  }): Promise<UserProfile> => {
    const data = await apiSignup(dto);
    const profile = mapBackendUserToProfile(data.user);
    const verif: VerificationState = {
      emailVerified: true,
      phoneVerified: true,
      aadhaarVerified: false,
      aadhaarStatus: 'unverified',
    };
    persistSession(profile, data.tokens, verif);
    return profile;
  };

  // 4. SendGrid Email OTP
  const requestEmailOtp = async (email: string) => {
    const res = await apiSendEmailOtp(email);
    return { devOtp: res.devOtp, message: res.message };
  };

  const confirmEmailOtp = async (email: string, otp: string) => {
    await apiVerifyEmailOtp(email, otp);
    setVerification((prev) => ({ ...prev, emailVerified: true }));
    return true;
  };

  // 5. Twilio SMS OTP
  const requestPhoneOtp = async (phone: string) => {
    const res = await apiSendPhoneOtp(phone);
    return { devOtp: res.devOtp, message: res.message };
  };

  // 6. DigiLocker Aadhaar Verification
  const verifyAadhaar = async (aadhaarNumber: string, otp: string) => {
    if (!tokens?.accessToken) throw new Error('Authentication required for Aadhaar verification');
    const res = await apiVerifyDemoAadhaar(tokens.accessToken, aadhaarNumber, otp);
    const updatedVerif: VerificationState = {
      ...verification,
      aadhaarVerified: true,
      aadhaarStatus: 'verified',
    };
    if (user) {
      const updatedUser = {
        ...user,
        verified: true,
        isAadhaarVerified: true,
        maskedAadhaar: res.maskedAadhaar,
      };
      persistSession(updatedUser, tokens, updatedVerif);
    }
    return true;
  };

  // 7. Skip Aadhaar
  const skipAadhaarVerification = async () => {
    if (tokens?.accessToken) {
      try {
        await apiSkipAadhaar(tokens.accessToken);
      } catch (e) {
        console.warn('Could not record skip on server:', e);
      }
    }
    const updatedVerif: VerificationState = {
      ...verification,
      aadhaarStatus: 'skipped',
    };
    if (user) {
      persistSession(user, tokens, updatedVerif);
    }
    closeAuthModal();
    return true;
  };

  // 8. 1-Click Instant Demo Login
  const loginAsDemoStudent = async () => {
    try {
      await loginWithPassword(DEMO_STUDENT_DATA.email, DEMO_STUDENT_DATA.password);
      closeAuthModal();
    } catch {
      // Fallback local profile if backend isn't reachable
      const fallback: UserProfile = {
        id: 'usr-student-demo',
        name: 'Julian Chen',
        email: DEMO_STUDENT_DATA.email,
        phone: '+16175550192',
        role: 'student',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        university: 'Harvard Graduate School',
        verified: true,
      };
      persistSession(fallback, { accessToken: 'demo-token', refreshToken: 'demo-token' }, {
        emailVerified: true,
        phoneVerified: true,
        aadhaarVerified: true,
        aadhaarStatus: 'verified',
      });
      closeAuthModal();
    }
  };

  const loginAsDemoOwner = async () => {
    try {
      await loginWithPassword(DEMO_OWNER_DATA.email, DEMO_OWNER_DATA.password);
      closeAuthModal();
    } catch {
      const fallback: UserProfile = {
        id: 'usr-owner-demo',
        name: 'Eleanor Vance',
        email: DEMO_OWNER_DATA.email,
        phone: '+16175550144',
        role: 'owner',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        isSuperhost: true,
        verified: true,
      };
      persistSession(fallback, { accessToken: 'demo-token', refreshToken: 'demo-token' }, {
        emailVerified: true,
        phoneVerified: true,
        aadhaarVerified: true,
        aadhaarStatus: 'verified',
      });
      closeAuthModal();
    }
  };

  const loginAsDemoAdmin = async () => {
    try {
      await loginWithPassword(DEMO_ADMIN_DATA.email, DEMO_ADMIN_DATA.password);
      closeAuthModal();
    } catch {
      const fallback: UserProfile = {
        id: 'usr-admin-demo',
        name: 'Chief Moderator (Trust & Safety)',
        email: DEMO_ADMIN_DATA.email,
        phone: '+91 98000 00001',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        verified: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        isAadhaarVerified: true,
      };
      persistSession(fallback, { accessToken: 'demo-admin-token', refreshToken: 'demo-admin-token' }, {
        emailVerified: true,
        phoneVerified: true,
        aadhaarVerified: true,
        aadhaarStatus: 'verified',
      });
      closeAuthModal();
    }
  };

  const switchRole = () => {
    if (!user || user.role === 'student') {
      loginAsDemoOwner();
    } else {
      loginAsDemoStudent();
    }
  };

  const logout = () => {
    persistSession(null, null, {
      emailVerified: false,
      phoneVerified: false,
      aadhaarVerified: false,
      aadhaarStatus: 'unverified',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!user,
        verification,
        isAuthModalOpen,
        authModalStep,
        openAuthModal,
        closeAuthModal,
        setAuthModalStep,
        loginWithPassword,
        loginWithPhone,
        registerUser,
        requestEmailOtp,
        confirmEmailOtp,
        requestPhoneOtp,
        verifyAadhaar,
        skipAadhaarVerification,
        loginAsDemoStudent,
        loginAsDemoOwner,
        loginAsDemoAdmin,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

