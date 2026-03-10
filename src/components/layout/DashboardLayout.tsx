import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Calendar, Stethoscope,
  Settings, LogOut, Activity, ChevronLeft, ChevronRight, Bell, Search,
  UserCircle, BedDouble,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: UserRole[];
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { label: 'Overview', icon: LayoutDashboard, path: '/dashboard/owner', roles: ['hospital_owner'] },
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/branch', roles: ['branch_admin'] },
      { label: 'Patient Queue', icon: Stethoscope, path: '/dashboard/doctor', roles: ['doctor'] },
      { label: 'Reception', icon: UserCircle, path: '/dashboard/reception', roles: ['receptionist'] },
    ],
  },
  {
    title: 'Visits',
    items: [
      { label: 'Visit List', icon: Activity, path: '/dashboard/visits', roles: ['receptionist', 'branch_admin'] },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Branches', icon: Building2, path: '/dashboard/branches', roles: ['hospital_owner'] },
      { label: 'Staff', icon: Users, path: '/dashboard/staff', roles: ['hospital_owner', 'branch_admin'] },
      { label: 'Appointments', icon: Calendar, path: '/dashboard/appointments', roles: ['branch_admin', 'doctor', 'receptionist'] },
      { label: 'Patients', icon: Users, path: '/dashboard/patients', roles: ['hospital_owner', 'branch_admin', 'doctor', 'receptionist'] },
      { label: 'Bed Management', icon: BedDouble, path: '/dashboard/beds', roles: ['branch_admin'] },
      { label: 'Settings', icon: Settings, path: '/dashboard/settings', roles: ['hospital_owner', 'branch_admin'] },
    ],
  },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, tenant, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => user && item.roles.includes(user.role)),
    }))
    .filter((section) => section.items.length > 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-40 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <Activity className="h-6 w-6 text-sidebar-primary shrink-0" />
          {!collapsed && <span className="ml-2 font-bold text-lg">MedFlow</span>}
        </div>

        {/* Tenant info */}
        {!collapsed && tenant && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/60 uppercase tracking-wider">Organization</p>
            <p className="text-sm font-medium truncate">{tenant.name}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {filteredNav.map((item) => {
              const active = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                      active
                        ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors w-full"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Main */}
      <div className={cn('flex-1 transition-all duration-300', collapsed ? 'ml-16' : 'ml-64')}>
        {/* Top bar */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search patients, appointments..." className="pl-9 w-72 bg-muted/50" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">3</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                {user?.name?.charAt(0) || 'U'}
              </div>
              {!collapsed && (
                <div className="hidden md:block">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {user?.role?.replace('_', ' ')}
                    </Badge>
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
