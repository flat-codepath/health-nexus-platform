import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowLeft, ArrowRight, Building2, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { mockApi } from '@/api/mockApi';

const schema = z.object({
  hospital_name: z.string().min(2, 'Hospital name is required'),
  owner_name: z.string().min(2, 'Owner name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Valid phone required'),
  password: z.string().min(8, 'Min 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, { message: "Passwords don't match", path: ['confirm_password'] });

type FormData = z.infer<typeof schema>;

const steps = [
  { title: 'Hospital Info', icon: Building2 },
  { title: 'Account Details', icon: User },
];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const nextStep = async () => {
    const fields: (keyof FormData)[] = step === 0 ? ['hospital_name', 'owner_name'] : ['email', 'phone', 'password', 'confirm_password'];
    const valid = await trigger(fields);
    if (valid) setStep(1);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await mockApi.register(data as unknown as Record<string, string>);
      toast({ title: 'Registration successful!', description: 'Please verify your email.' });
      navigate('/verify-otp', { state: { email: data.email } });
    } catch {
      toast({ title: 'Error', description: 'Registration failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-10">
            <Activity className="h-6 w-6 text-primary" />
            MedFlow
          </Link>
          <h1 className="text-2xl font-bold mb-1">Create your hospital account</h1>
          <p className="text-muted-foreground mb-8">Start your 14-day free trial. No credit card required.</p>

          {/* Step indicator */}
          <div className="flex gap-3 mb-8">
            {steps.map((s, i) => (
              <div key={s.title} className={`flex-1 flex items-center gap-2 p-3 rounded-lg border text-sm transition-colors ${i === step ? 'border-primary bg-primary/5 text-primary' : 'text-muted-foreground'}`}>
                <s.icon className="h-4 w-4" />
                <span className="font-medium">{s.title}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                  <div>
                    <Label>Hospital / Organization Name</Label>
                    <Input {...register('hospital_name')} placeholder="Apollo Healthcare Group" className="mt-1.5" />
                    {errors.hospital_name && <p className="text-destructive text-sm mt-1">{errors.hospital_name.message}</p>}
                  </div>
                  <div>
                    <Label>Owner Name</Label>
                    <Input {...register('owner_name')} placeholder="Dr. Rajesh Kumar" className="mt-1.5" />
                    {errors.owner_name && <p className="text-destructive text-sm mt-1">{errors.owner_name.message}</p>}
                  </div>
                  <Button type="button" className="w-full" onClick={nextStep}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input {...register('email')} type="email" placeholder="owner@hospital.com" className="mt-1.5" />
                    {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input {...register('phone')} placeholder="+1-555-0100" className="mt-1.5" />
                    {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input {...register('password')} type="password" placeholder="Min 8 characters" className="mt-1.5" />
                    {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
                  </div>
                  <div>
                    <Label>Confirm Password</Label>
                    <Input {...register('confirm_password')} type="password" placeholder="Confirm password" className="mt-1.5" />
                    {errors.confirm_password && <p className="text-destructive text-sm mt-1">{errors.confirm_password.message}</p>}
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="text-primary-foreground max-w-md">
          <h2 className="text-3xl font-bold mb-4">Join 500+ Hospitals</h2>
          <p className="text-primary-foreground/70 leading-relaxed">
            Set up your hospital in minutes. Add branches, invite staff, and start managing patients right away.
          </p>
        </div>
      </div>
    </div>
  );
}
