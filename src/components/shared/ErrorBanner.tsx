import { AlertCircle, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
      <AlertCircle size={16} className="text-red-400 shrink-0" />
      <p className="text-red-400 text-sm flex-1">{message}</p>
      <button type="button" onClick={onDismiss} className="text-red-400/50 hover:text-red-400 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}
