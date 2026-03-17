import { motion } from 'framer-motion';
import { Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const GENDERS = ['Male', 'Female', 'Other'];

interface NewPatientFormProps {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  address: string;
  onFirstNameChange: (val: string) => void;
  onLastNameChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onGenderChange: (val: string) => void;
  onAddressChange: (val: string) => void;
}

export default function NewPatientForm({
  firstName,
  lastName,
  phone,
  gender,
  address,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onGenderChange,
  onAddressChange,
}: NewPatientFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="mt-3 p-4 rounded-xl border border-dashed border-warning/40 bg-warning/5 space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">First Name *</Label>
          <Input placeholder="John" value={firstName} onChange={(e) => onFirstNameChange(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Last Name *</Label>
          <Input placeholder="Doe" value={lastName} onChange={(e) => onLastNameChange(e.target.value)} className="mt-1" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Phone *</Label>
          <div className="relative mt-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="9876543210" value={phone} onChange={(e) => onPhoneChange(e.target.value)} className="pl-9" />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Gender *</Label>
          <div className="flex gap-1.5 mt-1">
            {GENDERS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onGenderChange(g)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                  gender === g
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-input bg-background text-muted-foreground hover:border-primary/30'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Address</Label>
        <div className="relative mt-1">
          <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
          <Textarea
            placeholder="123 Main Street, City, State"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="pl-9 min-h-[60px] resize-none"
          />
        </div>
      </div>
    </motion.div>
  );
}
