'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import api from '@/lib/axios';

export default function MembersPage() {
  const [members, setMembers]       = useState([]);
  const [plans, setPlans]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');

  // Add member modal
  const [showAdd, setShowAdd]       = useState(false);
  const [addForm, setAddForm]       = useState({ name:'', email:'', password:'', phone:'' });
  const [addError, setAddError]     = useState('');
  const [addSaving, setAddSaving]   = useState(false);

  // Assign membership modal
  const [showAssign, setShowAssign]       = useState(false);
  const [assignTarget, setAssignTarget]   = useState(null);
  const [assignForm, setAssignForm]       = useState({ plan_id:'', start_date:'' });
  const [assignError, setAssignError]     = useState('');
  const [assignSaving, setAssignSaving]   = useState(false);

  const fetchData = async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        api.get('/users/members'),
        api.get('/membership/plans'),
      ]);
      setMembers(mRes.data.members);
      setPlans(pRes.data.plans.filter(p => p.is_active));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── ADD MEMBER ────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    setAddSaving(true);
    setAddError('');
    try {
      await api.post('/users', { ...addForm, role: 'member' });
      setShowAdd(false);
      setAddForm({ name:'', email:'', password:'', phone:'' });
      fetchData();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setAddSaving(false);
    }
  };

  // ── ASSIGN MEMBERSHIP ─────────────────────────────────
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
        user_id:    assignTarget.id,
        plan_id:    assignForm.plan_id,
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

  // ── DELETE ────────────────────────────────────────────
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-gray-700">Members</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-pink-400 hover:bg-pink-500 text-white text-sm rounded-xl transition">
          + Add Member
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full max-w-sm px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300 transition"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Member','Email','Plan','Status','Joined','Actions'].map(h => (
                <th key={h} className="text-left text-xs text-gray-400 font-medium uppercase tracking-wide px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="text-center py-10">
                <div className="w-6 h-6 border-2 border-pink-200 border-t-pink-400 rounded-full animate-spin mx-auto"></div>
              </td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No members found.</td></tr>
            )}
            {filtered.map(m => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-pink-50/30 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-200 text-pink-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {m.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{m.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-400">{m.email}</td>
                <td className="px-5 py-3 text-sm text-gray-600">
                  {m.plan_name || (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">No plan</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <Badge status={m.membership_status || 'inactive'} />
                </td>
                <td className="px-5 py-3 text-sm text-gray-400">
                  {new Date(m.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {/* Assign / Renew membership button */}
                    <button
                      onClick={() => openAssign(m)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                        !m.plan_name
                          ? 'bg-pink-400 text-white border-pink-400 hover:bg-pink-500'
                          : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}>
                      {!m.plan_name ? 'Assign Plan' : 'Renew'}
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.name)}
                      className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2.5 py-1 rounded-lg transition">
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── ADD MEMBER MODAL ─────────────────────────── */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Member">
        {addError && (
          <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{addError}</div>
        )}
        <form onSubmit={handleAdd} className="space-y-4">
          {[
            { label:'Full Name', name:'name',     type:'text',     placeholder:'Full name' },
            { label:'Email',     name:'email',    type:'email',    placeholder:'email@example.com' },
            { label:'Password',  name:'password', type:'password', placeholder:'Min 6 characters' },
            { label:'Phone',     name:'phone',    type:'text',     placeholder:'+66 89 000 0000 (optional)' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
              <input
                type={f.type}
                value={addForm[f.name]}
                onChange={e => setAddForm({...addForm, [f.name]: e.target.value})}
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
            <button type="submit" disabled={addSaving}
              className="flex-1 py-2.5 bg-pink-400 hover:bg-pink-500 text-white text-sm rounded-xl transition disabled:opacity-50">
              {addSaving ? 'Adding...' : 'Add Member'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)}
              className="flex-1 py-2.5 border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* ── ASSIGN MEMBERSHIP MODAL ──────────────────── */}
      <Modal
        isOpen={showAssign}
        onClose={() => { setShowAssign(false); setAssignTarget(null); }}
        title={`Assign Membership — ${assignTarget?.name || ''}`}
      >
        {assignError && (
          <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{assignError}</div>
        )}

        {/* Current status */}
        {assignTarget && (
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
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
              onChange={e => setAssignForm({...assignForm, plan_id: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300 bg-white"
              required
            >
              <option value="">Choose a plan...</option>
              {plans.map(p => (
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
              onChange={e => setAssignForm({...assignForm, start_date: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
            />
          </div>

          <div className="p-3 bg-pink-50 border border-pink-100 rounded-xl text-xs text-pink-600">
            This will cancel any existing active membership and assign the new plan immediately.
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={assignSaving}
              className="flex-1 py-2.5 bg-pink-400 hover:bg-pink-500 text-white text-sm rounded-xl transition disabled:opacity-50">
              {assignSaving ? 'Assigning...' : 'Assign Membership'}
            </button>
            <button type="button" onClick={() => { setShowAssign(false); setAssignTarget(null); }}
              className="flex-1 py-2.5 border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}