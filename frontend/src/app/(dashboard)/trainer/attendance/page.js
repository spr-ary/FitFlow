'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/axios';

export default function AttendancePage() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/scheduling/trainer/my');
        const list = res.data.sessions || [];
        setSessions(list);

        if (list.length > 0) {
          setSelected(list[0].id);
          loadAttendance(list[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const loadAttendance = async (sessionId) => {
    try {
      const res = await api.get(`/attendance/session/${sessionId}`);
      setAttendance(res.data.attendance || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (sessionId) => {
    setSelected(sessionId);
    loadAttendance(sessionId);
    setMessage('');
  };

  const handleMark = (id, status) => {
    setAttendance((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const records = attendance.map((a) => ({
        attendance_id: a.id,
        status: a.status,
      }));

      await api.post('/attendance/bulk', {
        session_id: selected,
        records,
      });

      setMessage('Attendance saved successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const present = attendance.filter((a) => a.status === 'present').length;
  const absent = attendance.filter((a) => a.status === 'absent').length;
  const unmarked = attendance.filter((a) => a.status === 'unmarked').length;

  return (
    <DashboardLayout allowedRoles={['trainer']}>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-[#efe3f3] bg-[#fcf8fd] p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#c08cb6]">Attendance</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-800">
                Mark Attendance
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Select a session, review attendees, and update attendance with a cleaner responsive interface.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-[#e4f2e6] bg-[#f6fbf7] px-4 py-4 text-center shadow-sm">
                <div className="text-2xl font-semibold text-green-700">{present}</div>
                <div className="mt-1 text-xs text-green-600">Present</div>
              </div>
              <div className="rounded-2xl border border-[#f6e0e0] bg-[#fff7f7] px-4 py-4 text-center shadow-sm">
                <div className="text-2xl font-semibold text-red-500">{absent}</div>
                <div className="mt-1 text-xs text-red-400">Absent</div>
              </div>
              <div className="rounded-2xl border border-[#efe7f3] bg-[#faf8fc] px-4 py-4 text-center shadow-sm">
                <div className="text-2xl font-semibold text-gray-500">{unmarked}</div>
                <div className="mt-1 text-xs text-gray-400">Unmarked</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#f1e7f4] bg-white p-5 shadow-sm">
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#c8a6bf]">
            Select Session
          </label>
          <select
            value={selected || ''}
            onChange={(e) => handleSelect(Number(e.target.value))}
            className="w-full rounded-2xl border border-[#ece1ef] bg-[#fcf8fd] px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#d8b6cf]"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {new Date(s.session_date).toLocaleDateString()} {s.start_time}
              </option>
            ))}
          </select>
        </section>

        {message && (
          <div
            className={`rounded-2xl px-5 py-4 text-sm ${
              message.includes('success')
                ? 'border border-green-200 bg-green-50 text-green-700'
                : 'border border-red-200 bg-red-50 text-red-600'
            }`}
          >
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-[#f1e7f4] bg-white p-10 text-center text-sm text-gray-400">
            Loading attendance...
          </div>
        ) : (
          <section className="rounded-3xl border border-[#f1e7f4] bg-white shadow-sm overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-[#f6eef8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#c8a6bf]">
                  Attendees
                </p>
                <h2 className="mt-1 text-lg font-semibold text-gray-800">
                  {attendance.length} Participant{attendance.length !== 1 ? 's' : ''}
                </h2>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl border border-[#eaddee] bg-[#fcf8fd] px-4 py-2 text-sm font-medium text-[#b076a4] transition hover:bg-[#f8effa] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>

            {attendance.length === 0 ? (
              <div className="px-6 py-10 text-sm text-gray-400">
                No bookings for this session.
              </div>
            ) : (
              <div className="divide-y divide-[#f7f0f8]">
                {attendance.map((a) => {
                  const initials = a.member_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={a.id}
                      className="flex flex-col gap-4 px-6 py-5 xl:flex-row xl:items-center xl:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6e8f2] text-xs font-semibold text-[#b076a4]">
                          {initials}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{a.member_name}</div>
                          <div className="mt-1 text-xs text-gray-400">Attendance record #{a.id}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {['present', 'absent', 'unmarked'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleMark(a.id, status)}
                            className={`rounded-xl border px-3 py-2 text-xs font-medium capitalize transition ${
                              a.status === status
                                ? status === 'present'
                                  ? 'border-green-200 bg-green-50 text-green-700'
                                  : status === 'absent'
                                  ? 'border-red-200 bg-red-50 text-red-600'
                                  : 'border-gray-200 bg-gray-100 text-gray-500'
                                : 'border-[#ece1ef] bg-white text-gray-400 hover:bg-[#faf6fb]'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}