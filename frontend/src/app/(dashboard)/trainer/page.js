'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function TrainerDashboard() {
  return (
    <DashboardLayout allowedRoles={['trainer']}>
      <div>
        <h1 className="text-2xl font-serif text-gray-700 mb-6">My Sessions</h1>
        <div className="bg-white rounded-2xl p-5 border border-pink-100">
          <p className="text-gray-400 text-sm">Trainer dashboard — sessions will load here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}