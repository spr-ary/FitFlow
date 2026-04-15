'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/axios';

export default function MemberSchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/scheduling');
        setSessions(res.data.sessions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const days = ['all', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const filtered =
    filter === 'all' ? sessions : sessions.filter((s) => s.day_of_week === filter);

  return (
    <DashboardLayout allowedRoles={['member']}>
      <div className="space-y-6">
        <div className="mb-2">
          <div className="mt-2 flex items-center gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-800">
              Class Schedule
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`rounded-full px-4 py-2 text-xs font-medium capitalize transition ${
                filter === d
                  ? 'bg-[#f4c7de] text-[#c94f8b]'
                  : 'border border-[#eee3f1] bg-white text-gray-500 hover:bg-[#fcf7fb]'
              }`}
            >
              {d === 'all' ? 'All Days' : d}
            </button>
          ))}
        </div>

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
                    <tr className="border-b border-[#f5eef7]">
                      {['Class', 'Trainer', 'Day', 'Time', 'Room', 'Slots'].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-[#c7a5bd]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                          No classes found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((s) => {
                        const slots = s.capacity - s.booked_count;
                        const full = slots <= 0;
                        return (
                          <tr key={s.id} className="border-b border-[#f8f1f9] last:border-0 hover:bg-[#fdf9fd]">
                            <td className="px-6 py-4 text-sm font-semibold text-gray-800">{s.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{s.trainer_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 capitalize">{s.day_of_week}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{s.start_time} – {s.end_time}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{s.room}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  full
                                    ? 'bg-red-50 text-red-500'
                                    : 'bg-emerald-50 text-emerald-600'
                                }`}
                              >
                                {full ? 'Full' : `${slots} left`}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 lg:hidden">
              {filtered.length === 0 ? (
                <div className="rounded-3xl border border-[#f1e7f4] bg-white p-8 text-center text-sm text-gray-400">
                  No classes found.
                </div>
              ) : (
                filtered.map((s) => {
                  const slots = s.capacity - s.booked_count;
                  const full = slots <= 0;

                  return (
                    <div key={s.id} className="rounded-3xl border border-[#f1e7f4] bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-semibold text-gray-800">{s.name}</h3>
                          <p className="mt-1 text-sm text-gray-400">{s.trainer_name}</p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            full ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {full ? 'Full' : `${slots} left`}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-[#fcf8fd] p-3">
                          <div className="text-xs text-gray-400">Day</div>
                          <div className="mt-1 capitalize text-gray-700">{s.day_of_week}</div>
                        </div>
                        <div className="rounded-2xl bg-[#fcf8fd] p-3">
                          <div className="text-xs text-gray-400">Time</div>
                          <div className="mt-1 text-gray-700">{s.start_time} – {s.end_time}</div>
                        </div>
                        <div className="rounded-2xl bg-[#fcf8fd] p-3 col-span-2">
                          <div className="text-xs text-gray-400">Room</div>
                          <div className="mt-1 text-gray-700">{s.room}</div>
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