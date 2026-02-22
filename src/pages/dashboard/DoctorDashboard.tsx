import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, FileText, FlaskConical, Pill, CreditCard, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { mockApi } from '@/api/mockApi';
import { useAuthStore } from '@/stores/authStore';
import type { Appointment, PatientHistory } from '@/types';

const COLUMNS: { status: Appointment['status']; label: string; color: string }[] = [
  { status: 'checked_in', label: 'Checked In', color: 'bg-info' },
  { status: 'in_consult', label: 'In Consult', color: 'bg-warning' },
  { status: 'referred', label: 'Referred', color: 'bg-accent' },
  { status: 'under_testing', label: 'Under Testing', color: 'bg-primary' },
  { status: 'completed', label: 'Ready for Discharge', color: 'bg-success' },
];

const statusColors: Record<string, string> = {
  checked_in: 'bg-info/10 text-info border-info/20',
  in_consult: 'bg-warning/10 text-warning border-warning/20',
  referred: 'bg-accent/10 text-accent border-accent/20',
  under_testing: 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-success/10 text-success border-success/20',
  scheduled: 'bg-muted text-muted-foreground',
};

export default function DoctorDashboard() {
  const user = useAuthStore((s) => s.user);
  const branchId = user?.branch_id || 'branch_001';
  const [selectedPatient, setSelectedPatient] = useState<Appointment | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', branchId],
    queryFn: () => mockApi.getAppointments(branchId),
  });

  const { data: patientHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['patient-history', selectedPatient?.patient_id],
    queryFn: () => mockApi.getPatientHistory(selectedPatient?.patient_id || ''),
    enabled: !!selectedPatient,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Appointment['status'] }) =>
      mockApi.updateAppointmentStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['appointments', branchId] });
      const prev = queryClient.getQueryData<Appointment[]>(['appointments', branchId]);
      queryClient.setQueryData<Appointment[]>(['appointments', branchId], (old) =>
        old?.map((a) => (a.id === id ? { ...a, status } : a))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['appointments', branchId], ctx?.prev);
      toast({ title: 'Failed to update status', variant: 'destructive' });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['appointments', branchId] }),
  });

  const handleDrop = (status: Appointment['status']) => {
    if (draggedItem) {
      updateStatus.mutate({ id: draggedItem, status });
      setDraggedItem(null);
      toast({ title: 'Patient moved', description: `Status updated to ${status.replace('_', ' ')}` });
    }
  };

  const getColumnItems = (status: Appointment['status']) =>
    appointments?.filter((a) => a.status === status) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Patient Queue</h1>
        <p className="text-muted-foreground">Drag patients between columns to update their status</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 min-h-[500px]">
          {COLUMNS.map((col) => (
            <div
              key={col.status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.status)}
              className="bg-muted/50 rounded-xl p-3 border border-dashed border-border"
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                <span className="text-sm font-medium">{col.label}</span>
                <Badge variant="secondary" className="ml-auto text-xs">{getColumnItems(col.status).length}</Badge>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {getColumnItems(col.status).map((apt) => (
                    <motion.div
                      key={apt.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      draggable
                      onDragStart={() => setDraggedItem(apt.id)}
                      onClick={() => setSelectedPatient(apt)}
                      className="bg-card rounded-lg p-3 border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {apt.patient_name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{apt.patient_name}</p>
                          <p className="text-xs text-muted-foreground">{apt.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">{apt.department}</Badge>
                        <Badge variant="outline" className="text-[10px]">{apt.type}</Badge>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Detail Sheet */}
      <AnimatePresence>
        {selectedPatient && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPatient(null)}
              className="fixed inset-0 bg-foreground/50 z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-card border-l z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-lg font-bold">{selectedPatient.patient_name}</h2>
                  <Badge className={statusColors[selectedPatient.status]}>
                    {selectedPatient.status.replace('_', ' ')}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedPatient(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4">
                <Tabs defaultValue="history">
                  <TabsList className="w-full">
                    <TabsTrigger value="history" className="flex-1"><Clock className="h-3.5 w-3.5 mr-1.5" />History</TabsTrigger>
                    <TabsTrigger value="labs" className="flex-1"><FlaskConical className="h-3.5 w-3.5 mr-1.5" />Labs</TabsTrigger>
                    <TabsTrigger value="prescriptions" className="flex-1"><Pill className="h-3.5 w-3.5 mr-1.5" />Rx</TabsTrigger>
                    <TabsTrigger value="billing" className="flex-1"><CreditCard className="h-3.5 w-3.5 mr-1.5" />Billing</TabsTrigger>
                  </TabsList>

                  <TabsContent value="history" className="mt-4 space-y-4">
                    {historyLoading ? (
                      [1, 2].map((i) => <Skeleton key={i} className="h-32" />)
                    ) : (
                      patientHistory?.map((h) => (
                        <div key={h.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{h.date}</span>
                            <Badge variant="outline">{h.branch_name}</Badge>
                          </div>
                          <p className="text-sm"><span className="text-muted-foreground">Dept:</span> {h.department}</p>
                          <p className="text-sm"><span className="text-muted-foreground">Doctor:</span> {h.doctor_name}</p>
                          <p className="text-sm"><span className="text-muted-foreground">Diagnosis:</span> {h.diagnosis}</p>
                          <p className="text-xs text-muted-foreground mt-2">{h.notes}</p>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="labs" className="mt-4 space-y-3">
                    {patientHistory?.flatMap((h) =>
                      h.lab_reports.map((lab, i) => (
                        <div key={`${h.id}-${i}`} className="border rounded-lg p-3 flex items-center gap-3">
                          <FlaskConical className="h-5 w-5 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{lab.name}</p>
                            <p className="text-xs text-muted-foreground">{lab.result} — {lab.date}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="prescriptions" className="mt-4 space-y-3">
                    {patientHistory?.flatMap((h) =>
                      h.prescriptions.map((rx, i) => (
                        <div key={`${h.id}-${i}`} className="border rounded-lg p-3 flex items-center gap-3">
                          <Pill className="h-5 w-5 text-accent shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{rx}</p>
                            <p className="text-xs text-muted-foreground">{h.date} — {h.doctor_name}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="billing" className="mt-4">
                    {patientHistory?.map((h) => (
                      <div key={h.id} className="border rounded-lg p-4 mb-3">
                        <p className="text-sm font-medium mb-2">{h.date} — {h.branch_name}</p>
                        {h.billing.map((b, i) => (
                          <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0">
                            <span className="text-muted-foreground">{b.item}</span>
                            <span className="font-medium">${b.amount}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm pt-2 font-bold">
                          <span>Total</span>
                          <span>${h.billing.reduce((s, b) => s + b.amount, 0)}</span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
