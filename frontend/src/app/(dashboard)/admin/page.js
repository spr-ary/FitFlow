'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import api from '@/lib/axios';

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [members, setMembers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, membersRes, sessionsRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/users/members'),
          api.get('/scheduling'),
        ]);
        setStats(statsRes.data.stats);
        setMembers(membersRes.data.members.slice(0, 5));
        setSessions(sessionsRes.data.sessions.slice(0, 4));
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="text-pink-400 text-sm">Loading dashboard...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <h1 className="text-2xl font-serif text-gray-700 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Members"    value={stats?.total_members ?? 0}      trend="this month"  trendUp />
        <StatCard label="Upcoming Classes" value={stats?.upcoming_sessions ?? 0}  trend="this week"   trendUp />
        <StatCard label="Attendance Rate"  value={`${stats?.attendance_rate ?? 0}%`} trend="vs last week" trendUp={stats?.attendance_rate > 80} />
        <StatCard label="Active Members"   value={stats?.active_memberships ?? 0} trend="active now"  trendUp />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Today's sessions */}
        <div className="bg-white rounded-2xl border border-pink-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Today's Classes</div>
          </div>
          <div className="space-y-3">
            {sessions.length === 0 && <p className="text-gray-400 text-sm">No sessions today.</p>}
            {sessions.map(s => {
              const pct = Math.round((s.booked_count / s.capacity) * 100);
              return (
                <div key={s.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.start_time} · {s.trainer_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="w-20 bg-gray-100 rounded-full h-1.5 mb-1">
                      <div
                        className={`h-1.5 rounded-full ${pct >= 100 ? 'bg-red-400' : pct >= 75 ? 'bg-pink-400' : 'bg-pink-200'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400">{s.booked_count}/{s.capacity}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent members */}
        <div className="bg-white rounded-2xl border border-pink-100 p-5">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Recent Members</div>
          <div className="space-y-3">
            {members.length === 0 && <p className="text-gray-400 text-sm">No members yet.</p>}
            {members.map(m => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-200 text-pink-600 flex items-center justify-center text-xs font-medium">
                    {m.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">{m.name}</div>
                    <div className="text-xs text-gray-400">{m.plan_name || 'No plan'}</div>
                  </div>
                </div>
                <Badge status={m.membership_status || 'inactive'} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}