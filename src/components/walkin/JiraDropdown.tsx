import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface DropdownOption {
  id: string;
  label: string;
  sub?: string;
}

interface JiraDropdownProps {
  label: string;
  icon: React.ElementType;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  disabled?: boolean;
  renderOption?: (opt: DropdownOption, selected: boolean) => React.ReactNode;
  renderSelected?: (opt: DropdownOption) => React.ReactNode;
}

export default function JiraDropdown({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  options,
  disabled,
  renderOption,
  renderSelected,
}: JiraDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const selected = options.find((o) => o.id === value);

  return (
    <div ref={ref} className="relative">
      <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</Label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all text-sm ${
          isOpen
            ? 'border-primary ring-2 ring-primary/20 bg-background'
            : 'border-input bg-background hover:border-primary/40'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        {selected ? (
          renderSelected ? renderSelected(selected) : (
            <span className="flex-1 truncate text-foreground font-medium">{selected.label}</span>
          )
        ) : (
          <span className="flex-1 truncate text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 w-full bg-popover border rounded-lg shadow-lg overflow-hidden"
          >
            {options.length > 5 && (
              <div className="p-2 border-b">
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 text-sm"
                  autoFocus
                />
              </div>
            )}
            <div className="max-h-[200px] overflow-y-auto p-1">
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No results found</p>
              )}
              {filtered.map((opt) => {
                const isSelected = opt.id === value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { onChange(opt.id); setIsOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {renderOption ? renderOption(opt, isSelected) : (
                      <>
                        <span className="flex-1 font-medium">{opt.label}</span>
                        {opt.sub && <span className="text-xs text-muted-foreground">{opt.sub}</span>}
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
