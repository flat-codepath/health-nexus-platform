import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { clinicalApi, type PatientSearchResult, type WalkInPayload } from '@/api/clinical.api';
import { organizationApi } from '@/api/organization.api';
import { useAuthStore } from '@/stores/authStore';

import AccessDeniedModal from '@/components/walkin/AccessDeniedModal';
import PatientLookup from '@/components/walkin/PatientLookup';
import NewPatientForm from '@/components/walkin/NewPatientForm';
import VisitDetailsSection from '@/components/walkin/VisitDetailsSection';
import BillingModal from '@/components/walkin/BillingModal';

interface WalkInAdmissionProps {
  open: boolean;
  onClose: () => void;
}

export default function WalkInAdmission({ open, onClose }: WalkInAdmissionProps) {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);

  const allowedRoles = ['receptionist', 'branch_admin'];
  const hasAccess = user && allowedRoles.includes(user.role);

  // Patient search state
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

  // Billing
  const [billingData, setBillingData] = useState<{ invoiceId: string; patientName: string } | null>(null);

  // Queries
  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ['patientSearch', phoneSearch],
    queryFn: () => clinicalApi.searchPatients(phoneSearch),
    enabled: searchTriggered && phoneSearch.length >= 3,
  });

  const { data: deptResponse, isLoading: deptsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: organizationApi.getDepartments,
    enabled: open,
  });

  const { data: doctorResponse, isLoading: doctorsLoading } = useQuery({
    queryKey: ['departmentDoctors', departmentId],
    queryFn: () => clinicalApi.getDepartmentDoctors(departmentId),
    enabled: open && !!departmentId,
  });

  const departments = deptResponse?.data || [];
  const doctors = doctorResponse?.data || [];
  const patients = searchResults?.data || [];
  const showNewPatientForm = searchTriggered && phoneSearch.length >= 3 && !isSearching && patients.length === 0 && !selectedPatient;

  useEffect(() => { setDoctorId(''); }, [departmentId]);

  const handleSearch = useCallback(() => {
    if (phoneSearch.length >= 3) {
      setSearchTriggered(true);
      setSelectedPatient(null);
    }
  }, [phoneSearch]);

  const handlePhoneSearchChange = (val: string) => {
    setPhoneSearch(val);
    setSearchTriggered(false);
    setSelectedPatient(null);
  };

  const selectPatient = (p: PatientSearchResult) => {
    setSelectedPatient(p);
    setPhone(p.phone);
  };

  const walkInMutation = useMutation({
    mutationFn: clinicalApi.createWalkIn,
    onSuccess: (res) => {
      if (res.data) {
        setBillingData({ invoiceId: res.data.invoice_id, patientName: res.data.patient_name });
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

  const handleClose = () => { resetForm(); onClose(); };

  if (!open) return null;

  if (!hasAccess) {
    return (
      <AnimatePresence>
        {open && <AccessDeniedModal onClose={handleClose} />}
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
          <motion.div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

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

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <PatientLookup
                phoneSearch={phoneSearch}
                onPhoneSearchChange={handlePhoneSearchChange}
                onSearch={handleSearch}
                isSearching={isSearching}
                patients={patients}
                searchTriggered={searchTriggered}
                selectedPatient={selectedPatient}
                onSelectPatient={selectPatient}
                onClearPatient={() => setSelectedPatient(null)}
              />

              <AnimatePresence>
                {showNewPatientForm && (
                  <NewPatientForm
                    firstName={firstName}
                    lastName={lastName}
                    phone={phone || phoneSearch}
                    gender={gender}
                    address={address}
                    onFirstNameChange={setFirstName}
                    onLastNameChange={setLastName}
                    onPhoneChange={setPhone}
                    onGenderChange={setGender}
                    onAddressChange={setAddress}
                  />
                )}
              </AnimatePresence>

              <VisitDetailsSection
                visitType={visitType}
                onVisitTypeChange={setVisitType}
                departmentId={departmentId}
                onDepartmentChange={setDepartmentId}
                deptOptions={deptOptions}
                deptsLoading={deptsLoading}
                doctorId={doctorId}
                onDoctorChange={setDoctorId}
                doctorOptions={doctorOptions}
                doctorsLoading={doctorsLoading}
                chiefComplaint={chiefComplaint}
                onChiefComplaintChange={setChiefComplaint}
              />
            </div>

            {/* Footer */}
            <div className="border-t bg-muted/20 px-6 py-4 flex items-center justify-between rounded-b-2xl">
              <Button variant="ghost" onClick={handleClose} className="text-muted-foreground">Cancel</Button>
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

          {/* Billing Modal */}
          <AnimatePresence>
            {billingData && (
              <BillingModal
                invoiceId={billingData.invoiceId}
                patientName={billingData.patientName}
                onMarkPaid={() => {
                  toast({ title: 'Payment recorded', description: 'Invoice marked as paid.' });
                  handleClose();
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
