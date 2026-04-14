'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import api from '@/lib/axios';

export default function MembershipPage() {
  const [membership, setMembership] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [mRes, aRes] = await Promise.all([
          api.get('/membership/my'),
          api.get('/attendance/my'),
        ]);
        setMembership(mRes.data.membership);
        setAttendance(aRes.data.attendance.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const daysLeft = membership
    ? Math.max(0, Math.ceil((new Date(membership.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <DashboardLayout allowedRoles={['member']}>
      <h1 className="text-2xl font-serif text-gray-700 mb-6">My Membership</h1>

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}

      {/* Membership card */}
      {membership && (
        <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl p-6 text-white mb-6">
          <div className="text-xs uppercase tracking-widest opacity-75 mb-1">{membership.plan_name}</div>
          <div className="text-2xl font-serif mb-5">{membership.member_name || 'Member'}</div>
          <div className="flex justify-between">
            <div>
              <div className="text-xs opacity-70">Start Date</div>
              <div className="text-sm font-medium mt-1">
                {new Date(membership.start_date).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-70">Expires</div>
              <div className="text-sm font-medium mt-1">
                {new Date(membership.end_date).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-pink-300/50 flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded-full ${membership.status === 'active' ? 'bg-white/20' : 'bg-red-300/30'}`}>
              {membership.status}
            </span>
            <span className="text-xs opacity-75">{daysLeft} days remaining</span>
          </div>
        </div>
      )}

      {!membership && !loading && (
        <div className="bg-white rounded-2xl border border-pink-100 p-8 text-center text-gray-400 text-sm mb-6">
          No active membership. Contact admin to get started.
        </div>
      )}

      {/* Attendance history */}
      <div className="bg-white rounded-2xl border border-pink-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Recent Attendance</div>
        </div>
        {attendance.length === 0 && (
          <div className="px-5 py-6 text-sm text-gray-400">No attendance records yet.</div>
        )}
        {attendance.map(a => (
          <div key={a.id} className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0">
            <div>
              <div className="text-sm font-medium text-gray-700">{a.session_name}</div>
              <div className="text-xs text-gray-400">
                {new Date(a.session_date).toLocaleDateString()} · {a.trainer_name}
              </div>
            </div>
            <Badge status={a.status} />
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}