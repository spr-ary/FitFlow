'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import api from '@/lib/axios';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', duration: 'monthly', price: '', description: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/membership/plans');
      setPlans(res.data.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openEdit = (plan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      duration: plan.duration,
      price: plan.price,
      description: plan.description || '',
    });
    setShowAdd(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/membership/plans/${editing.id}`, form);
      } else {
        await api.post('/membership/plans', form);
      }
      setShowAdd(false);
      setEditing(null);
      setForm({ name: '', duration: 'monthly', price: '', description: '' });
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/membership/plans/${id}/toggle`);
      fetchPlans();
    } catch (err) {
      alert('Failed to toggle plan.');
    }
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#bf8fb8]">Membership Setup</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-800">
              Membership Plans
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-500">
              Create, edit, and manage available plans for members.
            </p>
          </div>

          <button
            onClick={() => {
              setEditing(null);
              setForm({ name: '', duration: 'monthly', price: '', description: '' });
              setShowAdd(true);
            }}
            className="rounded-2xl border border-[#eaddee] bg-white px-5 py-3 text-sm font-medium text-[#b076a4] transition hover:bg-[#faf5fb]"
          >
            + New Plan
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading && (
            <div className="rounded-3xl border border-[#f1e7f4] bg-white p-8 text-sm text-gray-400">
              Loading plans...
            </div>
          )}

          {!loading &&
            plans.map((p) => (
              <div
                key={p.id}
                className="rounded-3xl border border-[#f1e7f4] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">{p.name}</h2>
                    <p className="mt-1 text-sm capitalize text-gray-400">{p.duration}</p>
                  </div>
                  <Badge status={p.is_active ? 'active' : 'inactive'} />
                </div>

                <div className="mt-5 rounded-2xl bg-[#fcf8fd] p-4">
                  <div className="text-xs text-gray-400">Price</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-800">
                    ฿{Number(p.price).toLocaleString()}
                  </div>
                </div>

                <p className="mt-4 min-h-[48px] text-sm text-gray-500">
                  {p.description || 'No description provided.'}
                </p>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 rounded-xl border border-[#eaddee] px-3 py-2 text-sm font-medium text-[#b076a4] transition hover:bg-[#faf5fb]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggle(p.id)}
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-50"
                  >
                    {p.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
        </div>

        <Modal
          isOpen={showAdd}
          onClose={() => {
            setShowAdd(false);
            setEditing(null);
          }}
          title={editing ? 'Edit Plan' : 'New Membership Plan'}
        >
          {error && <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Plan Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
                placeholder="e.g. Premium"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Duration</label>
                <select
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300 bg-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Price (฿)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300 resize-none"
                rows={3}
                placeholder="What's included..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-[#e7a8c8] hover:bg-[#dc94b9] text-white text-sm rounded-xl transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Plan'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setEditing(null);
                }}
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