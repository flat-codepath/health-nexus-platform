
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, MapPin, Phone, BedDouble, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { organizationApi, type BranchPayload } from '@/api/organization.api';

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

  const fields = [
    { name: 'name' as const, label: 'Branch Name', placeholder: 'e.g. Downtown Medical Center', icon: Building2 },
    { name: 'address' as const, label: 'Address', placeholder: '456 Lakeview Avenue', icon: MapPin },
    { name: 'city' as const, label: 'City', placeholder: 'Chicago', icon: MapPin },
    { name: 'phone' as const, label: 'Phone', placeholder: '3125557890', icon: Phone },
    { name: 'total_beds' as const, label: 'Total Beds', placeholder: '200', icon: BedDouble, type: 'number' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        {/* Header with accent gradient */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg">Create New Branch</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Add a new branch to your hospital network
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {fields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={field.name} className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {field.label}
                </Label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id={field.name}
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    className="pl-10 h-11 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                    {...register(field.name)}
                  />
                </div>
                {errors[field.name] && (
                  <p className="text-xs text-destructive">{errors[field.name]?.message}</p>
                )}
              </div>
            );
          })}

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); onOpenChange(false); }}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="min-w-[120px]">
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create Branch'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
