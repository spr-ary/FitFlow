'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function MemberDashboard() {
  return (
    <DashboardLayout allowedRoles={['member']}>
      <div>
        <h1 className="text-2xl font-serif text-gray-700 mb-6">Book a Class</h1>
        <div className="bg-white rounded-2xl p-5 border border-pink-100">
          <p className="text-gray-400 text-sm">Member dashboard — classes will load here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}