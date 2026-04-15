'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import api from '@/lib/axios';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [addError, setAddError] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  const [showAssign, setShowAssign] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignForm, setAssignForm] = useState({ plan_id: '', start_date: '' });
  const [assignError, setAssignError] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        api.get('/users/members'),
        api.get('/membership/plans'),
      ]);
      setMembers(mRes.data.members || []);
      setPlans((pRes.data.plans || []).filter((p) => p.is_active));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddSaving(true);
    setAddError('');
    try {
      await api.post('/users', { ...addForm, role: 'member' });
      setShowAdd(false);
      setAddForm({ name: '', email: '', password: '', phone: '' });
      fetchData();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setAddSaving(false);
    }
  };

  const openAssign = (member) => {
    setAssignTarget(member);
    setAssignForm({ plan_id: plans[0]?.id || '', start_date: '' });
    setAssignError('');
    setShowAssign(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignSaving(true);
    setAssignError('');
    try {
      await api.post('/membership/assign', {
        user_id: assignTarget.id,
        plan_id: assignForm.plan_id,
        start_date: assignForm.start_date || undefined,
      });
      setShowAssign(false);
      setAssignTarget(null);
      fetchData();
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Failed to assign membership.');
    } finally {
      setAssignSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#bf8fb8]">Member Management</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-800">
              Members
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-500">
              Manage member accounts and assign membership plans.
            </p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="rounded-2xl border border-[#eaddee] bg-white px-5 py-3 text-sm font-medium text-[#b076a4] transition hover:bg-[#faf5fb]"
          >
            + Add Member
          </button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member"
            className="w-full md:max-w-sm rounded-2xl border border-[#ece1ef] bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#d9bfd3]"
          />

          <div className="rounded-full bg-[#f9f4fa] px-4 py-2 text-xs text-gray-500">
            {filtered.length} member{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="hidden lg:block rounded-3xl border border-[#f1e7f4] bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-[#f6eef8]">
                  {['Member', 'Email', 'Plan', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-[#c8a6bf]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      <div className="mx-auto h-6 w-6 rounded-full border-2 border-[#eaddee] border-t-[#c895bc] animate-spin" />
                    </td>
                  </tr>
                )}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                      No members found.
                    </td>
                  </tr>
                )}

                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-[#f8f1f9] last:border-0 hover:bg-[#fdf9fd]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#f6e8f2] text-[#b076a4] flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{m.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {m.plan_name || (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
                          No plan
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={m.membership_status || 'inactive'} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openAssign(m)}
                          className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                            !m.plan_name
                              ? 'bg-[#e7a8c8] text-white hover:bg-[#dc94b9]'
                              : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {!m.plan_name ? 'Assign Plan' : 'Renew'}
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.name)}
                          className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-4 lg:hidden">
          {!loading &&
            filtered.map((m) => (
              <div key={m.id} className="rounded-3xl border border-[#f1e7f4] bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f6e8f2] text-[#b076a4] flex items-center justify-center text-xs font-semibold">
                      {m.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-800">{m.name}</div>
                      <div className="text-xs text-gray-400">{m.email}</div>
                    </div>
                  </div>
                  <Badge status={m.membership_status || 'inactive'} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-[#fcf8fd] p-3">
                    <div className="text-xs text-gray-400">Plan</div>
                    <div className="mt-1 text-gray-700">{m.plan_name || 'No plan'}</div>
                  </div>
                  <div className="rounded-2xl bg-[#fcf8fd] p-3">
                    <div className="text-xs text-gray-400">Joined</div>
                    <div className="mt-1 text-gray-700">{new Date(m.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openAssign(m)}
                    className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition ${
                      !m.plan_name
                        ? 'bg-[#e7a8c8] text-white hover:bg-[#dc94b9]'
                        : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {!m.plan_name ? 'Assign Plan' : 'Renew'}
                  </button>
                  <button
                    onClick={() => handleDelete(m.id, m.name)}
                    className="flex-1 rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
        </div>

        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Member">
          {addError && (
            <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{addError}</div>
          )}
          <form onSubmit={handleAdd} className="space-y-4">
            {[
              { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Full name' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'email@example.com' },
              { label: 'Password', name: 'password', type: 'password', placeholder: 'Min 6 characters' },
              { label: 'Phone', name: 'phone', type: 'text', placeholder: '+66 89 000 0000 (optional)' },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={addForm[f.name]}
                  onChange={(e) => setAddForm({ ...addForm, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300 transition"
                  required={f.name !== 'phone'}
                />
              </div>
            ))}
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-600">
              After adding the member, use <strong>Assign Plan</strong> to give them an active membership.
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={addSaving}
                className="flex-1 py-2.5 bg-[#e7a8c8] hover:bg-[#dc94b9] text-white text-sm rounded-xl transition disabled:opacity-50"
              >
                {addSaving ? 'Adding...' : 'Add Member'}
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

        <Modal
          isOpen={showAssign}
          onClose={() => {
            setShowAssign(false);
            setAssignTarget(null);
          }}
          title={`Assign Membership — ${assignTarget?.name || ''}`}
        >
          {assignError && (
            <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{assignError}</div>
          )}

          {assignTarget && (
            <div className="mb-4 p-3 bg-[#fcf8fd] rounded-xl">
              <div className="text-xs text-gray-400 mb-1">Current status</div>
              <div className="flex items-center gap-2">
                <Badge status={assignTarget.membership_status || 'inactive'} />
                <span className="text-sm text-gray-600">
                  {assignTarget.plan_name
                    ? `${assignTarget.plan_name} plan`
                    : 'No membership plan assigned'}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Select Plan</label>
              <select
                value={assignForm.plan_id}
                onChange={(e) => setAssignForm({ ...assignForm, plan_id: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300 bg-white"
                required
              >
                <option value="">Choose a plan...</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ฿{Number(p.price).toLocaleString()} / {p.duration}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Start Date <span className="text-gray-300 font-normal">(optional — defaults to today)</span>
              </label>
              <input
                type="date"
                value={assignForm.start_date}
                onChange={(e) => setAssignForm({ ...assignForm, start_date: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
              />
            </div>

            <div className="p-3 bg-pink-50 border border-pink-100 rounded-xl text-xs text-pink-600">
              This will cancel any existing active membership and assign the new plan immediately.
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={assignSaving}
                className="flex-1 py-2.5 bg-[#e7a8c8] hover:bg-[#dc94b9] text-white text-sm rounded-xl transition disabled:opacity-50"
              >
                {assignSaving ? 'Assigning...' : 'Assign Membership'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAssign(false);
                  setAssignTarget(null);
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