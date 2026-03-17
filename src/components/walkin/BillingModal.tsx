import { motion } from 'framer-motion';
import { CheckCircle2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BillingModalProps {
  invoiceId: string;
  patientName: string;
  onMarkPaid: () => void;
}

export default function BillingModal({ invoiceId, patientName, onMarkPaid }: BillingModalProps) {
  return (
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
        <p className="text-sm text-muted-foreground mt-1">{patientName} has been registered successfully.</p>

        <div className="mt-5 p-4 bg-muted/50 rounded-xl space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Invoice ID</span>
            <span className="font-mono text-xs text-foreground bg-muted px-2 py-0.5 rounded">
              {invoiceId.slice(0, 12)}...
            </span>
          </div>
          <div className="border-t" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Consultation Fee</span>
            <span className="font-semibold text-foreground">$50.00</span>
          </div>
        </div>

        <Button className="w-full mt-5 h-10" onClick={onMarkPaid}>
          <Receipt className="h-4 w-4 mr-2" />
          Mark as Paid
        </Button>
      </motion.div>
    </motion.div>
  );
}
