
import React from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';

const SettingsPage: React.FC = () => {
  return (
    <DashboardLayout title="Admin Settings">
      <div className="text-center p-12 text-muted-foreground">
        <p>Admin settings will be available soon.</p>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
