import { useEffect, useState } from 'react';
import { Package, PackagePlus, Tag, Ruler, Layers, DollarSign, ExternalLink, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getProducts, deleteProduct } from '../../lib/supabase/products';
import type { Product } from '../../lib/supabase/types';
import type { ActiveSection } from '../Sidebar';
import { Button } from '../ui/button';

const STATUS_LABEL: Record<string, string> = {
  NOT_IMPORTED:     'Not Imported',
  READY_TO_IMPORT:  'Ready to Import',
  ALREADY_IMPORTED: 'Already Imported',
  IMPORTING:        'Importing',
};

const STATUS_CLASS: Record<string, string> = {
  NOT_IMPORTED:     'text-ds-muted bg-ds-surface2 border-ds-border',
  READY_TO_IMPORT:  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  ALREADY_IMPORTED: 'text-ds-accent bg-ds-accent/10 border-ds-accent/20',
  IMPORTING:        'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

function ProductPhoto({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div className="w-44 shrink-0 min-h-[160px] bg-ds-surface2 border-r border-ds-border flex items-center justify-center rounded-l-xl">
        <Package size={28} className="text-ds-muted" />
      </div>
    );
  }
  return (
    <div className="w-44 shrink-0 min-h-[160px] overflow-hidden rounded-l-xl">
      <img src={url} alt="product" className="w-full h-full object-cover" />
    </div>
  );
}

function ProductCard({ product, onDelete }: { product: Product; onDelete: (id: string) => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await deleteProduct(product.id);
      onDelete(product.id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="card flex overflow-hidden hover:border-ds-border/80 transition-colors min-h-[160px]">
      <ProductPhoto url={product.photo_url ?? null} />

      {/* Details */}
      <div className="flex-1 px-5 py-4 flex flex-col justify-between min-w-0">
        <div>
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="text-ds-text font-semibold text-base leading-tight truncate">{product.title}</h3>
              {product.date && (
                <p className="text-ds-muted text-xs mt-0.5">{new Date(product.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              )}
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-xs font-medium shrink-0 ${STATUS_CLASS[product.status] ?? STATUS_CLASS['not_imported']}`}>
              {STATUS_LABEL[product.status] ?? product.status}
            </span>
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {product.gender && (
              <span className="flex items-center gap-1 text-xs text-ds-text2 bg-ds-surface2 border border-ds-borderSoft px-2 py-0.5 rounded-md capitalize">
                {product.gender}
              </span>
            )}
            {product.season && (
              <span className="flex items-center gap-1 text-xs text-ds-text2 bg-ds-surface2 border border-ds-borderSoft px-2 py-0.5 rounded-md capitalize">
                {product.season}
              </span>
            )}
            {product.material && (
              <span className="flex items-center gap-1 text-xs text-ds-text2 bg-ds-surface2 border border-ds-borderSoft px-2 py-0.5 rounded-md">
                <Layers size={10} className="text-ds-muted" />
                {product.material}
              </span>
            )}
            {product.purchase_price != null && (
              <span className="flex items-center gap-1 text-xs text-ds-text2 bg-ds-surface2 border border-ds-borderSoft px-2 py-0.5 rounded-md">
                <DollarSign size={10} className="text-ds-muted" />
                {product.purchase_price.toFixed(2)}
                {product.discount ? <span className="text-amber-400 ml-0.5">−{product.discount}%</span> : null}
              </span>
            )}
          </div>

          {/* Colors & Sizes */}
          <div className="flex flex-wrap gap-4">
            {(product.colors ?? []).length > 0 && (
              <div className="flex items-center gap-1.5">
                <Tag size={11} className="text-ds-muted shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {(product.colors ?? []).map((c) => (
                    <span key={c} className="text-xs text-ds-text2 bg-ds-hover px-1.5 py-0.5 rounded">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {(product.sizes ?? []).length > 0 && (
              <div className="flex items-center gap-1.5">
                <Ruler size={11} className="text-ds-muted shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {(product.sizes ?? []).map((s) => (
                    <span key={s} className="text-xs text-ds-text2 bg-ds-hover px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom row: links + note */}
        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-ds-borderSoft">
          <p className="text-ds-muted text-xs truncate flex-1 italic">
            {product.note || ''}
          </p>
          <div className="flex items-center gap-3 shrink-0">
            {product.competitor_link && (
              <a href={product.competitor_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-ds-accent hover:text-ds-accentHover transition-colors">
                <ExternalLink size={11} /> Competitor
              </a>
            )}
            {product.supplier_link && (
              <a href={product.supplier_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-ds-accent hover:text-ds-accentHover transition-colors">
                <ExternalLink size={11} /> Supplier
              </a>
            )}
            <button
              onClick={handleDelete}
              onBlur={() => setConfirmDelete(false)}
              disabled={deleting}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${
                confirmDelete
                  ? 'bg-red-500/15 border-red-500/30 text-red-400'
                  : 'bg-transparent border-transparent text-ds-muted hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400'
              }`}
            >
              {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
              {confirmDelete ? 'Confirm?' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProductsListProps {
  onNavigate: (section: ActiveSection) => void;
}

export default function ProductsList({ onNavigate }: ProductsListProps) {
  const { activeOrg } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrg) return;
    setLoading(true);
    getProducts(activeOrg.id)
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeOrg]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-indigo flex items-center justify-center shadow-accent-glow">
            <Package size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-ds-text font-bold text-xl tracking-tight">Products</h1>
            <p className="text-ds-muted text-sm mt-0.5">
              {loading ? 'Loading…' : `${products.length} item${products.length !== 1 ? 's' : ''} in your catalog`}
            </p>
          </div>
        </div>

        <Button variant="primary" size="default" onClick={() => onNavigate('products-add-item')}>
          <PackagePlus size={14} />
          Add Item
        </Button>
      </div>

      {loading && (
        <div className="card flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 border-ds-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="card flex items-center justify-center py-20">
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-ds-surface2 border border-ds-border flex items-center justify-center mb-5">
            <Package size={28} className="text-ds-muted" />
          </div>
          <h2 className="text-ds-text font-semibold text-base mb-2">No products yet</h2>
          <p className="text-ds-muted text-sm max-w-xs leading-relaxed mb-5">
            Your catalog is empty. Add your first item to get started.
          </p>
          <Button variant="primary" onClick={() => onNavigate('products-add-item')}>
            <PackagePlus size={14} />
            Add your first item
          </Button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="space-y-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onDelete={(id) => setProducts((prev) => prev.filter((x) => x.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
