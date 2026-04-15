'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import api from '@/lib/axios';

function SummaryCard({ label, value, hint, tone = 'pink' }) {
  const tones = {
    pink: 'bg-[#fff8fc] border-[#f2dce8]',
    purple: 'bg-[#faf7ff] border-[#ebe3f7]',
    blue: 'bg-[#f7fbff] border-[#e2edf8]',
    neutral: 'bg-white border-[#f1e7f4]',
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${tones[tone]}`}>
      <div className="text-xs uppercase tracking-[0.18em] text-gray-400">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-gray-800">{value}</div>
      <div className="mt-2 text-xs text-gray-500">{hint}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
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
        setMembers((membersRes.data.members || []).slice(0, 5));
        setSessions((sessionsRes.data.sessions || []).slice(0, 4));
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <DashboardLayout allowedRoles={['admin']}>
        <div className="rounded-3xl border border-[#f1e7f4] bg-white p-10 text-sm text-gray-400">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-[#bf8fb8]">Admin Overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-800">
            Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-500">
            Monitor members, sessions, attendance, and overall gym activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Members"
            value={stats?.total_members ?? 0}
            hint="All registered members"
            tone="pink"
          />
          <SummaryCard
            label="Upcoming Classes"
            value={stats?.upcoming_sessions ?? 0}
            hint="Scheduled from today onward"
            tone="purple"
          />
          <SummaryCard
            label="Attendance Rate"
            value={`${stats?.attendance_rate ?? 0}%`}
            hint="Current attendance performance"
            tone="blue"
          />
          <SummaryCard
            label="Active Memberships"
            value={stats?.active_memberships ?? 0}
            hint="Members with active plans"
            tone="neutral"
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-[#f1e7f4] bg-white shadow-sm overflow-hidden">
            <div className="border-b border-[#f6eef8] px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#c7a5bd]">
                Schedule Snapshot
              </p>
              <h2 className="mt-1 text-lg font-semibold text-gray-800">
                Today&apos;s Classes
              </h2>
            </div>

            <div className="divide-y divide-[#f7f0f8]">
              {sessions.length === 0 && (
                <div className="px-6 py-10 text-sm text-gray-400">
                  No sessions today.
                </div>
              )}

              {sessions.map((s) => {
                const pct = s.capacity ? Math.round((s.booked_count / s.capacity) * 100) : 0;

                return (
                  <div
                    key={s.id}
                    className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="text-base font-semibold text-gray-800">{s.name}</div>
                      <div className="mt-1 text-sm text-gray-500">
                        {s.start_time} · {s.trainer_name}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-24 rounded-full bg-[#f3edf6] h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 100 ? 'bg-red-300' : pct >= 75 ? 'bg-pink-300' : 'bg-[#c8b6e6]'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 min-w-[52px] text-right">
                        {s.booked_count}/{s.capacity}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-[#f1e7f4] bg-white shadow-sm overflow-hidden">
            <div className="border-b border-[#f6eef8] px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#c7a5bd]">
                Newest Members
              </p>
              <h2 className="mt-1 text-lg font-semibold text-gray-800">
                Recent Members
              </h2>
            </div>

            <div className="divide-y divide-[#f7f0f8]">
              {members.length === 0 && (
                <div className="px-6 py-10 text-sm text-gray-400">
                  No members yet.
                </div>
              )}

              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6e8f2] text-xs font-semibold text-[#b076a4]">
                      {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-800">{m.name}</div>
                      <div className="truncate text-xs text-gray-400">{m.plan_name || 'No plan assigned'}</div>
                    </div>
                  </div>
                  <Badge status={m.membership_status || 'inactive'} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}