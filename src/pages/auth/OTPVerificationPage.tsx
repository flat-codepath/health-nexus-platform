import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { mockApi } from '@/api/mockApi';
import { useAuthStore } from '@/stores/authStore';
import { getRoleDefaultRoute } from '@/components/ProtectedRoute';

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const loginStore = useAuthStore((s) => s.login);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) { toast({ title: 'Enter all 6 digits', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const res = await mockApi.verifyOtp(code);
      setVerified(true);
      setTimeout(() => {
        loginStore(res.user, res.tenant, res.token);
        navigate(getRoleDefaultRoute(res.user.role));
      }, 1500);
    } catch {
      toast({ title: 'Invalid OTP', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resend = () => {
    setCountdown(30);
    toast({ title: 'OTP Resent', description: 'Check your email for a new code.' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 font-bold text-xl mb-10">
          <Activity className="h-6 w-6 text-primary" />
          MedFlow
        </div>

        {verified ? (
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-4">
            <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
            <h2 className="text-2xl font-bold">Verified!</h2>
            <p className="text-muted-foreground">Setting up your hospital dashboard...</p>
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
          </motion.div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
            <p className="text-muted-foreground mb-8">We've sent a 6-digit code to your email. Enter it below.</p>

            <div className="flex justify-center gap-3 mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              ))}
            </div>

            <Button onClick={handleVerify} className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Continue
            </Button>

            <p className="text-sm text-muted-foreground mt-4">
              {countdown > 0 ? (
                <>Resend code in <span className="font-medium text-foreground">{countdown}s</span></>
              ) : (
                <button onClick={resend} className="text-primary font-medium hover:underline">Resend Code</button>
              )}
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
