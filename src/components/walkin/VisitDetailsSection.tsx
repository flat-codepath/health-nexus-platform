import { Stethoscope, Building2, User2, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import JiraDropdown, { type DropdownOption } from './JiraDropdown';

const VISIT_TYPES = [
  { value: 'fresh' as const, label: 'Fresh Visit', description: 'First-time consultation', icon: '🆕' },
  { value: 'follow_up' as const, label: 'Follow-up', description: 'Returning patient', icon: '🔄' },
];

interface VisitDetailsSectionProps {
  visitType: 'fresh' | 'follow_up';
  onVisitTypeChange: (val: 'fresh' | 'follow_up') => void;
  departmentId: string;
  onDepartmentChange: (val: string) => void;
  deptOptions: DropdownOption[];
  deptsLoading: boolean;
  doctorId: string;
  onDoctorChange: (val: string) => void;
  doctorOptions: DropdownOption[];
  doctorsLoading: boolean;
  chiefComplaint: string;
  onChiefComplaintChange: (val: string) => void;
}

export default function VisitDetailsSection({
  visitType,
  onVisitTypeChange,
  departmentId,
  onDepartmentChange,
  deptOptions,
  deptsLoading,
  doctorId,
  onDoctorChange,
  doctorOptions,
  doctorsLoading,
  chiefComplaint,
  onChiefComplaintChange,
}: VisitDetailsSectionProps) {
  return (
    <>
      {/* Divider */}
      <div className="relative">
        <div className="border-t" />
        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground font-medium">
          Visit Details
        </span>
      </div>

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
                onClick={() => onVisitTypeChange(vt.value)}
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

        {/* Department */}
        <JiraDropdown
          label="Department *"
          icon={Building2}
          placeholder={deptsLoading ? 'Loading departments...' : 'Select a department'}
          value={departmentId}
          onChange={onDepartmentChange}
          options={deptOptions}
          disabled={deptsLoading}
        />

        {/* Doctor (cascaded) */}
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
          onChange={onDoctorChange}
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

        {/* Chief Complaint */}
        <div>
          <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Chief Complaint *</Label>
          <Textarea
            placeholder="Describe the patient's primary complaint..."
            value={chiefComplaint}
            onChange={(e) => onChiefComplaintChange(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>
      </section>
    </>
  );
}
