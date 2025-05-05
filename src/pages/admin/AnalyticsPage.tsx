
import React from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { getAppMetrics } from '@/services/adminService';
import { Loader2 } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalyticsPage: React.FC = () => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['app-metrics'],
    queryFn: getAppMetrics,
  });

  // Sample data - would be replaced with real data
  const userActivityData = [
    { name: '6 days ago', users: 132 },
    { name: '5 days ago', users: 124 },
    { name: '4 days ago', users: 145 },
    { name: '3 days ago', users: 162 },
    { name: '2 days ago', users: 148 },
    { name: 'Yesterday', users: 156 },
    { name: 'Today', users: metrics?.dailyActiveUsers || 0 },
  ];

  const mapCategoryData = () => {
    if (!metrics?.postsByCategory) return [];
    
    return Object.entries(metrics.postsByCategory).map(([category, count]) => ({
      name: category,
      value: count
    }));
  };

  const mapLocationData = () => {
    if (!metrics?.usersByLocation) return [];
    return metrics.usersByLocation.map(loc => ({
      name: loc.location,
      users: loc.count
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Analytics">
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Analytics">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          <p>Error loading analytics data</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{metrics?.newSignups} this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.dailyActiveUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((metrics?.dailyActiveUsers / metrics?.totalUsers) * 100).toFixed(1)}% of total users
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalPosts.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {(metrics?.totalPosts / metrics?.totalUsers).toFixed(1)} posts per user
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Signups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.newSignups}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="activity">
          <TabsList>
            <TabsTrigger value="activity">User Activity</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
                <CardDescription>
                  User activity over the past 7 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={userActivityData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Posts by Category</CardTitle>
                <CardDescription>
                  Distribution of posts across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mapCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mapCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Users by Location</CardTitle>
                <CardDescription>
                  Top locations of our users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={mapLocationData()}
                      layout="vertical"
                      margin={{
                        top: 5, right: 30, left: 100, bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="users" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
