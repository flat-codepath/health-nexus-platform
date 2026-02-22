import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  DollarSign, Users, Stethoscope, BedDouble, Calendar, TrendingUp,
  TrendingDown, Plus, UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { mockApi } from '@/api/mockApi';
import { useAuthStore } from '@/stores/authStore';

const departments = [
  { name: 'Cardiology', doctors: 8, patients: 45, status: 'active' },
  { name: 'General Medicine', doctors: 12, patients: 67, status: 'active' },
  { name: 'Orthopedics', doctors: 6, patients: 32, status: 'active' },
  { name: 'Pediatrics', doctors: 5, patients: 28, status: 'active' },
  { name: 'Neurology', doctors: 4, patients: 19, status: 'setup' },
];

export default function BranchDashboard() {
  const user = useAuthStore((s) => s.user);
  const branchId = user?.branch_id || 'branch_001';

  const { data: stats, isLoading } = useQuery({
    queryKey: ['branch-stats', branchId],
    queryFn: () => mockApi.getBranchStats(branchId),
  });

  const statCards = [
    { title: "Today's Appointments", value: stats?.todays_appointments ?? 0, change: 5.2, icon: Calendar },
    { title: 'Branch Revenue', value: `$${((stats?.total_revenue ?? 0) / 1000).toFixed(0)}k`, change: stats?.revenue_change ?? 0, icon: DollarSign },
    { title: 'Active Doctors', value: stats?.total_doctors ?? 0, change: stats?.doctors_change ?? 0, icon: Stethoscope },
    { title: 'Available Beds', value: stats?.available_beds ?? 0, change: stats?.occupancy_change ?? 0, icon: BedDouble },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Branch Dashboard</h1>
          <p className="text-muted-foreground">Downtown Medical Center</p>
        </div>
        <Button><UserPlus className="mr-2 h-4 w-4" /> Invite Staff</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
            {isLoading ? (
              <div className="space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-20" /></div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground font-medium">{s.title}</p>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <div className={`flex items-center gap-1 mt-1 text-sm ${s.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {s.change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  <span>{Math.abs(s.change)}%</span>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Departments */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Departments</h3>
          <Button variant="outline" size="sm"><Plus className="mr-2 h-3.5 w-3.5" /> Add Department</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-3 px-4 font-medium">Department</th>
                <th className="text-left py-3 px-4 font-medium">Doctors</th>
                <th className="text-left py-3 px-4 font-medium">Active Patients</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.name} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 font-medium flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Stethoscope className="h-4 w-4 text-primary" />
                    </div>
                    {d.name}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{d.doctors}</td>
                  <td className="py-3 px-4">{d.patients}</td>
                  <td className="py-3 px-4">
                    <Badge variant={d.status === 'active' ? 'default' : 'secondary'}>{d.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm">Manage</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
