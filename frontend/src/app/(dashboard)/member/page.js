'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import api from '@/lib/axios';

export default function MemberBookPage() {
  const [sessions, setSessions]   = useState([]);
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [booking, setBooking]     = useState(null);
  const [message, setMessage]     = useState('');

  const fetchData = async () => {
    try {
      const [sRes, bRes] = await Promise.all([
        api.get('/scheduling'),
        api.get('/booking/my'),
      ]);
      setSessions(sRes.data.sessions);
      setBookings(bRes.data.bookings.map(b => b.session_id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBook = async (sessionId) => {
    setBooking(sessionId);
    setMessage('');
    try {
      const res = await api.post('/booking', { session_id: sessionId });
      setMessage(`Booked! ${res.data.slots_remaining} slots remaining.`);
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed.');
    } finally {
      setBooking(null);
    }
  };

  return (
    <DashboardLayout allowedRoles={['member']}>
      <h1 className="text-2xl font-serif text-gray-700 mb-2">Book a Class</h1>

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${message.includes('Booked') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      {loading && <p className="text-gray-400 text-sm">Loading classes...</p>}

      <div className="grid grid-cols-3 gap-4">
        {sessions.map(s => {
          const isBooked = bookings.includes(s.id);
          const isFull   = s.booked_count >= s.capacity && !isBooked;
          const slots    = s.capacity - s.booked_count;

          return (
            <div key={s.id}
              className={`bg-white rounded-2xl border p-5 transition ${isBooked ? 'border-pink-300 bg-pink-50' : 'border-pink-100 hover:border-pink-200'}`}>
              <div className="text-xs text-gray-400 mb-1">
                {new Date(s.session_date).toLocaleDateString()} · {s.start_time}
              </div>
              <div className="text-base font-medium text-gray-700 mb-1">{s.name}</div>
              <div className="text-xs text-gray-400 mb-4">{s.trainer_name} · {s.room}</div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  {isFull
                    ? <span className="text-red-500">Full</span>
                    : isBooked
                    ? <span className="text-pink-500">Booked</span>
                    : `${slots} slot${slots !== 1 ? 's' : ''} left`}
                </div>
                {isBooked ? (
                  <span className="text-xs bg-pink-100 text-pink-500 px-2 py-1 rounded-lg">Booked ✓</span>
                ) : isFull ? (
                  <span className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-lg">Full</span>
                ) : (
                  <button
                    onClick={() => handleBook(s.id)}
                    disabled={booking === s.id}
                    className="text-xs bg-pink-400 hover:bg-pink-500 text-white px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                    {booking === s.id ? '...' : 'Book'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
} 