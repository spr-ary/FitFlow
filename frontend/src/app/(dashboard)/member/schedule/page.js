'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/axios';

export default function MemberSchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/scheduling');
        setSessions(res.data.sessions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const days = ['all','monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

  const filtered = filter === 'all'
    ? sessions
    : sessions.filter(s => s.day_of_week === filter);

  return (
    <DashboardLayout allowedRoles={['member']}>
      <h1 className="text-2xl font-serif text-gray-700 mb-6">Class Schedule</h1>

      {/* Day filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {days.map(d => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className={`px-3 py-1.5 rounded-xl text-xs capitalize transition ${
              filter === d
                ? 'bg-pink-400 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-pink-300'
            }`}>
            {d === 'all' ? 'All Days' : d}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}

      <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Class','Trainer','Day','Time','Room','Slots'].map(h => (
                <th key={h} className="text-left text-xs text-gray-400 font-medium uppercase tracking-wide px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No classes found.</td></tr>
            )}
            {filtered.map(s => {
              const slots = s.capacity - s.booked_count;
              const full  = slots <= 0;
              return (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-pink-50/30 transition">
                  <td className="px-5 py-3 text-sm font-medium text-gray-700">{s.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{s.trainer_name}</td>
                  <td className="px-5 py-3 text-sm text-gray-500 capitalize">{s.day_of_week}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{s.start_time}–{s.end_time}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{s.room}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                      full ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
                    }`}>
                      {full ? 'Full' : `${slots} left`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}