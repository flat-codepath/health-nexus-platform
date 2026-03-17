import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessDeniedModalProps {
  onClose: () => void;
}

export default function AccessDeniedModal({ onClose }: AccessDeniedModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative bg-background rounded-xl border shadow-2xl p-8 max-w-sm text-center"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Access Denied</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Only receptionists and branch admins can admit walk-in patients.
        </p>
        <Button variant="outline" className="mt-5" onClick={onClose}>Close</Button>
      </motion.div>
    </motion.div>
  );
}
