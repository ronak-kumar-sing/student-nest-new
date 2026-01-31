"use client";

import { UserSidebar } from "../../components/user-sidebar";
import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import VerificationGuard from "../../components/verification/VerificationGuard";
import { useAuth } from "../../hooks/useAuth";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "owner";
  image?: string;
  signedIn: boolean;
  isIdentityVerified?: boolean;
  identityVerificationSkipped?: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user: authUser, loading, isAuthenticated } = useAuth();
  const [sidebarUser, setSidebarUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // If not authenticated, redirect to home
    if (!isAuthenticated || !authUser) {
      router.push("/");
      return;
    }

    // Normalize role to lowercase and create sidebar user
    const normalizedRole = (authUser.role?.toLowerCase() || 'student') as "student" | "owner";

    setSidebarUser({
      id: authUser.id || authUser._id || '',
      name: authUser.fullName || authUser.email || 'User',
      email: authUser.email || '',
      role: normalizedRole,
      image: authUser.avatar,
      signedIn: true,
      isIdentityVerified: authUser.isIdentityVerified,
      identityVerificationSkipped: authUser.identityVerificationSkipped
    });
  }, [loading, isAuthenticated, authUser, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!sidebarUser || !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <VerificationGuard userRole={sidebarUser.role}>
      <UserSidebar user={sidebarUser}>
        {children}
      </UserSidebar>
    </VerificationGuard>
  );
}
