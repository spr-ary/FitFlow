'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/axios';

export default function MemberBookPage() {
  const [sessions, setSessions]     = useState([]);
  const [bookings, setBookings]     = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [booking, setBooking]       = useState(null);
  const [message, setMessage]       = useState('');

  const fetchData = async () => {
    try {
      // Fetch sessions always
      const sRes = await api.get('/scheduling');
      setSessions(sRes.data.sessions);

      // Fetch bookings — may fail if no membership, that's ok
      try {
        const bRes = await api.get('/booking/my');
        setBookings(bRes.data.bookings.map(b => b.session_id));
      } catch {
        setBookings([]);
      }

      // Check membership status
      try {
        const mRes = await api.get('/membership/my');
        setMembership(mRes.data.membership);
      } catch {
        setMembership(null);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBook = async (sessionId) => {
    if (!membership || membership.status !== 'active') {
      setMessage('You need an active membership to book classes. Please contact the admin.');
      return;
    }
    setBooking(sessionId);
    setMessage('');
    try {
      const res = await api.post('/booking', { session_id: sessionId });
      setMessage(`Booked successfully! ${res.data.slots_remaining} slots remaining.`);
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed.');
    } finally {
      setBooking(null);
    }
  };

  return (
    <DashboardLayout allowedRoles={['member']}>
      <h1 className="text-2xl font-serif text-gray-700 mb-4">Book a Class</h1>

      {/* No membership warning */}
      {!loading && !membership && (
        <div className="mb-5 flex items-start gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div>
            <div className="text-sm font-medium text-amber-800 mb-0.5">No active membership</div>
            <div className="text-xs text-amber-700">
              You can browse classes but cannot book yet. Please contact the gym administrator to assign a membership plan to your account.
            </div>
          </div>
        </div>
      )}

      {/* Expired membership warning */}
      {!loading && membership && membership.status !== 'active' && (
        <div className="mb-5 flex items-start gap-3 px-4 py-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="w-5 h-5 rounded-full bg-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div>
            <div className="text-sm font-medium text-red-800 mb-0.5">Membership expired</div>
            <div className="text-xs text-red-700">
              Your {membership.plan_name} plan expired. Please contact the admin to renew.
            </div>
          </div>
        </div>
      )}

      {/* Success/error message */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${
          message.includes('success') || message.includes('Booked')
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          {message}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-400 rounded-full animate-spin"></div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {sessions.map(s => {
          const isBooked = bookings.includes(s.id);
          const isFull   = s.booked_count >= s.capacity && !isBooked;
          const slots    = s.capacity - s.booked_count;
          const hasActiveMembership = membership && membership.status === 'active';

          return (
            <div key={s.id} className={`bg-white rounded-2xl border p-5 transition ${
              isBooked ? 'border-pink-300 bg-pink-50' : 'border-pink-100 hover:border-pink-200'
            }`}>
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
                ) : !hasActiveMembership ? (
                  <span className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded-lg cursor-not-allowed">No plan</span>
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