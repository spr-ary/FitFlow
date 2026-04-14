'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';

export default function TrainerDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/scheduling/trainer/my');
        setSessions(res.data.sessions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const today = sessions.filter(
    (s) => new Date(s.session_date).toDateString() === new Date().toDateString()
  );

  const totalBookings = sessions.reduce((sum, s) => sum + (s.booked_count || 0), 0);

  return (
    <DashboardLayout allowedRoles={['trainer']}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#efe3f3] bg-[#fcf8fd] p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#c08cb6]">Trainer Panel</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-800">
                My Sessions
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Welcome back{user?.name ? `, ${user.name}` : ''}. Manage your classes, review today’s sessions, and jump straight to attendance.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#f1e7f4] bg-white px-4 py-4 shadow-sm">
                <div className="text-xs text-gray-400">Today</div>
                <div className="mt-1 text-2xl font-semibold text-gray-800">{today.length}</div>
              </div>
              <div className="rounded-2xl border border-[#f1e7f4] bg-white px-4 py-4 shadow-sm">
                <div className="text-xs text-gray-400">Sessions</div>
                <div className="mt-1 text-2xl font-semibold text-gray-800">{sessions.length}</div>
              </div>
              <div className="rounded-2xl border border-[#f1e7f4] bg-white px-4 py-4 shadow-sm col-span-2 sm:col-span-1">
                <div className="text-xs text-gray-400">Bookings</div>
                <div className="mt-1 text-2xl font-semibold text-gray-800">{totalBookings}</div>
              </div>
            </div>
          </div>
        </section>

        {loading && (
          <div className="rounded-3xl border border-[#f1e7f4] bg-white p-10 text-center text-sm text-gray-400">
            Loading sessions...
          </div>
        )}

        {!loading && (
          <section className="rounded-3xl border border-[#f1e7f4] bg-white shadow-sm overflow-hidden">
            <div className="border-b border-[#f6eef8] px-6 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c8a6bf]">
                    Overview
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-gray-800">
                    All My Sessions
                  </h2>
                </div>
                <Link
                  href="/trainer/attendance"
                  className="rounded-xl border border-[#eaddee] bg-[#fcf8fd] px-4 py-2 text-xs font-medium text-[#c08cb6] transition hover:bg-[#f8effa]"
                >
                  Open Attendance
                </Link>
              </div>
            </div>

            {sessions.length === 0 ? (
              <div className="px-6 py-10 text-sm text-gray-400">
                No sessions assigned yet.
              </div>
            ) : (
              <div className="divide-y divide-[#f7f0f8]">
                {sessions.map((s) => {
                  const full = s.booked_count >= s.capacity;
                  const occupancy = s.capacity ? Math.round((s.booked_count / s.capacity) * 100) : 0;

                  return (
                    <div
                      key={s.id}
                      className="flex flex-col gap-4 px-6 py-5 xl:flex-row xl:items-center xl:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-800">{s.name}</h3>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                              full
                                ? 'bg-red-50 text-red-500'
                                : 'bg-[#f7eef9] text-[#b076a4]'
                            }`}
                          >
                            {full ? 'Full' : `${occupancy}% filled`}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-gray-500">
                          {new Date(s.session_date).toLocaleDateString()} · {s.start_time}–{s.end_time} · {s.room}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="min-w-[120px] rounded-2xl bg-[#fcf8fd] px-4 py-3 text-center">
                          <div className={`text-sm font-semibold ${full ? 'text-red-500' : 'text-gray-800'}`}>
                            {s.booked_count}/{s.capacity}
                          </div>
                          <div className="mt-1 text-[11px] text-gray-400">Booked</div>
                        </div>

                        <Link
                          href="/trainer/attendance"
                          className="rounded-xl border border-[#eaddee] bg-white px-4 py-3 text-sm font-medium text-[#b076a4] transition hover:bg-[#fcf6fb]"
                        >
                          Mark Attendance
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}