'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/axios';

export default function TrainerSchedulePage() {
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

  return (
    <DashboardLayout allowedRoles={['trainer']}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#efe3f3] bg-[#fcf8fd] p-6 md:p-8">
          <p className="text-sm font-medium text-[#c08cb6]">Schedule</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-800">
            My Schedule
          </h1>
        </section>

        {loading && (
          <div className="rounded-3xl border border-[#f1e7f4] bg-white p-10 text-center text-sm text-gray-400">
            Loading schedule...
          </div>
        )}

        {!loading && (
          <>
            <div className="hidden lg:block rounded-3xl border border-[#f1e7f4] bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px]">
                  <thead>
                    <tr className="border-b border-[#f6eef8]">
                      {['Class', 'Date', 'Time', 'Room', 'Booked', 'Capacity'].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-[#c8a6bf]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                          No sessions yet.
                        </td>
                      </tr>
                    ) : (
                      sessions.map((s) => {
                        const pct = s.capacity ? Math.round((s.booked_count / s.capacity) * 100) : 0;
                        const full = s.booked_count >= s.capacity;

                        return (
                          <tr key={s.id} className="border-b border-[#f8f1f9] last:border-0 hover:bg-[#fdf9fd]">
                            <td className="px-6 py-4 text-sm font-semibold text-gray-800">{s.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(s.session_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {s.start_time}–{s.end_time}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{s.room}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-2 w-24 overflow-hidden rounded-full bg-[#f4ecf7]">
                                  <div
                                    className={`h-full rounded-full ${full ? 'bg-red-300' : 'bg-pink-300'}`}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">{s.booked_count}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{s.capacity}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 lg:hidden">
              {sessions.length === 0 ? (
                <div className="rounded-3xl border border-[#f1e7f4] bg-white p-8 text-center text-sm text-gray-400">
                  No sessions yet.
                </div>
              ) : (
                sessions.map((s) => {
                  const pct = s.capacity ? Math.round((s.booked_count / s.capacity) * 100) : 0;
                  const full = s.booked_count >= s.capacity;

                  return (
                    <div key={s.id} className="rounded-3xl border border-[#f1e7f4] bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-semibold text-gray-800">{s.name}</h3>
                          <p className="mt-1 text-sm text-gray-400">
                            {new Date(s.session_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            full ? 'bg-red-50 text-red-500' : 'bg-[#f7eef9] text-[#b076a4]'
                          }`}
                        >
                          {full ? 'Full' : `${pct}%`}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-[#fcf8fd] p-3">
                          <div className="text-xs text-gray-400">Time</div>
                          <div className="mt-1 text-gray-700">{s.start_time}–{s.end_time}</div>
                        </div>
                        <div className="rounded-2xl bg-[#fcf8fd] p-3">
                          <div className="text-xs text-gray-400">Room</div>
                          <div className="mt-1 text-gray-700">{s.room}</div>
                        </div>
                        <div className="rounded-2xl bg-[#fcf8fd] p-3">
                          <div className="text-xs text-gray-400">Booked</div>
                          <div className="mt-1 text-gray-700">{s.booked_count}</div>
                        </div>
                        <div className="rounded-2xl bg-[#fcf8fd] p-3">
                          <div className="text-xs text-gray-400">Capacity</div>
                          <div className="mt-1 text-gray-700">{s.capacity}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}