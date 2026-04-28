import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface ConfirmTextModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  phrase: string;
  confirmLabel?: string;
  destructive?: boolean;
}

export default function ConfirmTextModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  phrase,
  confirmLabel = 'Confirm',
  destructive = true,
}: ConfirmTextModalProps) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const matches = value === phrase;

  function handleClose() {
    if (loading) return;
    setValue('');
    onClose();
  }

  async function handleConfirm() {
    if (!matches || loading) return;
    setLoading(true);
    try {
      await onConfirm();
      setValue('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent hideClose={loading}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${destructive ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
              <AlertTriangle size={16} className={destructive ? 'text-red-400' : 'text-amber-400'} />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-3">
          <p className="text-ds-text2 text-xs">
            Type <span className="font-mono font-semibold text-ds-text bg-ds-surface2 border border-ds-border px-1.5 py-0.5 rounded">{phrase}</span> to confirm.
          </p>
          <Input
            placeholder={phrase}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
            disabled={loading}
            autoFocus
            className={matches ? 'border-emerald-500/40 focus-visible:ring-emerald-500/20' : ''}
          />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'primary'}
            onClick={handleConfirm}
            disabled={!matches || loading}
          >
            {loading ? <><Loader2 size={13} className="animate-spin" />Working…</> : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
