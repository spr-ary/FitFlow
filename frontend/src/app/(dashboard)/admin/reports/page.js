'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/axios';

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-[#f1e7f4] bg-white p-5 shadow-sm">
      <div className="text-xs uppercase tracking-[0.18em] text-gray-400">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-gray-800">{value}</div>
    </div>
  );
}

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [attReport, setAtt] = useState([]);
  const [memReport, setMem] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, a, m] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/reports/attendance'),
          api.get('/reports/memberships'),
        ]);
        setStats(s.data.stats);
        setAtt(a.data.report || []);
        setMem(m.data.report || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['admin']}>
        <div className="rounded-3xl border border-[#f1e7f4] bg-white p-10 text-sm text-gray-400">
          Loading reports...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-[#bf8fb8]">Analytics</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-800">
            Reports & Analytics
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-500">
            Review class performance, membership distribution, and overall gym activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Members" value={stats?.total_members ?? 0} />
          <StatCard label="Total Bookings" value={stats?.total_bookings ?? 0} />
          <StatCard label="Attendance Rate" value={`${stats?.attendance_rate ?? 0}%`} />
          <StatCard label="Active Members" value={stats?.active_memberships ?? 0} />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-3xl border border-[#f1e7f4] bg-white p-6 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#c8a6bf]">
                Attendance
              </p>
              <h2 className="mt-1 text-lg font-semibold text-gray-800">
                Class Fill Rate
              </h2>
            </div>

            <div className="space-y-4">
              {attReport.slice(0, 6).map((r, i) => {
                const pct = r.attendance_rate || 0;
                return (
                  <div key={i}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="truncate text-sm font-medium text-gray-700">
                        {r.session_name}
                      </div>
                      <div className="text-xs font-medium text-gray-500">{pct}%</div>
                    </div>
                    <div className="h-2 rounded-full bg-[#f2ebf5] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#d9b7cf]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-[#f1e7f4] bg-white p-6 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#c8a6bf]">
                Membership
              </p>
              <h2 className="mt-1 text-lg font-semibold text-gray-800">
                Membership Breakdown
              </h2>
            </div>

            <div className="space-y-3">
              {memReport.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl bg-[#fcf8fd] px-4 py-4"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{r.plan_name}</div>
                    <div className="mt-1 text-xs capitalize text-gray-400">
                      {r.duration} · ฿{Number(r.price).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-gray-800">{r.active_count}</div>
                    <div className="text-xs text-gray-400">active</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}