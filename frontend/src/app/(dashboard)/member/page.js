'use client';
import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/axios';

export default function MemberBookPage() {
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const sRes = await api.get('/scheduling');
      setSessions(sRes.data.sessions || []);

      try {
        const bRes = await api.get('/booking/my');
        setBookings((bRes.data.bookings || []).map((b) => b.session_id));
      } catch {
        setBookings([]);
      }

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

  useEffect(() => {
    fetchData();
  }, []);

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

  const activePlan = useMemo(() => membership && membership.status === 'active', [membership]);

  return (
    <DashboardLayout allowedRoles={['member']}>
      <div className="space-y-6">
        <div className="rounded-[28px] border border-[#f1e7f4] bg-gradient-to-r from-[#fff7fb] via-[#f7f4ff] to-[#eef6ff] p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#c38bb5]">Classes</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-800">
                Book a Class
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Browse available sessions, check remaining slots, and reserve classes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-[#f1e7f4]">
                <div className="text-xs text-gray-400">Sessions</div>
                <div className="mt-1 text-xl font-semibold text-gray-800">{sessions.length}</div>
              </div>
              <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-[#f1e7f4]">
                <div className="text-xs text-gray-400">Booked</div>
                <div className="mt-1 text-xl font-semibold text-gray-800">{bookings.length}</div>
              </div>
              <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm ring-1 ring-[#f1e7f4] col-span-2 sm:col-span-1">
                <div className="text-xs text-gray-400">Plan</div>
                <div className="mt-1 text-sm font-semibold text-gray-800">
                  {membership?.plan_name || 'No plan'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {!loading && !membership && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            <div className="font-medium">No active membership</div>
            <div className="mt-1 text-xs text-amber-700">
              You can browse classes but cannot book yet. Please contact the gym administrator to assign a membership plan to your account.
            </div>
          </div>
        )}

        {!loading && membership && membership.status !== 'active' && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
            <div className="font-medium">Membership expired</div>
            <div className="mt-1 text-xs text-red-700">
              Your {membership.plan_name} plan expired. Please contact the admin to renew.
            </div>
          </div>
        )}

        {message && (
          <div
            className={`rounded-3xl px-5 py-4 text-sm ${
              message.includes('success') || message.includes('Booked')
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border border-red-200 bg-red-50 text-red-600'
            }`}
          >
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 rounded-full border-2 border-pink-200 border-t-fuchsia-400 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {sessions.map((s) => {
              const isBooked = bookings.includes(s.id);
              const isFull = s.booked_count >= s.capacity && !isBooked;
              const slots = s.capacity - s.booked_count;

              return (
                <div
                  key={s.id}
                  className={`rounded-[28px] border p-5 shadow-sm transition ${
                    isBooked
                      ? 'border-pink-200 bg-gradient-to-br from-pink-50 to-fuchsia-50'
                      : 'border-[#f1e7f4] bg-white hover:shadow-md hover:border-[#ead8f0]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-gray-400">
                        {new Date(s.session_date).toLocaleDateString()} · {s.start_time}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-gray-800">{s.name}</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {s.trainer_name} · {s.room}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        isBooked
                          ? 'bg-pink-100 text-pink-600'
                          : isFull
                          ? 'bg-red-50 text-red-500'
                          : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {isBooked ? 'Booked' : isFull ? 'Full' : `${slots} left`}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-[#fcf8fd] p-3">
                      <div className="text-xs text-gray-400">Day</div>
                      <div className="mt-1 capitalize text-gray-700">{s.day_of_week}</div>
                    </div>
                    <div className="rounded-2xl bg-[#fcf8fd] p-3">
                      <div className="text-xs text-gray-400">Time</div>
                      <div className="mt-1 text-gray-700">{s.start_time}–{s.end_time}</div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="text-xs text-gray-400">
                      Capacity {s.booked_count}/{s.capacity}
                    </div>

                    {isBooked ? (
                      <span className="rounded-xl bg-pink-100 px-3 py-2 text-xs font-medium text-pink-600">
                        Booked ✓
                      </span>
                    ) : isFull ? (
                      <span className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-400">
                        Full
                      </span>
                    ) : !activePlan ? (
                      <span className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-400">
                        No plan
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBook(s.id)}
                        disabled={booking === s.id}
                        className="rounded-xl bg-gradient-to-r from-pink-300 via-fuchsia-300 to-indigo-200 px-4 py-2 text-xs font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
                      >
                        {booking === s.id ? 'Booking...' : 'Book Now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}