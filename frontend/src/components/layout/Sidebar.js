'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCog,
  CreditCard,
  BarChart3,
  ClipboardList,
  BookOpen,
  LogOut,
} from 'lucide-react';

const navConfig = {
  admin: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/schedule', label: 'Schedule', icon: CalendarDays },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/trainers', label: 'Trainers', icon: UserCog },
    { href: '/admin/plans', label: 'Memberships', icon: CreditCard },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ],
  trainer: [
    { href: '/trainer', label: 'My Sessions', icon: ClipboardList },
    { href: '/trainer/attendance', label: 'Attendance', icon: Users },
    { href: '/trainer/schedule', label: 'Schedule', icon: CalendarDays },
  ],
  member: [
    { href: '/member', label: 'Book Classes', icon: BookOpen },
    { href: '/member/bookings', label: 'My Bookings', icon: ClipboardList },
    { href: '/member/membership', label: 'Membership', icon: CreditCard },
    { href: '/member/schedule', label: 'Schedule', icon: CalendarDays },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const nav = navConfig[user.role] || [];

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-60 bg-[#fdf7fb] border-r border-pink-100 flex flex-col px-4 py-6">
      {/* Brand */}
      <div className="mb-8 px-2">
        <div className="text-[30px] leading-none font-serif text-pink-400">
          FitFlow
        </div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-gray-400 mt-2">
          Management
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between rounded-full px-4 py-2.5 text-sm transition-all ${
                active
                  ? 'bg-pink-200 text-pink-700'
                  : 'text-gray-600 hover:bg-pink-100'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon
                  size={16}
                  className={active ? 'text-pink-600' : 'text-gray-400'}
                />
                <span>{item.label}</span>
              </span>

              {active && <span className="text-pink-500 text-sm">›</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="mt-6 border-t border-pink-100 pt-4">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="h-9 w-9 rounded-full bg-pink-200 text-pink-600 flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">
              {user.name}
            </div>
            <div className="text-xs text-gray-400 capitalize">
              {user.role}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-white border border-pink-100 py-2 text-sm text-gray-500 hover:bg-pink-50 hover:text-pink-500 transition"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}