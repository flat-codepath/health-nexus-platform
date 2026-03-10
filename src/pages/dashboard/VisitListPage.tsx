import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, Clock, Stethoscope, Filter, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { clinicalApi, type VisitRecord } from '@/api/clinical.api';
import { format } from 'date-fns';

function getTodayStr() {
  return format(new Date(), 'yyyy-MM-dd');
}

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-primary/10 text-primary',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function VisitListPage() {
  const [dateFrom, setDateFrom] = useState(getTodayStr());
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (dateFrom) params.created_at_after = dateFrom;
    if (dateTo) params.created_at_before = dateTo;
    return params;
  }, [dateFrom, dateTo]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['visits', queryParams],
    queryFn: () => clinicalApi.getVisits(queryParams),
  });

  const visits = response?.data || [];

  const filteredVisits = searchQuery
    ? visits.filter(
        (v) =>
          v.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.phone.includes(searchQuery) ||
          v.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : visits;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visits</h1>
          <p className="text-muted-foreground text-sm">Today's patient visits and admissions</p>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground">
          <Filter className="h-4 w-4 text-primary" />
          Filters
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Patient name, phone, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground mb-1 block">From Date</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs text-muted-foreground mb-1 block">To Date</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setDateFrom(getTodayStr());
              setDateTo('');
              setSearchQuery('');
            }}
          >
            Reset
          </Button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card border rounded-xl overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading visits...
          </div>
        ) : filteredVisits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <FileText className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No visits found</p>
            <p className="text-xs mt-1">Try adjusting your date filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Department</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Doctor</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Complaint</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date & Time</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.map((visit, i) => (
                  <motion.tr
                    key={visit.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                          {visit.patient_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <span className="font-medium text-foreground">{visit.patient_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{visit.phone}</td>
                    <td className="px-4 py-3 text-foreground">{visit.department}</td>
                    <td className="px-4 py-3 text-foreground">{visit.doctor}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs capitalize">
                        {visit.visit_type === 'follow_up' ? 'Follow-up' : 'Fresh'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate" title={visit.chief_complaint}>
                      {visit.chief_complaint}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {visit.created_at ? format(new Date(visit.created_at), 'MMM dd, hh:mm a') : '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          statusColors[visit.status] || statusColors.draft
                        }`}
                      >
                        {visit.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
