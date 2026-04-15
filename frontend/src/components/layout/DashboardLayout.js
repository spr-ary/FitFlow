'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'admin') router.push('/admin');
        else if (user.role === 'trainer') router.push('/trainer');
        else router.push('/member');
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf6fb]">
        <div className="text-[#c98aac] text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#fcf6fb]">
      <Sidebar />
      <div className="flex-1 ml-60">
        <main className="min-h-screen p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}