'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/axios';

export default function TrainerSchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/scheduling/trainer/my');
        setSessions(res.data.sessions);
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
      <h1 className="text-2xl font-serif text-gray-700 mb-6">My Schedule</h1>

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}

      <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Class','Date','Time','Room','Booked','Capacity'].map(h => (
                <th key={h} className="text-left text-xs text-gray-400 font-medium uppercase tracking-wide px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && !loading && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No sessions yet.</td></tr>
            )}
            {sessions.map(s => {
              const pct  = Math.round((s.booked_count / s.capacity) * 100);
              const full = s.booked_count >= s.capacity;
              return (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-pink-50/30 transition">
                  <td className="px-5 py-3 text-sm font-medium text-gray-700">{s.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {new Date(s.session_date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{s.start_time}–{s.end_time}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{s.room}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${full ? 'bg-red-400' : 'bg-pink-400'}`}
                          style={{ width: `${Math.min(pct,100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{s.booked_count}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{s.capacity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}