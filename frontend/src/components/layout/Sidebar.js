'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const navConfig = {
  admin: [
    { href:'/admin',             label:'Dashboard'    },
    { href:'/admin/schedule',    label:'Schedule'     },
    { href:'/admin/members',     label:'Members'      },
    { href:'/admin/trainers',    label:'Trainers'     },
    { href:'/admin/plans',       label:'Memberships'  },
    { href:'/admin/reports',     label:'Reports'      },
  ],
  trainer: [
    { href:'/trainer',            label:'My Sessions'  },
    { href:'/trainer/attendance', label:'Attendance'   },
    { href:'/trainer/schedule',   label:'Schedule'     },
  ],
  member: [
    { href:'/member',             label:'Book Classes' },
    { href:'/member/bookings',    label:'My Bookings'  },
    { href:'/member/membership',  label:'Membership'   },
    { href:'/member/schedule',    label:'Schedule'     },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;
  const nav = navConfig[user.role] || [];

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-56 bg-white border-r border-pink-100 flex flex-col fixed top-0 bottom-0 z-20">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-pink-100">
        <div className="text-2xl font-serif text-pink-400">FitFlow</div>
        <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Management</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2.5 rounded-xl text-sm transition-all ${
              pathname === item.href
                ? 'bg-pink-50 text-pink-500 font-medium'
                : 'text-gray-400 hover:bg-pink-50 hover:text-gray-600'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-pink-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-pink-200 text-pink-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
            {initials}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 leading-tight">{user.name}</div>
            <div className="text-xs text-gray-400 capitalize">{user.role}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full py-2 text-xs text-gray-400 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}