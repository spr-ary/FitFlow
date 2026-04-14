'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';

export default function TrainerDashboard() {
  const { user }                  = useAuth();
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);

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

  const today = sessions.filter(s =>
    new Date(s.session_date).toDateString() === new Date().toDateString()
  );

  return (
    <DashboardLayout allowedRoles={['trainer']}>
      <h1 className="text-2xl font-serif text-gray-700 mb-6">My Sessions</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl p-5 text-white">
          <div className="text-3xl font-medium mb-1">{today.length}</div>
          <div className="text-xs opacity-75">Classes Today</div>
        </div>
        <div className="bg-white rounded-2xl border border-pink-100 p-5">
          <div className="text-3xl font-medium text-gray-700 mb-1">{sessions.length}</div>
          <div className="text-xs text-gray-400">Total Sessions</div>
        </div>
        <div className="bg-white rounded-2xl border border-pink-100 p-5">
          <div className="text-3xl font-medium text-gray-700 mb-1">
            {sessions.reduce((sum, s) => sum + (s.booked_count || 0), 0)}
          </div>
          <div className="text-xs text-gray-400">Total Bookings</div>
        </div>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading sessions...</p>}

      <div className="bg-white rounded-2xl border border-pink-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">All My Sessions</div>
        </div>
        {sessions.length === 0 && !loading && (
          <div className="px-5 py-6 text-sm text-gray-400">No sessions assigned yet.</div>
        )}
        {sessions.map(s => {
          const full = s.booked_count >= s.capacity;
          return (
            <div key={s.id} className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0">
              <div>
                <div className="text-sm font-medium text-gray-700">{s.name}</div>
                <div className="text-xs text-gray-400">
                  {new Date(s.session_date).toLocaleDateString()} · {s.start_time}–{s.end_time} · {s.room}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`text-sm font-medium ${full ? 'text-red-500' : 'text-gray-700'}`}>
                    {s.booked_count}/{s.capacity}
                  </div>
                  <div className="text-xs text-gray-400">booked</div>
                </div>
                <a href="/trainer/attendance"
                  className="text-xs bg-pink-50 text-pink-500 border border-pink-200 px-3 py-1.5 rounded-lg hover:bg-pink-100 transition">
                  Attendance
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}