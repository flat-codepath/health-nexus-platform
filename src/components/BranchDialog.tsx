
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, MapPin, Phone, BedDouble, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { organizationApi, type BranchPayload } from '@/api/organization.api';
import { motion, AnimatePresence } from 'framer-motion';

const branchSchema = z.object({
  name: z.string().min(2, 'Branch name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  phone: z.string().min(7, 'Valid phone number is required'),
  total_beds: z.coerce.number().min(1, 'At least 1 bed required'),
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BranchDialog({ open, onOpenChange }: BranchDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: { name: '', address: '', city: '', phone: '', total_beds: 50 },
  });

  const mutation = useMutation({
    mutationFn: (data: BranchPayload) => organizationApi.createBranch(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Branch created successfully!');
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        const messages = Object.values(apiErrors).flat().join(', ');
        toast.error(messages);
      } else {
        toast.error('Failed to create branch. Please try again.');
      }
    },
  });

  const onSubmit = (data: BranchFormValues) => {
    mutation.mutate(data as BranchPayload);
  };

  const close = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />

          {/* Panel — Jira-style centered tall rectangle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-[640px] bg-background rounded-xl border shadow-2xl flex flex-col max-h-[90vh]">
              {/* Top bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-base">Create Branch</span>
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
                  {/* Branch Name — full width, prominent */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Branch Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Downtown Medical Center"
                      className="h-11 text-base"
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address"
                      placeholder="456 Lakeview Avenue"
                      className="h-10"
                      {...register('address')}
                    />
                    {errors.address && (
                      <p className="text-xs text-destructive">{errors.address.message}</p>
                    )}
                  </div>

                  {/* City & Phone — side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        City <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder="Chicago"
                        className="h-10"
                        {...register('city')}
                      />
                      {errors.city && (
                        <p className="text-xs text-destructive">{errors.city.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        Phone <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        placeholder="3125557890"
                        className="h-10"
                        {...register('phone')}
                      />
                      {errors.phone && (
                        <p className="text-xs text-destructive">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Total Beds */}
                  <div className="space-y-2">
                    <Label htmlFor="total_beds" className="text-sm font-medium flex items-center gap-2">
                      <BedDouble className="h-3.5 w-3.5 text-muted-foreground" />
                      Total Beds <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="total_beds"
                      type="number"
                      placeholder="200"
                      className="h-10 max-w-[200px]"
                      {...register('total_beds')}
                    />
                    {errors.total_beds && (
                      <p className="text-xs text-destructive">{errors.total_beds.message}</p>
                    )}
                  </div>
                </div>

                {/* Footer — sticky bottom */}
                <div className="sticky bottom-0 bg-background border-t px-6 py-4 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={close}
                    disabled={mutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending} className="min-w-[130px]">
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      'Create Branch'
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
