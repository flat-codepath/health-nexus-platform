import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, X, Loader2, Mail, User, Building2, Stethoscope, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { organizationApi, type InviteStaffPayload } from '@/api/organization.api';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const staffRoles = [
  { value: 'branch_admin', label: 'Branch Admin', description: 'Manages a branch' },
  { value: 'department_admin', label: 'Dept. Admin', description: 'Manages a department' },
  { value: 'doctor', label: 'Doctor', description: 'Medical practitioner' },
  { value: 'receptionist', label: 'Receptionist', description: 'Front desk staff' },
];

const inviteSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  role: z.string().min(1, 'Select a role'),
  branch: z.string().min(1, 'Select a branch'),
  department: z.string().min(1, 'Select a department'),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InviteStaffDialog({ open, onOpenChange }: InviteStaffDialogProps) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isHospitalOwner = user?.role === 'hospital_owner';

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      role: '',
      branch: isHospitalOwner ? '' : (user?.branch_id || ''),
      department: '',
    },
  });

  const selectedBranch = watch('branch');

  // Fetch branches (only needed for hospital owner)
  const { data: branchesRes, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: organizationApi.getBranches,
    enabled: isHospitalOwner,
  });

  // Hospital owner: fetch departments for the selected branch
  const { data: branchDepsRes, isLoading: branchDepsLoading } = useQuery({
    queryKey: ['branch-departments', selectedBranch],
    queryFn: () => organizationApi.getBranchDepartments(selectedBranch),
    enabled: isHospitalOwner && !!selectedBranch,
  });

  // Branch admin: fetch all departments (within their branch)
  const { data: departmentsRes, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: organizationApi.getDepartments,
    enabled: !isHospitalOwner,
  });

  const branches = branchesRes?.data ?? [];
  const filteredDepartments = isHospitalOwner
    ? (branchDepsRes?.data ?? [])
    : (departmentsRes?.data ?? []);
  const depsLoading = isHospitalOwner ? branchDepsLoading : departmentsLoading;

  const mutation = useMutation({
    mutationFn: (data: InviteStaffPayload) => organizationApi.inviteStaff(data),
    onSuccess: () => {
      toast.success('Invitation sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        const messages = Object.values(apiErrors).flat().join(', ');
        toast.error(messages);
      } else {
        toast.error('Failed to send invitation. Please try again.');
      }
    },
  });

  const onSubmit = (data: InviteFormValues) => {
    mutation.mutate(data as InviteStaffPayload);
  };

  const close = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-[640px] bg-background rounded-xl border shadow-2xl flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-semibold text-base">Invite Staff Member</span>
                    <p className="text-xs text-muted-foreground">Send an invitation to join your hospital</p>
                  </div>
                </div>
                <button
                  onClick={close}
                  className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
                <div className="px-6 py-5 space-y-5">
                  {/* Name fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-sm font-medium flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="first_name"
                        placeholder="John"
                        className="h-10"
                        {...register('first_name')}
                      />
                      {errors.first_name && (
                        <p className="text-xs text-destructive">{errors.first_name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-sm font-medium">
                        Last Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="last_name"
                        placeholder="Doe"
                        className="h-10"
                        {...register('last_name')}
                      />
                      {errors.last_name && (
                        <p className="text-xs text-destructive">{errors.last_name.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@apollo.com"
                      className="h-10"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Role — Chip selector */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Role <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-2 gap-2">
                          {staffRoles.map((r) => (
                            <button
                              key={r.value}
                              type="button"
                              onClick={() => field.onChange(r.value)}
                              className={cn(
                                'relative flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-150',
                                field.value === r.value
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                                  : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                              )}
                            >
                              <div className={cn(
                                'h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors',
                                field.value === r.value
                                  ? 'border-primary bg-primary'
                                  : 'border-muted-foreground/40'
                              )}>
                                {field.value === r.value && (
                                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{r.label}</p>
                                <p className="text-xs text-muted-foreground">{r.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    />
                    {errors.role && (
                      <p className="text-xs text-destructive">{errors.role.message}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Branch — only for hospital owner */}
                  {isHospitalOwner && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        Branch <span className="text-destructive">*</span>
                      </Label>
                      {branchesLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-12 rounded-lg" />
                          <Skeleton className="h-12 rounded-lg" />
                        </div>
                      ) : (
                        <Controller
                          name="branch"
                          control={control}
                          render={({ field }) => (
                            <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1">
                              {branches.map((b) => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => field.onChange(b.id)}
                                  className={cn(
                                    'flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-150',
                                    field.value === b.id
                                      ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                                      : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                                  )}
                                >
                                  <div className={cn(
                                    'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                                    field.value === b.id ? 'bg-primary/15' : 'bg-muted'
                                  )}>
                                    <Building2 className={cn(
                                      'h-4 w-4',
                                      field.value === b.id ? 'text-primary' : 'text-muted-foreground'
                                    )} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{b.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{b.city} · {b.total_beds} beds</p>
                                  </div>
                                  {field.value === b.id && (
                                    <Check className="h-4 w-4 text-primary shrink-0" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        />
                      )}
                      {errors.branch && (
                        <p className="text-xs text-destructive">{errors.branch.message}</p>
                      )}
                    </div>
                  )}

                  {/* Department */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                      Department <span className="text-destructive">*</span>
                    </Label>
                    {depsLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-12 rounded-lg" />
                        <Skeleton className="h-12 rounded-lg" />
                      </div>
                    ) : filteredDepartments.length === 0 ? (
                      <div className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
                        {isHospitalOwner && !selectedBranch
                          ? 'Select a branch first to see departments'
                          : 'No departments available'}
                      </div>
                    ) : (
                      <Controller
                        name="department"
                        control={control}
                        render={({ field }) => (
                          <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                            {filteredDepartments.map((d) => (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => field.onChange(d.id)}
                                className={cn(
                                  'flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-150',
                                  field.value === d.id
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                                    : 'border-border hover:border-muted-foreground/30 hover:bg-muted/50'
                                )}
                              >
                                <div className={cn(
                                  'h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors',
                                  field.value === d.id
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground/40'
                                )}>
                                  {field.value === d.id && (
                                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                  )}
                                </div>
                                <p className="text-sm font-medium">{d.name}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      />
                    )}
                    {errors.department && (
                      <p className="text-xs text-destructive">{errors.department.message}</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-background border-t px-6 py-4 flex items-center justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={close} disabled={mutation.isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending} className="min-w-[150px]">
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
