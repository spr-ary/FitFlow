'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import api from '@/lib/axios';

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTrainers = async () => {
    try {
      const res = await api.get('/users/trainers');
      setTrainers(res.data.trainers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/users', { ...form, role: 'trainer' });
      setShowAdd(false);
      setForm({ name: '', email: '', password: '', phone: '' });
      fetchTrainers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add trainer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#bf8fb8]">Trainer Management</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-800">
              Trainers
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-500">
              Create trainer accounts and review assigned session counts.
            </p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="rounded-2xl border border-[#eaddee] bg-white px-5 py-3 text-sm font-medium text-[#b076a4] transition hover:bg-[#faf5fb]"
          >
            + Add Trainer
          </button>
        </div>

        {loading && (
          <div className="rounded-3xl border border-[#f1e7f4] bg-white p-8 text-sm text-gray-400">
            Loading trainers...
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {trainers.map((t) => (
            <div key={t.id} className="rounded-3xl border border-[#f1e7f4] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold bg-[#f6e8f2] text-[#b076a4]">
                  {t.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-gray-800">{t.name}</div>
                  <div className="truncate text-xs text-gray-400">{t.email}</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-[#fcf8fd] p-4">
                  <div className="text-xs text-gray-400">Sessions</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-800">{t.total_sessions}</div>
                </div>
                <div className="rounded-2xl bg-[#fcf8fd] p-4">
                  <div className="text-xs text-gray-400">Status</div>
                  <div className="mt-2 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                    Active
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Trainer">
          {error && <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          <form onSubmit={handleAdd} className="space-y-4">
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Trainer name' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'trainer@fitflow.com' },
              { label: 'Password', name: 'password', type: 'password', placeholder: 'Min 6 characters' },
              { label: 'Phone', name: 'phone', type: 'text', placeholder: '+66 89 000 0000' },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.name]}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
                  required={f.name !== 'phone'}
                />
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-[#e7a8c8] hover:bg-[#dc94b9] text-white text-sm rounded-xl transition disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Trainer'}
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