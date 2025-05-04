
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { getAppMetrics } from '@/services/adminService';
import { AppMetrics } from '@/types/roles';

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AppMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await getAppMetrics();
        setMetrics(data);
      } catch (err: any) {
        console.error("Error fetching metrics:", err);
        setError(err.message || "Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Admin Dashboard">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics?.totalUsers || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics?.dailyActiveUsers || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics?.totalPosts || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Signups (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics?.newSignups || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Posts by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics?.postsByCategory && Object.entries(metrics.postsByCategory).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(metrics.postsByCategory).map(([category, count]) => (
                  <li key={category} className="flex justify-between items-center">
                    <span className="capitalize">{category}</span>
                    <span className="font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No post categories available</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top User Locations</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics?.usersByLocation && metrics.usersByLocation.length > 0 ? (
              <ul className="space-y-2">
                {metrics.usersByLocation.map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{item.location || "Unknown"}</span>
                    <span className="font-semibold">{item.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No location data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
