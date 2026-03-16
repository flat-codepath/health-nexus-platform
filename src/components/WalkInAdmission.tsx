import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, Phone, Stethoscope,
  CheckCircle2, Receipt, Loader2, AlertCircle,
  UserPlus, Heart, ChevronDown, MapPin, Building2, User2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { clinicalApi, type PatientSearchResult, type WalkInPayload, type DoctorData } from '@/api/clinical.api';
import { organizationApi } from '@/api/organization.api';
import { useAuthStore } from '@/stores/authStore';

interface WalkInAdmissionProps {
  open: boolean;
  onClose: () => void;
}

const VISIT_TYPES = [
  { value: 'fresh' as const, label: 'Fresh Visit', description: 'First-time consultation', icon: '🆕' },
  { value: 'follow_up' as const, label: 'Follow-up', description: 'Returning patient', icon: '🔄' },
];

const GENDERS = ['Male', 'Female', 'Other'];

// Jira-style custom dropdown
function JiraDropdown({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  options,
  disabled,
  renderOption,
  renderSelected,
}: {
  label: string;
  icon: React.ElementType;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  options: { id: string; label: string; sub?: string }[];
  disabled?: boolean;
  renderOption?: (opt: { id: string; label: string; sub?: string }, selected: boolean) => React.ReactNode;
  renderSelected?: (opt: { id: string; label: string; sub?: string }) => React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const selected = options.find((o) => o.id === value);

  return (
    <div ref={ref} className="relative">
      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</Label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all text-sm ${
          isOpen
            ? 'border-primary ring-2 ring-primary/20 bg-background'
            : 'border-input bg-background hover:border-primary/40'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        {selected ? (
          renderSelected ? renderSelected(selected) : (
            <span className="flex-1 truncate text-foreground font-medium">{selected.label}</span>
          )
        ) : (
          <span className="flex-1 truncate text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 w-full bg-popover border rounded-lg shadow-lg overflow-hidden"
          >
            {options.length > 5 && (
              <div className="p-2 border-b">
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
              </div>
            )}
            <div className="max-h-[200px] overflow-y-auto p-1">
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No results found</p>
              )}
              {filtered.map((opt) => {
                const isSelected = opt.id === value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { onChange(opt.id); setIsOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {renderOption ? renderOption(opt, isSelected) : (
                      <>
                        <span className="flex-1 font-medium">{opt.label}</span>
                        {opt.sub && <span className="text-xs text-muted-foreground">{opt.sub}</span>}
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WalkInAdmission({ open, onClose }: WalkInAdmissionProps) {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);

  // Guard: only receptionist and branch_admin
  const allowedRoles = ['receptionist', 'branch_admin'];
  const hasAccess = user && allowedRoles.includes(user.role);

  // Search state
  const [phoneSearch, setPhoneSearch] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);

  // New patient fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');

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
  const { data: deptResponse, isLoading: deptsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: organizationApi.getDepartments,
    enabled: open,
  });

  // Load doctors by department (cascading)
  const { data: doctorResponse, isLoading: doctorsLoading } = useQuery({
    queryKey: ['departmentDoctors', departmentId],
    queryFn: () => clinicalApi.getDepartmentDoctors(departmentId),
    enabled: open && !!departmentId,
  });

  const departments = deptResponse?.data || [];
  const doctors = doctorResponse?.data || [];

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
      if (address.trim()) payload.address = address.trim();
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
    setAddress('');
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

  if (!hasAccess) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={handleClose} />
            <motion.div
              className="relative bg-background rounded-xl border shadow-2xl p-8 max-w-sm text-center"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            >
              <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Access Denied</h3>
              <p className="text-sm text-muted-foreground mt-1">Only receptionists and branch admins can admit walk-in patients.</p>
              <Button variant="outline" className="mt-5" onClick={handleClose}>Close</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  const deptOptions = departments.map((d) => ({ id: d.id, label: d.name, sub: d.branch_name }));
  const doctorOptions = doctors.map((d) => ({
    id: d.id,
    label: `Dr. ${d.first_name} ${d.last_name}`,
    sub: d.specialization,
  }));

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
            className="relative w-full max-w-[720px] bg-background rounded-2xl border shadow-2xl flex flex-col max-h-[92vh]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground tracking-tight">Walk-In Admission</h2>
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
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* ── Section 1: Patient Lookup ── */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <Search className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Patient Lookup</span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by phone number..."
                      value={phoneSearch}
                      onChange={(e) => {
                        setPhoneSearch(e.target.value);
                        setSearchTriggered(false);
                        setSelectedPatient(null);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-9"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSearch}
                    disabled={phoneSearch.length < 3 || isSearching}
                    className="px-4"
                  >
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                  </Button>
                </div>

                {/* Search results list */}
                <AnimatePresence>
                  {searchTriggered && patients.length > 0 && !selectedPatient && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-1"
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
                          <Badge variant="outline" className="text-xs">Select</Badge>
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
                      className="mt-3 flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5"
                    >
                      <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {selectedPatient.first_name} {selectedPatient.last_name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="font-mono">MRN: {selectedPatient.mrn}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{selectedPatient.phone}</span>
                        </div>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">Verified</Badge>
                      <button
                        onClick={() => setSelectedPatient(null)}
                        className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
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
                      className="mt-3 p-4 rounded-xl border border-dashed border-warning/40 bg-warning/5 space-y-3"
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold text-warning">
                        <AlertCircle className="h-4 w-4" />
                        No patient found — register new
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">First Name *</Label>
                          <Input
                            placeholder="John"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Last Name *</Label>
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
                          <Label className="text-xs text-muted-foreground">Phone *</Label>
                          <div className="relative mt-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              placeholder="9876543210"
                              value={phone || phoneSearch}
                              onChange={(e) => setPhone(e.target.value)}
                              className="pl-9"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Gender *</Label>
                          <div className="flex gap-1.5 mt-1">
                            {GENDERS.map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setGender(g)}
                                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                                  gender === g
                                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                                    : 'border-input bg-background text-muted-foreground hover:border-primary/30'
                                }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Address</Label>
                        <div className="relative mt-1">
                          <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
                          <Textarea
                            placeholder="123 Main Street, City, State"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="pl-9 min-h-[60px] resize-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Divider */}
              <div className="relative">
                <div className="border-t" />
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground font-medium">
                  Visit Details
                </span>
              </div>

              {/* ── Section 2: Visit Details ── */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-accent/10 flex items-center justify-center">
                    <Stethoscope className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Clinical Information</span>
                </div>

                {/* Visit Type */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Visit Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {VISIT_TYPES.map((vt) => (
                      <button
                        key={vt.value}
                        type="button"
                        onClick={() => setVisitType(vt.value)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          visitType === vt.value
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/15 shadow-sm'
                            : 'border-input hover:border-primary/30 hover:bg-muted/30'
                        }`}
                      >
                        <span className="text-lg">{vt.icon}</span>
                        <div>
                          <p className={`text-sm font-medium ${visitType === vt.value ? 'text-primary' : 'text-foreground'}`}>
                            {vt.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{vt.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department Dropdown */}
                <JiraDropdown
                  label="Department *"
                  icon={Building2}
                  placeholder={deptsLoading ? 'Loading departments...' : 'Select a department'}
                  value={departmentId}
                  onChange={setDepartmentId}
                  options={deptOptions}
                  disabled={deptsLoading}
                />

                {/* Doctor Dropdown — cascaded */}
                <JiraDropdown
                  label="Doctor *"
                  icon={User2}
                  placeholder={
                    !departmentId
                      ? 'Select a department first'
                      : doctorsLoading
                        ? 'Loading doctors...'
                        : 'Select a doctor'
                  }
                  value={doctorId}
                  onChange={setDoctorId}
                  options={doctorOptions}
                  disabled={!departmentId || doctorsLoading}
                  renderOption={(opt, selected) => (
                    <>
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {opt.label.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{opt.label}</p>
                        {opt.sub && <p className="text-[11px] text-muted-foreground">{opt.sub}</p>}
                      </div>
                      {selected && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </>
                  )}
                  renderSelected={(opt) => (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                        {opt.label.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="truncate font-medium text-foreground">{opt.label}</span>
                    </div>
                  )}
                />

                {/* Chief complaint */}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Chief Complaint *</Label>
                  <Textarea
                    placeholder="Describe the patient's primary complaint..."
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="border-t bg-muted/20 px-6 py-4 flex items-center justify-between rounded-b-2xl">
              <Button variant="ghost" onClick={handleClose} className="text-muted-foreground">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={walkInMutation.isPending}
                className="min-w-[220px] h-10 font-medium"
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
                  className="relative bg-background rounded-2xl border shadow-2xl p-8 max-w-sm w-full text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', duration: 0.35 }}
                >
                  <div className="mx-auto h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-7 w-7 text-success" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Patient Admitted</h3>
                  <p className="text-sm text-muted-foreground mt-1">{billingData.patientName} has been registered successfully.</p>

                  <div className="mt-5 p-4 bg-muted/50 rounded-xl space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Invoice ID</span>
                      <span className="font-mono text-xs text-foreground bg-muted px-2 py-0.5 rounded">{billingData.invoiceId.slice(0, 12)}...</span>
                    </div>
                    <div className="border-t" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Consultation Fee</span>
                      <span className="font-semibold text-foreground">$50.00</span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-5 h-10"
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
