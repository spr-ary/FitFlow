'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/login');
      else if (user.role === 'admin')   router.push('/admin');
      else if (user.role === 'trainer') router.push('/trainer');
      else router.push('/member');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="text-pink-400 text-lg">Loading FitFlow...</div>
    </div>
  );
}