'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import api from '@/lib/axios';

export default function MembershipPage() {
  const [membership, setMembership] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [mRes, aRes] = await Promise.all([
          api.get('/membership/my'),
          api.get('/attendance/my'),
        ]);
        setMembership(mRes.data.membership);
        setAttendance((aRes.data.attendance || []).slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const daysLeft = membership
    ? Math.max(
        0,
        Math.ceil((new Date(membership.end_date) - new Date()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  return (
    <DashboardLayout allowedRoles={['member']}>
      <div className="space-y-6">
        <div className="mb-2">
          <div className="mt-2 flex items-center gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-800">
              My Membership
            </h1>
          </div>
        </div>

        {loading && (
          <div className="rounded-3xl border border-[#f1e7f4] bg-white p-10 text-center text-sm text-gray-400">
            Loading your membership...
          </div>
        )}

        {!loading && membership && (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[30px] border border-[#efdff2] bg-[#f6dfe9] p-6 text-gray-800 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#b47a99]">
                    {membership.plan_name}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-gray-800">
                    {membership.member_name || 'Member'}
                  </h2>
                  <div className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-[#b076a4]">
                    {membership.status}
                  </div>
                </div>

                <div className="rounded-3xl bg-white px-5 py-4">
                  <div className="text-xs text-gray-400">Days Remaining</div>
                  <div className="mt-1 text-3xl font-semibold text-gray-800">{daysLeft}</div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <div className="text-xs text-gray-400">Start Date</div>
                  <div className="mt-2 text-sm font-semibold text-gray-800">
                    {new Date(membership.start_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <div className="text-xs text-gray-400">Expiry Date</div>
                  <div className="mt-2 text-sm font-semibold text-gray-800">
                    {new Date(membership.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-3xl border border-[#f1e7f4] bg-white p-5 shadow-sm">
                <div className="text-xs text-gray-400">Plan</div>
                <div className="mt-2 text-lg font-semibold text-gray-800">
                  {membership.plan_name}
                </div>
              </div>
              <div className="rounded-3xl border border-[#f1e7f4] bg-white p-5 shadow-sm">
                <div className="text-xs text-gray-400">Status</div>
                <div className="mt-2">
                  <Badge status={membership.status} />
                </div>
              </div>
              <div className="rounded-3xl border border-[#f1e7f4] bg-white p-5 shadow-sm">
                <div className="text-xs text-gray-400">Recent Attendance</div>
                <div className="mt-2 text-lg font-semibold text-gray-800">
                  {attendance.length}
                </div>
              </div>
            </div>
          </div>
        )}

        {!membership && !loading && (
          <div className="rounded-3xl border border-[#f1e7f4] bg-white p-8 text-center text-sm text-gray-400">
            No active membership. Contact admin to get started.
          </div>
        )}

        <section className="rounded-3xl border border-[#f1e7f4] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#f5eef7] px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c7a5bd]">
              Attendance
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-800">
              Recent Attendance
            </h2>
          </div>

          {attendance.length === 0 ? (
            <div className="px-6 py-10 text-sm text-gray-400">
              No attendance records yet.
            </div>
          ) : (
            <div className="divide-y divide-[#f7f0f8]">
              {attendance.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      {a.session_name}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {new Date(a.session_date).toLocaleDateString()} · {a.trainer_name}
                    </div>
                  </div>
                  <Badge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}