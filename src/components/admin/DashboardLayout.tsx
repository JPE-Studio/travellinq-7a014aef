
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Users,
  Settings,
  Flag,
  FileText,
  ShieldCheck,
  Database,
  Menu,
  X,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { pathname } = useLocation();
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);

  const routes = [
    {
      label: 'Overview',
      icon: BarChart3,
      href: '/admin',
      active: pathname === '/admin',
    },
    {
      label: 'User Management',
      icon: Users,
      href: '/admin/users',
      active: pathname === '/admin/users',
    },
    {
      label: 'Reports',
      icon: Flag,
      href: '/admin/reports',
      active: pathname === '/admin/reports',
    },
    {
      label: 'Content',
      icon: FileText,
      href: '/admin/content',
      active: pathname === '/admin/content',
    },
    {
      label: 'Roles',
      icon: ShieldCheck,
      href: '/admin/roles',
      active: pathname === '/admin/roles',
    },
    {
      label: 'Data Export',
      icon: Database,
      href: '/admin/data',
      active: pathname === '/admin/data',
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      href: '/admin/analytics',
      active: pathname === '/admin/analytics',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/admin/settings',
      active: pathname === '/admin/settings',
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Home className="h-6 w-6" />
            <span className="text-xl font-bold">Admin</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-2">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  route.active ? "bg-secondary" : "hover:bg-secondary/50"
                )}
                asChild
              >
                <Link to={route.href}>
                  <route.icon className="mr-2 h-5 w-5" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {profile?.pseudonym?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p className="font-medium text-sm">{profile?.pseudonym || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="p-6 border-b flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-semibold" onClick={() => setOpen(false)}>
              <Home className="h-6 w-6" />
              <span className="text-xl font-bold">Admin</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1 p-3">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant={route.active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    route.active ? "bg-secondary" : "hover:bg-secondary/50"
                  )}
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link to={route.href}>
                    <route.icon className="mr-2 h-5 w-5" />
                    {route.label}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t mt-auto">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {profile?.pseudonym?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <p className="font-medium text-sm">{profile?.pseudonym || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1">
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 bg-background border-b">
            <div className="container flex h-16 items-center justify-between py-4">
              <h1 className="text-2xl font-bold">{title}</h1>
              <div className="flex items-center gap-4">
                <Link to="/">
                  <Button variant="outline" size="sm">
                    Back to App
                  </Button>
                </Link>
              </div>
            </div>
          </header>
          <div className="flex-1 container py-6 md:py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
