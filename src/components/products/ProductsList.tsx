import { Package } from 'lucide-react';

export default function ProductsList() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl gradient-indigo flex items-center justify-center shadow-accent-glow">
          <Package size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-ds-text font-bold text-xl tracking-tight">Products</h1>
          <p className="text-ds-muted text-sm mt-0.5">Manage your product catalog</p>
        </div>
      </div>

      {/* Empty state */}
      <div className="card flex flex-col items-center justify-center py-20 px-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-ds-surface2 border border-ds-border flex items-center justify-center mb-5">
          <Package size={28} className="text-ds-muted" />
        </div>
        <h2 className="text-ds-text font-semibold text-base mb-2">No products yet</h2>
        <p className="text-ds-muted text-sm max-w-xs leading-relaxed">
          Your catalog is empty. Add your first item to get started.
        </p>
      </div>
    </div>
  );
}
