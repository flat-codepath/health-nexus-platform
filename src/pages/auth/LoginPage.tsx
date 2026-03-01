import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Activity, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/stores/authStore';
import { getRoleDefaultRoute } from '@/components/ProtectedRoute';
import type { User, Tenant, UserRole } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

function mapMeToUser(me: any): User {
  return {
    id: me.id,
    name: `${me.first_name} ${me.last_name}`.trim(),
    email: me.email,
    phone: '',
    role: (me.role || me.user_type) as UserRole,
    tenant_id: me.tenant_id || '',
    branch_id: me.branch_id,
    department_id: me.department_id,
  };
}

function mapMeToTenant(me: any): Tenant | null {
  if (!me.tenant_id) return null;
  return {
    id: me.tenant_id,
    name: me.tenant_name || '',
    slug: '',
    plan: 'trial',
    created_at: '',
  };
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, setUser } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      // Step 1: Login to get tokens
      const res = await authApi.login(data.email, data.password);
      if (res.status === 'success' && res.data) {
        login({ access: res.data.access, refresh: res.data.refresh });

        // Step 2: Fetch user profile
        const meRes = await authApi.me();
        if (meRes.status === 'success' && meRes.data) {
          const user = mapMeToUser(meRes.data);
          const tenant = mapMeToTenant(meRes.data);
          setUser(user, tenant);

          toast({ title: 'Welcome back!', description: `Logged in as ${user.name}` });
          navigate(getRoleDefaultRoute(user.role));
        }
      }
    } catch (error: any) {
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        const messages = Object.values(apiErrors).flat().join(' ');
        toast({ title: 'Login failed', description: messages, variant: 'destructive' });
      } else {
        toast({ title: 'Login failed', description: 'Invalid email or password', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-10">
            <Activity className="h-6 w-6 text-primary" />
            MedFlow
          </Link>
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to your hospital dashboard</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="owner@apollo.com" {...register('email')} className="mt-1.5" />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" {...register('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-6 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">Start free trial</Link>
          </p>
        </motion.div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex flex-1 hero-gradient items-center justify-center p-12">
        <div className="text-primary-foreground max-w-md">
          <h2 className="text-3xl font-bold mb-4">Manage Your Hospital Network</h2>
          <p className="text-primary-foreground/70 leading-relaxed">
            Access real-time analytics, manage multiple branches, and streamline patient care — all from one unified platform.
          </p>
        </div>
      </div>
    </div>
  );
}
