import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, User, Phone, FileText, Stethoscope,
  ChevronRight, CheckCircle2, Receipt, Loader2, AlertCircle,
  UserPlus, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { clinicalApi, type PatientSearchResult, type WalkInPayload } from '@/api/clinical.api';
import { organizationApi, type DepartmentData } from '@/api/organization.api';

interface WalkInAdmissionProps {
  open: boolean;
  onClose: () => void;
}

const VISIT_TYPES = [
  { value: 'fresh' as const, label: 'Fresh Visit', description: 'First-time consultation' },
  { value: 'follow_up' as const, label: 'Follow-up', description: 'Returning for ongoing care' },
];

const GENDERS = ['Male', 'Female', 'Other'];

export default function WalkInAdmission({ open, onClose }: WalkInAdmissionProps) {
  const { toast } = useToast();

  // Search state
  const [phoneSearch, setPhoneSearch] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);

  // New patient fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');

  // Visit fields
  const [visitType, setVisitType] = useState<'fresh' | 'follow_up'>('fresh');
  const [departmentId, setDepartmentId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');

  // Billing modal
  const [billingData, setBillingData] = useState<{ invoiceId: string; patientName: string } | null>(null);

  // Search patients
  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ['patientSearch', phoneSearch],
    queryFn: () => clinicalApi.searchPatients(phoneSearch),
    enabled: searchTriggered && phoneSearch.length >= 3,
  });

  // Load departments
  const { data: deptResponse } = useQuery({
    queryKey: ['departments'],
    queryFn: organizationApi.getDepartments,
    enabled: open,
  });

  // Load doctors
  const { data: doctorResponse } = useQuery({
    queryKey: ['doctors'],
    queryFn: clinicalApi.getDoctors,
    enabled: open,
  });

  const departments = deptResponse?.data || [];
  const allDoctors = doctorResponse?.data || [];
  const filteredDoctors = departmentId
    ? allDoctors.filter((d) => d.department_id === departmentId)
    : allDoctors;

  const patients = searchResults?.data || [];
  const noPatientFound = searchTriggered && phoneSearch.length >= 3 && !isSearching && patients.length === 0;

  // Reset doctor when department changes
  useEffect(() => {
    setDoctorId('');
  }, [departmentId]);

  const handleSearch = useCallback(() => {
    if (phoneSearch.length >= 3) {
      setSearchTriggered(true);
      setSelectedPatient(null);
    }
  }, [phoneSearch]);

  const selectPatient = (p: PatientSearchResult) => {
    setSelectedPatient(p);
    setPhone(p.phone);
  };

  // Submit mutation
  const walkInMutation = useMutation({
    mutationFn: clinicalApi.createWalkIn,
    onSuccess: (res) => {
      if (res.data) {
        setBillingData({
          invoiceId: res.data.invoice_id,
          patientName: res.data.patient_name,
        });
      }
    },
    onError: () => {
      toast({ title: 'Submission failed', description: 'Please try again.', variant: 'destructive' });
    },
  });

  const handleSubmit = () => {
    if (!departmentId || !doctorId || !chiefComplaint.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }

    const payload: WalkInPayload = {
      doctor_id: doctorId,
      department_id: departmentId,
      visit_type: visitType,
      chief_complaint: chiefComplaint.trim(),
    };

    if (selectedPatient) {
      payload.patient_id = selectedPatient.id;
    } else {
      if (!firstName.trim() || !lastName.trim() || !phone.trim() || !gender) {
        toast({ title: 'Missing patient info', description: 'Fill all patient fields.', variant: 'destructive' });
        return;
      }
      payload.first_name = firstName.trim();
      payload.last_name = lastName.trim();
      payload.phone = phone.trim();
      payload.gender = gender;
    }

    walkInMutation.mutate(payload);
  };

  const resetForm = () => {
    setPhoneSearch('');
    setSearchTriggered(false);
    setSelectedPatient(null);
    setFirstName('');
    setLastName('');
    setPhone('');
    setGender('');
    setVisitType('fresh');
    setDepartmentId('');
    setDoctorId('');
    setChiefComplaint('');
    setBillingData(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-[680px] bg-background rounded-xl border shadow-2xl flex flex-col max-h-[92vh]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Walk-In Admission</h2>
                  <p className="text-xs text-muted-foreground">Register & admit a walk-in patient</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* ── Section 1: Patient Lookup ── */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Search className="h-4 w-4 text-primary" />
                  Find Patient
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by phone number..."
                    value={phoneSearch}
                    onChange={(e) => {
                      setPhoneSearch(e.target.value);
                      setSearchTriggered(false);
                      setSelectedPatient(null);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSearch}
                    disabled={phoneSearch.length < 3 || isSearching}
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Search results list */}
                <AnimatePresence>
                  {searchTriggered && patients.length > 0 && !selectedPatient && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5"
                    >
                      {patients.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => selectPatient(p)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                        >
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {p.first_name[0]}{p.last_name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{p.first_name} {p.last_name}</p>
                            <p className="text-xs text-muted-foreground">MRN: {p.mrn} · {p.phone}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Selected patient card */}
                <AnimatePresence>
                  {selectedPatient && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {selectedPatient.first_name} {selectedPatient.last_name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>MRN: {selectedPatient.mrn}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{selectedPatient.phone}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary/30">Existing</Badge>
                      <button
                        onClick={() => setSelectedPatient(null)}
                        className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* New patient form */}
                <AnimatePresence>
                  {noPatientFound && !selectedPatient && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="space-y-3 p-4 rounded-lg border border-dashed border-warning/40 bg-warning/5"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-warning">
                        <AlertCircle className="h-4 w-4" />
                        No patient found — register new
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">First Name</Label>
                          <Input
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Last Name</Label>
                          <Input
                            placeholder="Doe"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Phone</Label>
                          <Input
                            placeholder="9876543210"
                            value={phone || phoneSearch}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Gender</Label>
                          <div className="flex gap-1.5 mt-1">
                            {GENDERS.map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setGender(g)}
                                className={`flex-1 py-2 rounded-md text-xs font-medium border transition-all ${
                                  gender === g
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border bg-background text-muted-foreground hover:border-primary/30'
                                }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Divider */}
              <div className="border-t" />

              {/* ── Section 2: Visit Details ── */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  Visit Details
                </div>

                {/* Visit Type chips */}
                <div>
                  <Label className="text-xs text-muted-foreground">Visit Type</Label>
                  <div className="flex gap-2 mt-1.5">
                    {VISIT_TYPES.map((vt) => (
                      <button
                        key={vt.value}
                        type="button"
                        onClick={() => setVisitType(vt.value)}
                        className={`flex-1 p-3 rounded-lg border text-left transition-all ${
                          visitType === vt.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <p className={`text-sm font-medium ${visitType === vt.value ? 'text-primary' : 'text-foreground'}`}>
                          {vt.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{vt.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department selection */}
                <div>
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {departments.map((dept) => (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => setDepartmentId(dept.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          departmentId === dept.id
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-foreground hover:border-primary/40'
                        }`}
                      >
                        {dept.name}
                      </button>
                    ))}
                    {departments.length === 0 && (
                      <p className="text-xs text-muted-foreground py-1.5">Loading departments...</p>
                    )}
                  </div>
                </div>

                {/* Doctor selection — cascaded by department */}
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Doctor {departmentId ? '' : '(select department first)'}
                  </Label>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {filteredDoctors.map((doc) => (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setDoctorId(doc.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${
                          doctorId === doc.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {doc.first_name[0]}{doc.last_name[0]}
                        </div>
                        <span className={`text-xs font-medium ${doctorId === doc.id ? 'text-primary' : 'text-foreground'}`}>
                          Dr. {doc.first_name} {doc.last_name}
                        </span>
                      </button>
                    ))}
                    {departmentId && filteredDoctors.length === 0 && (
                      <p className="text-xs text-muted-foreground py-1.5">No doctors in this department</p>
                    )}
                    {!departmentId && (
                      <p className="text-xs text-muted-foreground py-1.5 italic">Select a department above</p>
                    )}
                  </div>
                </div>

                {/* Chief complaint */}
                <div>
                  <Label className="text-xs text-muted-foreground">Chief Complaint</Label>
                  <Textarea
                    placeholder="Describe the patient's primary complaint..."
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    className="mt-1.5 min-h-[80px] resize-none"
                  />
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="border-t bg-muted/20 px-6 py-4 flex items-center justify-between rounded-b-xl">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={walkInMutation.isPending}
                className="min-w-[200px]"
              >
                {walkInMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Heart className="h-4 w-4 mr-2" />
                )}
                Admit Patient & Generate Bill
              </Button>
            </div>
          </motion.div>

          {/* ── Billing Collection Modal ── */}
          <AnimatePresence>
            {billingData && (
              <motion.div
                className="absolute inset-0 z-10 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
                <motion.div
                  className="relative bg-background rounded-xl border shadow-2xl p-8 max-w-sm w-full text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', duration: 0.35 }}
                >
                  <div className="mx-auto h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-7 w-7 text-success" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Patient Admitted</h3>
                  <p className="text-sm text-muted-foreground mt-1">{billingData.patientName} has been registered.</p>

                  <div className="mt-5 p-4 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Invoice ID</span>
                      <span className="font-mono text-xs text-foreground">{billingData.invoiceId.slice(0, 12)}...</span>
                    </div>
                    <div className="border-t" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Consultation Fee</span>
                      <span className="font-semibold text-foreground">$50.00</span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-5"
                    onClick={() => {
                      toast({ title: 'Payment recorded', description: 'Invoice marked as paid.' });
                      handleClose();
                    }}
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
