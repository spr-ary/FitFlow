'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';

const pageTitles = {
  '/admin':               'Dashboard',
  '/admin/schedule':      'Class Schedule',
  '/admin/members':       'Member Management',
  '/admin/trainers':      'Trainer Management',
  '/admin/plans':         'Membership Plans',
  '/admin/reports':       'Reports & Analytics',
  '/trainer':             'My Sessions',
  '/trainer/attendance':  'Mark Attendance',
  '/trainer/schedule':    'My Schedule',
  '/member':              'Book a Class',
  '/member/bookings':     'My Bookings',
  '/member/membership':   'My Membership',
  '/member/schedule':     'Class Schedule',
};

export default function DashboardLayout({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'admin')        router.push('/admin');
        else if (user.role === 'trainer') router.push('/trainer');
        else                              router.push('/member');
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-400 rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-sm text-pink-400">Loading FitFlow...</div>
        </div>
      </div>
    );
  }

  const pageTitle = pageTitles[pathname] || 'FitFlow';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-56 flex flex-col">
        {/* Topbar */}
        <div className="h-14 bg-white border-b border-pink-100 px-7 flex items-center justify-between sticky top-0 z-10">
          <div className="font-serif text-lg text-gray-700">{pageTitle}</div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400 capitalize">{user.role}</div>
            <div className="w-8 h-8 rounded-full bg-pink-200 text-pink-600 flex items-center justify-center text-xs font-medium">
              {user.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
            </div>
          </div>
        </div>
        {/* Page content */}
        <main className="p-7 flex-1">{children}</main>
      </div>
    </div>
  );
}