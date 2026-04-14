'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import api from '@/lib/axios';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/booking/my');
      setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await api.patch(`/booking/${id}/cancel`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed.');
    } finally {
      setCancelling(null);
    }
  };

  const upcoming = bookings.filter(b => b.status === 'booked');
  const past     = bookings.filter(b => b.status === 'cancelled');

  return (
    <DashboardLayout allowedRoles={['member']}>
      <h1 className="text-2xl font-serif text-gray-700 mb-6">My Bookings</h1>

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}

      {/* Upcoming */}
      <div className="bg-white rounded-2xl border border-pink-100 mb-4">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Upcoming</div>
        </div>
        {upcoming.length === 0 && (
          <div className="px-5 py-6 text-sm text-gray-400">No upcoming bookings.</div>
        )}
        {upcoming.map(b => (
          <div key={b.id} className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-pink-400 flex-shrink-0"></div>
              <div>
                <div className="text-sm font-medium text-gray-700">{b.session_name}</div>
                <div className="text-xs text-gray-400">
                  {new Date(b.session_date).toLocaleDateString()} · {b.start_time} · {b.room} · {b.trainer_name}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge status="booked" />
              <button
                onClick={() => handleCancel(b.id)}
                disabled={cancelling === b.id}
                className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2 py-1 rounded-lg transition disabled:opacity-50">
                {cancelling === b.id ? '...' : 'Cancel'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cancelled */}
      {past.length > 0 && (
        <div className="bg-white rounded-2xl border border-pink-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Cancelled</div>
          </div>
          {past.map(b => (
            <div key={b.id} className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0">
              <div>
                <div className="text-sm text-gray-400 line-through">{b.session_name}</div>
                <div className="text-xs text-gray-300">{new Date(b.session_date).toLocaleDateString()}</div>
              </div>
              <Badge status="cancelled" />
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}