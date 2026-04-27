import { useEffect, useState } from 'react';
import {
  Package, PackagePlus, Tag, Ruler, Layers, DollarSign,
  ExternalLink, Trash2, Loader2, Pencil, ShoppingBag,
  RefreshCw, AlertTriangle, Plug, Boxes, FileUp,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { ProductModel, type ShopifyConnection } from '../../../models/ProductModel';
import type { Product } from '../../../lib/supabase/types';
import { PRODUCT_STATUS_LABEL, PRODUCT_STATUS_CLASS } from '../../../constants/productStatus';
import { Button } from '../../../components/ui/button';
import { formatRelative } from '../../../lib/utils';
import ShopifyProductCard from './ShopifyProductCard';
import CsvImportModal from './CsvImportModal';
import type { ActiveSection } from '../../../components/layout/Sidebar';

type TabId = 'listed' | 'shopify';

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

function ProductCard({ product, onDelete, onEdit }: { product: Product; onDelete: (id: string) => void; onEdit: (id: string) => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try { await ProductModel.delete(product.id); onDelete(product.id); }
    catch { setDeleting(false); setConfirmDelete(false); }
  }

  return (
    <div className="card flex overflow-hidden hover:border-ds-border/80 transition-colors min-h-[160px]">
      <ProductPhoto url={product.photo_url ?? null} />
      <div className="flex-1 px-5 py-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="text-ds-text font-semibold text-base leading-tight truncate">{product.title}</h3>
              {product.date && (
                <p className="text-ds-muted text-xs mt-0.5">{new Date(product.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              )}
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-xs font-medium shrink-0 ${PRODUCT_STATUS_CLASS[product.status] ?? PRODUCT_STATUS_CLASS['NOT_IMPORTED']}`}>
              {PRODUCT_STATUS_LABEL[product.status] ?? product.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {product.gender && <span className="flex items-center gap-1 text-xs text-ds-text2 bg-ds-surface2 border border-ds-borderSoft px-2 py-0.5 rounded-md capitalize">{product.gender}</span>}
            {product.season && <span className="flex items-center gap-1 text-xs text-ds-text2 bg-ds-surface2 border border-ds-borderSoft px-2 py-0.5 rounded-md capitalize">{product.season}</span>}
            {product.material && <span className="flex items-center gap-1 text-xs text-ds-text2 bg-ds-surface2 border border-ds-borderSoft px-2 py-0.5 rounded-md"><Layers size={10} className="text-ds-muted" />{product.material}</span>}
            {product.purchase_price != null && (
              <span className="flex items-center gap-1 text-xs text-ds-text2 bg-ds-surface2 border border-ds-borderSoft px-2 py-0.5 rounded-md">
                <DollarSign size={10} className="text-ds-muted" />
                {product.purchase_price.toFixed(2)}
                {product.discount ? <span className="text-amber-400 ml-0.5">−{product.discount}%</span> : null}
              </span>
            )}
            {product.stock_quantity != null && (
              <span className="flex items-center gap-1 text-xs text-ds-text2 bg-ds-surface2 border border-ds-borderSoft px-2 py-0.5 rounded-md">
                <Boxes size={10} className="text-ds-muted" />
                {product.stock_quantity} in stock
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            {(product.colors ?? []).length > 0 && (
              <div className="flex items-center gap-1.5">
                <Tag size={11} className="text-ds-muted shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {(product.colors ?? []).map((c) => <span key={c} className="text-xs text-ds-text2 bg-ds-hover px-1.5 py-0.5 rounded">{c}</span>)}
                </div>
              </div>
            )}
            {(product.sizes ?? []).length > 0 && (
              <div className="flex items-center gap-1.5">
                <Ruler size={11} className="text-ds-muted shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {(product.sizes ?? []).map((s) => <span key={s} className="text-xs text-ds-text2 bg-ds-hover px-1.5 py-0.5 rounded">{s}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-ds-borderSoft">
          <p className="text-ds-muted text-xs truncate flex-1 italic">{product.note || ''}</p>
          <div className="flex items-center gap-3 shrink-0">
            {product.competitor_link && <a href={product.competitor_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-ds-accent hover:text-ds-accentHover transition-colors"><ExternalLink size={11} /> Competitor</a>}
            {product.supplier_link && <a href={product.supplier_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-ds-accent hover:text-ds-accentHover transition-colors"><ExternalLink size={11} /> Supplier</a>}
            {product.shopify_product_url && <a href={product.shopify_product_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"><ExternalLink size={11} /> Shopify</a>}
            {product.shopify_admin_url && <a href={product.shopify_admin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"><ExternalLink size={11} /> Admin</a>}
            <button onClick={() => onEdit(product.id)} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-transparent text-ds-muted hover:bg-ds-accent/10 hover:border-ds-accent/20 hover:text-ds-accent transition-all">
              <Pencil size={11} />Edit
            </button>
            <button onClick={handleDelete} onBlur={() => setConfirmDelete(false)} disabled={deleting}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${confirmDelete ? 'bg-red-500/15 border-red-500/30 text-red-400' : 'bg-transparent border-transparent text-ds-muted hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400'}`}>
              {deleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
              {confirmDelete ? 'Confirm?' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count: number | null }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${active ? 'text-ds-accent border-ds-accent' : 'text-ds-muted border-transparent hover:text-ds-text2'}`}>
      {icon}{label}
      {count !== null && <span className={`text-xs px-1.5 py-0.5 rounded ${active ? 'bg-ds-accent/10 text-ds-accent' : 'bg-ds-surface2 text-ds-muted'}`}>{count}</span>}
    </button>
  );
}

interface ProductsListProps {
  onNavigate: (section: ActiveSection, productId?: string) => void;
}

export default function ProductsList({ onNavigate }: ProductsListProps) {
  const { activeOrg } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('listed');

  const [products,       setProducts]       = useState<Product[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);

  const [csvModalOpen,    setCsvModalOpen]    = useState(false);

  const [shopifyProducts, setShopifyProducts] = useState<Product[]>([]);
  const [connection,      setConnection]      = useState<ShopifyConnection | null>(null);
  const [shopifyLoading,  setShopifyLoading]  = useState(true);
  const [shopifyError,    setShopifyError]    = useState<string | null>(null);
  const [syncing,         setSyncing]         = useState(false);
  const [syncMessage,     setSyncMessage]     = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (!activeOrg) return;
    setLoading(true);
    ProductModel.getAll(activeOrg.id)
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeOrg]);

  useEffect(() => {
    if (!activeOrg) return;
    setShopifyLoading(true);
    setShopifyError(null);
    Promise.all([ProductModel.getConnection(activeOrg.id), ProductModel.getAllShopify(activeOrg.id)])
      .then(([conn, prods]) => { setConnection(conn); setShopifyProducts(prods); })
      .catch((err) => setShopifyError(err.message ?? 'Failed to load Shopify data.'))
      .finally(() => setShopifyLoading(false));
  }, [activeOrg]);

  async function handleResync() {
    if (!activeOrg || syncing) return;
    setSyncing(true);
    setSyncMessage(null);
    const res = await ProductModel.sync(activeOrg.id);
    if (res.ok) {
      setSyncMessage({ kind: 'ok', text: `Synced ${res.count} product${res.count !== 1 ? 's' : ''}.` });
      const [conn, prods] = await Promise.all([ProductModel.getConnection(activeOrg.id), ProductModel.getAllShopify(activeOrg.id)]);
      setConnection(conn);
      setShopifyProducts(prods);
    } else {
      setSyncMessage({ kind: 'err', text: res.message });
    }
    setSyncing(false);
  }

  const listedCount  = loading ? null : products.length;
  const shopifyCount = shopifyLoading ? null : shopifyProducts.length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-indigo flex items-center justify-center shadow-accent-glow">
            <Package size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-ds-text font-bold text-xl tracking-tight">Products</h1>
            <p className="text-ds-muted text-sm mt-0.5">
              {activeTab === 'listed'
                ? loading ? 'Loading…' : `${products.length} item${products.length !== 1 ? 's' : ''} in your catalog`
                : shopifyLoading ? 'Loading…' : `${shopifyProducts.length} product${shopifyProducts.length !== 1 ? 's' : ''} from Shopify`}
            </p>
          </div>
        </div>
        {activeTab === 'listed' ? (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="default" onClick={() => setCsvModalOpen(true)}>
              <FileUp size={14} />Import CSV
            </Button>
            <Button variant="primary" size="default" onClick={() => onNavigate('products-add-item')}>
              <PackagePlus size={14} />Add Item
            </Button>
          </div>
        ) : (
          <Button variant="primary" size="default" onClick={handleResync} disabled={syncing || !connection?.connected}>
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Resync'}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1 border-b border-ds-border mb-6">
        <TabButton active={activeTab === 'listed'} onClick={() => setActiveTab('listed')} icon={<Package size={13} />} label="Listed Products" count={listedCount} />
        <TabButton active={activeTab === 'shopify'} onClick={() => setActiveTab('shopify')} icon={<ShoppingBag size={13} />} label="Shopify Products" count={shopifyCount} />
      </div>

      {activeTab === 'listed' && (
        <>
          {loading && <div className="card flex items-center justify-center py-20"><div className="w-5 h-5 border-2 border-ds-accent border-t-transparent rounded-full animate-spin" /></div>}
          {error && <div className="card flex items-center justify-center py-20"><span className="text-red-400 text-sm">{error}</span></div>}
          {!loading && !error && products.length === 0 && (
            <div className="card flex flex-col items-center justify-center py-20 px-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-ds-surface2 border border-ds-border flex items-center justify-center mb-5"><Package size={28} className="text-ds-muted" /></div>
              <h2 className="text-ds-text font-semibold text-base mb-2">No products yet</h2>
              <p className="text-ds-muted text-sm max-w-xs leading-relaxed mb-5">Your catalog is empty. Add your first item to get started.</p>
              <Button variant="primary" onClick={() => onNavigate('products-add-item')}><PackagePlus size={14} />Add your first item</Button>
            </div>
          )}
          {!loading && !error && products.length > 0 && (
            <div className="space-y-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onDelete={(id) => setProducts((prev) => prev.filter((x) => x.id !== id))} onEdit={(id) => onNavigate('products-edit-item', id)} />
              ))}
            </div>
          )}
        </>
      )}

      <CsvImportModal
        open={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        onImported={() => {
          setCsvModalOpen(false);
          if (!activeOrg) return;
          ProductModel.getAll(activeOrg.id).then(setProducts).catch(() => null);
        }}
      />

      {activeTab === 'shopify' && (
        <>
          {shopifyLoading && <div className="card flex items-center justify-center py-20"><div className="w-5 h-5 border-2 border-ds-accent border-t-transparent rounded-full animate-spin" /></div>}
          {shopifyError && <div className="card flex items-center justify-center py-20"><span className="text-red-400 text-sm">{shopifyError}</span></div>}
          {!shopifyLoading && !shopifyError && !connection?.connected && (
            <div className="card flex flex-col items-center justify-center py-20 px-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5"><AlertTriangle size={28} className="text-amber-400" /></div>
              <h2 className="text-ds-text font-semibold text-base mb-2">Shopify isn't connected</h2>
              <p className="text-ds-muted text-sm max-w-sm leading-relaxed mb-5">Connect your Shopify store from the Integrations page to pull and sync products here.</p>
              <Button variant="primary" onClick={() => onNavigate('integrations')}><Plug size={14} />Go to Integrations</Button>
            </div>
          )}
          {!shopifyLoading && !shopifyError && connection?.connected && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-ds-muted text-xs">
                  {connection.lastSyncAt ? `Last synced ${formatRelative(connection.lastSyncAt) ?? 'recently'}` : 'Not synced yet — click Resync to fetch products.'}
                </p>
                {syncMessage && <span className={`text-xs ${syncMessage.kind === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>{syncMessage.text}</span>}
              </div>
              {shopifyProducts.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-20 px-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-ds-surface2 border border-ds-border flex items-center justify-center mb-5"><ShoppingBag size={28} className="text-ds-muted" /></div>
                  <h2 className="text-ds-text font-semibold text-base mb-2">No Shopify products yet</h2>
                  <p className="text-ds-muted text-sm max-w-xs leading-relaxed mb-5">
                    {connection.lastSyncAt ? 'Your store has no products, or none matched the sync.' : 'Click Resync to fetch products from your Shopify store.'}
                  </p>
                  <Button variant="primary" onClick={handleResync} disabled={syncing}>
                    <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />{syncing ? 'Syncing…' : 'Resync now'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {shopifyProducts.map((p) => <ShopifyProductCard key={p.id} product={p} />)}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
