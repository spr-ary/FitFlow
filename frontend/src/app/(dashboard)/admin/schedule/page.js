'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import api from '@/lib/axios';

export default function SchedulePage() {
  const [sessions, setSessions]   = useState([]);
  const [trainers, setTrainers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [error, setError]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState({
    name:'', trainer_id:'', room:'', day_of_week:'monday',
    session_date:'', start_time:'', end_time:'', capacity:20
  });

  const fetchSessions = async () => {
    try {
      const [sRes, tRes] = await Promise.all([
        api.get('/scheduling'),
        api.get('/users/trainers'),
      ]);
      setSessions(sRes.data.sessions);
      setTrainers(tRes.data.trainers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/scheduling', form);
      setShowAdd(false);
      setForm({ name:'', trainer_id:'', room:'', day_of_week:'monday', session_date:'', start_time:'', end_time:'', capacity:20 });
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-gray-700">Class Schedule</h1>
        <button onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-pink-400 hover:bg-pink-500 text-white text-sm rounded-xl transition">
          + Add Class
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Class','Trainer','Date','Time','Room','Capacity','Status',''].map(h => (
                <th key={h} className="text-left text-xs text-gray-400 font-medium uppercase tracking-wide px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="text-center py-8 text-gray-400 text-sm">Loading...</td></tr>}
            {sessions.map(s => {
              const full = s.booked_count >= s.capacity;
              return (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-pink-50/30 transition">
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.trainer_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.session_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.start_time}–{s.end_time}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.room}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={full ? 'text-red-500 font-medium' : 'text-gray-600'}>
                      {s.booked_count}/{s.capacity}
                    </span>
                  </td>
                  <td className="px-4 py-3"><Badge status={full ? 'full' : 'open'} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(s.id, s.name)}
                      className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2 py-1 rounded-lg transition">
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Class">
        {error && <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Class Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
              placeholder="e.g. Morning Yoga" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Trainer</label>
              <select value={form.trainer_id} onChange={e => setForm({...form, trainer_id: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300 bg-white" required>
                <option value="">Select trainer</option>
                {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Room</label>
              <input value={form.room} onChange={e => setForm({...form, room: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
                placeholder="Studio A" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input type="date" value={form.session_date} onChange={e => setForm({...form, session_date: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Capacity</label>
              <input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
                min="1" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
              <input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
              <input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300" required />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-pink-400 hover:bg-pink-500 text-white text-sm rounded-xl transition disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Class'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)}
              className="flex-1 py-2.5 border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}