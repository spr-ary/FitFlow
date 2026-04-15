'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import api from '@/lib/axios';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/booking/my');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const upcoming = bookings.filter((b) => b.status === 'booked');
  const cancelled = bookings.filter((b) => b.status === 'cancelled');

  return (
    <DashboardLayout allowedRoles={['member']}>
      <div className="space-y-6">
        <div className="mb-2">
          <p className="text-sm font-medium text-[#c38bb5]">Member Area</p>
          <div className="mt-2 flex items-center gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-800">
              My Bookings
            </h1>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-gray-500">
            View your upcoming classes, track cancelled bookings, and manage your reservations in one place.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#f1e7f4] bg-white p-5 shadow-sm">
            <div className="text-xs text-gray-400">Upcoming</div>
            <div className="mt-2 text-2xl font-semibold text-gray-800">{upcoming.length}</div>
          </div>
          <div className="rounded-3xl border border-[#f1e7f4] bg-white p-5 shadow-sm">
            <div className="text-xs text-gray-400">Cancelled</div>
            <div className="mt-2 text-2xl font-semibold text-gray-800">{cancelled.length}</div>
          </div>
          <div className="rounded-3xl border border-[#f1e7f4] bg-white p-5 shadow-sm">
            <div className="text-xs text-gray-400">Total</div>
            <div className="mt-2 text-2xl font-semibold text-gray-800">{bookings.length}</div>
          </div>
        </div>

        {loading && (
          <div className="rounded-3xl border border-[#f1e7f4] bg-white p-10 text-center text-sm text-gray-400">
            Loading your bookings...
          </div>
        )}

        {!loading && (
          <>
            <section className="rounded-3xl border border-[#f1e7f4] bg-white shadow-sm overflow-hidden">
              <div className="border-b border-[#f5eef7] px-6 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c7a5bd]">
                      Upcoming
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-gray-800">
                      Reserved Classes
                    </h2>
                  </div>
                  <div className="rounded-full bg-[#fbf4fb] px-3 py-1 text-xs text-gray-500">
                    {upcoming.length} class{upcoming.length !== 1 ? 'es' : ''}
                  </div>
                </div>
              </div>

              {upcoming.length === 0 ? (
                <div className="px-6 py-10 text-sm text-gray-400">
                  No upcoming bookings.
                </div>
              ) : (
                <div className="divide-y divide-[#f7f0f8]">
                  {upcoming.map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 h-3 w-3 rounded-full bg-[#d98bb2] shadow-sm" />
                        <div>
                          <h3 className="text-base font-semibold text-gray-800">
                            {b.session_name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {new Date(b.session_date).toLocaleDateString()} · {b.start_time} · {b.room}
                          </p>
                          <p className="mt-1 text-sm text-gray-400">
                            Trainer: {b.trainer_name}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <Badge status="booked" />
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={cancelling === b.id}
                          className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          {cancelling === b.id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {cancelled.length > 0 && (
              <section className="rounded-3xl border border-[#f1e7f4] bg-white shadow-sm overflow-hidden">
                <div className="border-b border-[#f5eef7] px-6 py-5">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c7a5bd]">
                    History
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-gray-800">
                    Cancelled Bookings
                  </h2>
                </div>

                <div className="divide-y divide-[#f7f0f8]">
                  {cancelled.map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-400 line-through">
                          {b.session_name}
                        </div>
                        <div className="mt-1 text-xs text-gray-300">
                          {new Date(b.session_date).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge status="cancelled" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}