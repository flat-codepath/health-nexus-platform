import { motion, AnimatePresence } from 'framer-motion';
import { Search, Phone, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { PatientSearchResult } from '@/api/clinical.api';

interface PatientLookupProps {
  phoneSearch: string;
  onPhoneSearchChange: (val: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  patients: PatientSearchResult[];
  searchTriggered: boolean;
  selectedPatient: PatientSearchResult | null;
  onSelectPatient: (p: PatientSearchResult) => void;
  onClearPatient: () => void;
}

export default function PatientLookup({
  phoneSearch,
  onPhoneSearchChange,
  onSearch,
  isSearching,
  patients,
  searchTriggered,
  selectedPatient,
  onSelectPatient,
  onClearPatient,
}: PatientLookupProps) {
  const noPatientFound = searchTriggered && phoneSearch.length >= 3 && !isSearching && patients.length === 0;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
          <Search className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">Patient Lookup</span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by phone number..."
            value={phoneSearch}
            onChange={(e) => onPhoneSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={onSearch}
          disabled={phoneSearch.length < 3 || isSearching}
          className="px-4"
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      {/* Search results */}
      <AnimatePresence>
        {searchTriggered && patients.length > 0 && !selectedPatient && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-1"
          >
            {patients.map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectPatient(p)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {p.first_name[0]}{p.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{p.first_name} {p.last_name}</p>
                  <p className="text-xs text-muted-foreground">MRN: {p.mrn} · {p.phone}</p>
                </div>
                <Badge variant="outline" className="text-xs">Select</Badge>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected patient card */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-3 flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5"
          >
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {selectedPatient.first_name} {selectedPatient.last_name}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="font-mono">MRN: {selectedPatient.mrn}</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{selectedPatient.phone}</span>
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary border-0 text-xs">Verified</Badge>
            <button
              onClick={onClearPatient}
              className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No patient found indicator */}
      {noPatientFound && !selectedPatient && (
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-warning p-3 rounded-xl border border-dashed border-warning/40 bg-warning/5">
          <AlertCircle className="h-4 w-4" />
          No patient found — register below
        </div>
      )}
    </section>
  );
}
