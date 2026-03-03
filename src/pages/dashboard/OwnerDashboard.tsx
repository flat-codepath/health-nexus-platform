import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  DollarSign, Users, Stethoscope, BedDouble, TrendingUp, TrendingDown,
  Building2, MoreHorizontal, Plus, UserPlus,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { mockApi } from '@/api/mockApi';
import { useAuthStore } from '@/stores/authStore';
import { organizationApi } from '@/api/organization.api';
import BranchDialog from '@/components/BranchDialog';
import InviteStaffDialog from '@/components/InviteStaffDialog';

function StatCard({ title, value, change, icon: Icon, prefix = '', loading }: {
  title: string; value: number | string; change: number; icon: React.ElementType; prefix?: string; loading: boolean;
}) {
  const isPositive = change >= 0;
  return (
    <div className="stat-card">
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</p>
          <div className={`flex items-center gap-1 mt-1 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            <span>{Math.abs(change)}% vs last month</span>
          </div>
        </>
      )}
    </div>
  );
}

export default function OwnerDashboard() {
  const tenant = useAuthStore((s) => s.tenant);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['owner-dashboard'],
    queryFn: mockApi.getOwnerDashboard,
  });

  // Real API for branches
  const { data: branchesRes, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: organizationApi.getBranches,
  });

  const branches = branchesRes?.data ?? [];
  const stats = dashboard?.stats;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {useAuthStore.getState().user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">{tenant?.name} — Global Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Invite Staff
          </Button>
          <Button onClick={() => setBranchDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Branch
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Revenue" value={stats?.total_revenue ?? 0} change={stats?.revenue_change ?? 0} icon={DollarSign} prefix="$" loading={isLoading} />
        <StatCard title="Total Patients" value={stats?.total_patients ?? 0} change={stats?.patients_change ?? 0} icon={Users} loading={isLoading} />
        <StatCard title="Total Doctors" value={stats?.total_doctors ?? 0} change={stats?.doctors_change ?? 0} icon={Stethoscope} loading={isLoading} />
        <StatCard title="Active Admissions" value={stats?.active_admissions ?? 0} change={stats?.admissions_change ?? 0} icon={BedDouble} loading={isLoading} />
        <StatCard title="Bed Occupancy" value={`${stats?.bed_occupancy ?? 0}%`} change={stats?.occupancy_change ?? 0} icon={BedDouble} loading={isLoading} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <h3 className="font-semibold mb-4">Revenue Trend</h3>
          {isLoading ? <Skeleton className="h-[280px]" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dashboard?.revenue_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <h3 className="font-semibold mb-4">Patient Flow Today</h3>
          {isLoading ? <Skeleton className="h-[280px]" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dashboard?.patient_flow}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="checkins" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Check-ins" />
                <Bar dataKey="checkouts" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Check-outs" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Branches Table — now from real API */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Branch Management</h3>
          <Button variant="outline" size="sm" onClick={() => setBranchDialogOpen(true)}>
            <Plus className="mr-2 h-3.5 w-3.5" /> New Branch
          </Button>
        </div>
        {branchesLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
        ) : branches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No branches yet</p>
            <p className="text-sm mt-1">Create your first branch to get started.</p>
            <Button className="mt-4" size="sm" onClick={() => setBranchDialogOpen(true)}>
              <Plus className="mr-2 h-3.5 w-3.5" /> Create Branch
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">Branch</th>
                  <th className="text-left py-3 px-4 font-medium">City</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Beds</th>
                  <th className="text-right py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">{b.name}</span>
                          <p className="text-xs text-muted-foreground">{b.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{b.city}</td>
                    <td className="py-3 px-4">
                      <Badge variant={b.status === 'active' ? 'default' : 'secondary'}>{b.status}</Badge>
                    </td>
                    <td className="py-3 px-4">{b.total_beds}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Branch Create Dialog */}
      <BranchDialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen} />
      <InviteStaffDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />
    </div>
  );
}
