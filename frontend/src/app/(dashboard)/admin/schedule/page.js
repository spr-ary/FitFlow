'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import api from '@/lib/axios';

export default function SchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    trainer_id: '',
    room: '',
    day_of_week: 'monday',
    session_date: '',
    start_time: '',
    end_time: '',
    capacity: 20,
  });

  const fetchSessions = async () => {
    try {
      const [sRes, tRes] = await Promise.all([
        api.get('/scheduling'),
        api.get('/users/trainers'),
      ]);
      setSessions(sRes.data.sessions || []);
      setTrainers(tRes.data.trainers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/scheduling', form);
      setShowAdd(false);
      setForm({
        name: '',
        trainer_id: '',
        room: '',
        day_of_week: 'monday',
        session_date: '',
        start_time: '',
        end_time: '',
        capacity: 20,
      });
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create session.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/scheduling/${id}`);
      fetchSessions();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#bf8fb8]">Session Management</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-800">
              Class Schedule
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-500">
              Create, review, and remove scheduled classes.
            </p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="rounded-2xl border border-[#eaddee] bg-white px-5 py-3 text-sm font-medium text-[#b076a4] transition hover:bg-[#faf5fb]"
          >
            + Add Class
          </button>
        </div>

        <div className="hidden lg:block rounded-3xl border border-[#f1e7f4] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px]">
              <thead>
                <tr className="border-b border-[#f6eef8]">
                  {['Class', 'Trainer', 'Date', 'Time', 'Room', 'Capacity', 'Status', ''].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-4 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-[#c8a6bf]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-sm text-gray-400">
                      Loading...
                    </td>
                  </tr>
                )}

                {sessions.map((s) => {
                  const full = s.booked_count >= s.capacity;
                  return (
                    <tr key={s.id} className="border-b border-[#f8f1f9] last:border-0 hover:bg-[#fdf9fd]">
                      <td className="px-4 py-4 text-sm font-semibold text-gray-800">{s.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{s.trainer_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {new Date(s.session_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {s.start_time}–{s.end_time}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">{s.room}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className={full ? 'font-medium text-red-500' : 'text-gray-600'}>
                          {s.booked_count}/{s.capacity}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge status={full ? 'full' : 'open'} />
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-4 lg:hidden">
          {sessions.map((s) => {
            const full = s.booked_count >= s.capacity;
            return (
              <div key={s.id} className="rounded-3xl border border-[#f1e7f4] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">{s.name}</h3>
                    <p className="mt-1 text-sm text-gray-400">{s.trainer_name}</p>
                  </div>
                  <Badge status={full ? 'full' : 'open'} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-[#fcf8fd] p-3">
                    <div className="text-xs text-gray-400">Date</div>
                    <div className="mt-1 text-gray-700">{new Date(s.session_date).toLocaleDateString()}</div>
                  </div>
                  <div className="rounded-2xl bg-[#fcf8fd] p-3">
                    <div className="text-xs text-gray-400">Time</div>
                    <div className="mt-1 text-gray-700">{s.start_time}–{s.end_time}</div>
                  </div>
                  <div className="rounded-2xl bg-[#fcf8fd] p-3">
                    <div className="text-xs text-gray-400">Room</div>
                    <div className="mt-1 text-gray-700">{s.room}</div>
                  </div>
                  <div className="rounded-2xl bg-[#fcf8fd] p-3">
                    <div className="text-xs text-gray-400">Capacity</div>
                    <div className="mt-1 text-gray-700">{s.booked_count}/{s.capacity}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(s.id, s.name)}
                  className="mt-4 w-full rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                >
                  Delete Class
                </button>
              </div>
            );
          })}
        </div>

        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Class">
          {error && <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Class Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
                placeholder="e.g. Morning Yoga"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Trainer</label>
                <select
                  value={form.trainer_id}
                  onChange={(e) => setForm({ ...form, trainer_id: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300 bg-white"
                  required
                >
                  <option value="">Select trainer</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Room</label>
                <input
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
                  placeholder="Studio A"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={form.session_date}
                  onChange={(e) => setForm({ ...form, session_date: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Capacity</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-[#e7a8c8] hover:bg-[#dc94b9] text-white text-sm rounded-xl transition disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Class'}
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}