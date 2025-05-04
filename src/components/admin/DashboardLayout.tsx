
import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Edit, 
  Shield, 
  Database,
  BarChart2,
  Settings
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import PageLayout from '@/components/PageLayout';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const { isAtLeastRole } = useUserRole();
  
  const navItems = [
    {
      name: 'Overview',
      path: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
      requiredRole: 'admin'
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      requiredRole: 'admin'
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: <FileText className="h-5 w-5" />,
      requiredRole: 'moderator'
    },
    {
      name: 'Content',
      path: '/admin/content',
      icon: <Edit className="h-5 w-5" />,
      requiredRole: 'moderator'
    },
    {
      name: 'Roles',
      path: '/admin/roles',
      icon: <Shield className="h-5 w-5" />,
      requiredRole: 'admin'
    },
    {
      name: 'Data',
      path: '/admin/data',
      icon: <Database className="h-5 w-5" />,
      requiredRole: 'admin'
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: <BarChart2 className="h-5 w-5" />,
      requiredRole: 'superadmin'
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
      requiredRole: 'admin'
    },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-card rounded-lg shadow-sm p-4">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  // Only show nav items the user has access to
                  if (!isAtLeastRole(item.requiredRole as any)) {
                    return null;
                  }
                  
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 bg-card rounded-lg shadow-sm p-6">
            {children}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardLayout;
