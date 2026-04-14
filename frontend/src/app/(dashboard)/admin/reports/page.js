'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import api from '@/lib/axios';

export default function ReportsPage() {
  const [stats, setStats]       = useState(null);
  const [attReport, setAtt]     = useState([]);
  const [memReport, setMem]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, a, m] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/reports/attendance'),
          api.get('/reports/memberships'),
        ]);
        setStats(s.data.stats);
        setAtt(a.data.report);
        setMem(m.data.report);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="text-pink-400 text-sm">Loading reports...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <h1 className="text-2xl font-serif text-gray-700 mb-6">Reports & Analytics</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Members"    value={stats?.total_members ?? 0} trendUp />
        <StatCard label="Total Bookings"   value={stats?.total_bookings ?? 0} trendUp />
        <StatCard label="Attendance Rate"  value={`${stats?.attendance_rate ?? 0}%`} trendUp={stats?.attendance_rate > 80} />
        <StatCard label="Active Members"   value={stats?.active_memberships ?? 0} trendUp />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Class fill rate */}
        <div className="bg-white rounded-2xl border border-pink-100 p-5">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Class Fill Rate</div>
          {attReport.slice(0,6).map((r, i) => {
            const pct = r.attendance_rate || 0;
            return (
              <div key={i} className="flex items-center gap-3 mb-3">
                <div className="w-28 text-xs text-gray-500 text-right truncate">{r.session_name}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full bg-pink-400" style={{ width: `${pct}%` }} />
                </div>
                <div className="w-8 text-xs text-gray-600 font-medium">{pct}%</div>
              </div>
            );
          })}
        </div>

        {/* Membership breakdown */}
        <div className="bg-white rounded-2xl border border-pink-100 p-5">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Membership Breakdown</div>
          {memReport.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div>
                <div className="text-sm font-medium text-gray-700">{r.plan_name}</div>
                <div className="text-xs text-gray-400 capitalize">{r.duration} · ฿{Number(r.price).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium text-gray-700">{r.active_count}</div>
                <div className="text-xs text-gray-400">active</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}