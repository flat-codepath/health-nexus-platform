import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, Calendar, CheckCircle2, Clock, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const mockQueue = [
  { id: '1', name: 'John Smith', phone: '+1-555-0201', time: '09:00', status: 'waiting', type: 'Walk-in' },
  { id: '2', name: 'Alice Brown', phone: '+1-555-0202', time: '09:15', status: 'checked_in', type: 'Appointment' },
  { id: '3', name: 'Robert Davis', phone: '+1-555-0203', time: '09:30', status: 'waiting', type: 'Appointment' },
  { id: '4', name: 'Emma Wilson', phone: '+1-555-0204', time: '10:00', status: 'waiting', type: 'Walk-in' },
];

export default function ReceptionDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const checkIn = (name: string) => {
    toast({ title: 'Patient Checked In', description: `${name} has been checked in successfully.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reception Desk</h1>
          <p className="text-muted-foreground">Manage walk-ins, appointments, and check-ins</p>
        </div>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button><UserPlus className="mr-2 h-4 w-4" /> Register Patient</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Register New Patient</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4" onSubmit={(e) => { e.preventDefault(); toast({ title: 'Patient registered successfully' }); }}>
                <div><Label>Full Name</Label><Input placeholder="John Smith" className="mt-1.5" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Phone</Label><Input placeholder="+1-555-0100" className="mt-1.5" /></div>
                  <div><Label>Email</Label><Input type="email" placeholder="patient@email.com" className="mt-1.5" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Date of Birth</Label><Input type="date" className="mt-1.5" /></div>
                  <div><Label>Gender</Label><Input placeholder="Male / Female" className="mt-1.5" /></div>
                </div>
                <div><Label>Blood Group</Label><Input placeholder="O+" className="mt-1.5" /></div>
                <Button type="submit" className="w-full">Register Patient</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline"><Calendar className="mr-2 h-4 w-4" /> Book Appointment</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Waiting', value: 12, icon: Clock, color: 'text-warning' },
          { label: 'Checked In', value: 8, icon: CheckCircle2, color: 'text-success' },
          { label: "Today's Appointments", value: 47, icon: Calendar, color: 'text-primary' },
          { label: 'Walk-ins', value: 15, icon: UserPlus, color: 'text-accent' },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <s.icon className={`h-6 w-6 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Queue */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Patient Queue</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
        <div className="space-y-2">
          {mockQueue.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  {p.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium">{p.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{p.type}</Badge>
                <Badge variant={p.status === 'checked_in' ? 'default' : 'secondary'}>
                  {p.status === 'checked_in' ? 'Checked In' : 'Waiting'}
                </Badge>
                {p.status !== 'checked_in' && (
                  <Button size="sm" onClick={() => checkIn(p.name)}>Check In</Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
