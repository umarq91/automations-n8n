import { useState } from 'react';
import {
  Package,
  ExternalLink,
  Tag,
  Boxes,
  DollarSign,
  Calendar,
  Layers,
  Copy,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import type {
  ShopifyProduct,
  ShopifyProductVariant,
} from '../../lib/supabase/types';

const STATUS_CLASS: Record<string, string> = {
  active:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  draft:    'text-amber-400 bg-amber-500/10 border-amber-500/20',
  archived: 'text-ds-muted bg-ds-surface2 border-ds-border',
};

const DASH = '—';

function formatPrice(value: number | null, currency: string | null): string {
  if (value == null) return DASH;
  const prefix = currency ? `${currency} ` : '$';
  return `${prefix}${value.toFixed(2)}`;
}

function formatPriceRange(min: number | null, max: number | null, currency: string | null): string {
  if (min == null && max == null) return DASH;
  if (min == null || max == null) return formatPrice(min ?? max, currency);
  if (min === max) return formatPrice(min, currency);
  const prefix = currency ? `${currency} ` : '$';
  return `${prefix}${min.toFixed(2)} – ${max.toFixed(2)}`;
}

function formatRelative(iso: string | null): string {
  if (!iso) return DASH;
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDate(iso: string | null): string {
  if (!iso) return DASH;
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function inventoryTone(qty: number | null): { dot: string; text: string; label: string } {
  if (qty == null) return { dot: 'bg-ds-muted', text: 'text-ds-muted', label: 'untracked' };
  if (qty <= 0)    return { dot: 'bg-red-400',  text: 'text-red-400',  label: 'out of stock' };
  if (qty <= 10)   return { dot: 'bg-amber-400', text: 'text-amber-400', label: 'low stock' };
  return                   { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'in stock' };
}

function variantLabel(v: ShopifyProductVariant): string {
  const parts = [v.option1, v.option2, v.option3].filter(Boolean);
  return parts.length ? parts.join(' / ') : (v.title || 'Default');
}

function ImageGallery({ images, fallback, title }: {
  images: ShopifyProduct['images'];
  fallback: string | null;
  title: string;
}) {
  const list = images.length
    ? images
    : fallback
    ? [{ src: fallback, alt: null, position: 1 }]
    : [];
  const [activeIdx, setActiveIdx] = useState(0);
  const active = list[activeIdx];

  return (
    <div className="w-48 shrink-0 flex flex-col gap-2">
      <div className="w-48 h-48 bg-ds-surface2 border border-ds-border rounded-lg overflow-hidden flex items-center justify-center">
        {active ? (
          <img src={active.src} alt={active.alt ?? title} className="w-full h-full object-cover" />
        ) : (
          <Package size={36} className="text-ds-muted" />
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap min-h-[40px]">
        {list.slice(0, 5).map((img, i) => (
          <button
            key={`${img.src}-${i}`}
            onClick={() => setActiveIdx(i)}
            className={`w-10 h-10 rounded-md overflow-hidden border transition-all ${
              i === activeIdx
                ? 'border-ds-accent ring-2 ring-ds-accent/30'
                : 'border-ds-border hover:border-ds-borderSoft'
            }`}
          >
            <img src={img.src} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
        {list.length > 5 && (
          <div className="w-10 h-10 rounded-md border border-ds-border bg-ds-surface2 flex items-center justify-center">
            <span className="text-[10px] text-ds-muted">+{list.length - 5}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sublabel }: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sublabel: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-w-[140px] bg-ds-surface2 border border-ds-borderSoft rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-ds-muted text-[10px] uppercase tracking-wide font-medium mb-1">
        {icon}
        {label}
      </div>
      <div className="text-ds-text font-semibold text-sm truncate">{value}</div>
      <div className="text-ds-muted text-[11px] mt-0.5 truncate">{sublabel}</div>
    </div>
  );
}

function CopyChip({ text, label }: { text: string | null; label: string }) {
  const [copied, setCopied] = useState(false);
  const display = text ?? DASH;
  const canCopy = Boolean(text);

  async function handleCopy() {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(text!);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { /* ignore */ }
  }

  return (
    <button
      onClick={handleCopy}
      disabled={!canCopy}
      className="inline-flex items-center gap-1 text-[11px] text-ds-text2 bg-ds-surface2 border border-ds-borderSoft hover:bg-ds-hover disabled:opacity-60 disabled:cursor-default px-2 py-0.5 rounded transition-colors"
      title={canCopy ? `Copy ${label}` : label}
    >
      <span className="text-ds-muted">{label}:</span>
      <span className="font-mono">{display}</span>
      {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} className="text-ds-muted" />}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 pt-4 border-t border-ds-borderSoft">
      <h4 className="text-ds-muted text-[10px] uppercase tracking-wide font-medium mb-2">{title}</h4>
      {children}
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="text-ds-muted text-xs italic">{text}</p>;
}

export default function ShopifyProductCard({ product }: { product: ShopifyProduct }) {
  const [showAllVariants, setShowAllVariants] = useState(false);
  const statusKey = (product.status ?? '').toLowerCase();
  const statusClass = STATUS_CLASS[statusKey] ?? STATUS_CLASS.archived;
  const invTone = inventoryTone(product.total_inventory);
  const visibleVariants = showAllVariants ? product.variants : product.variants.slice(0, 5);
  const hiddenCount = product.variants.length - visibleVariants.length;
  const meta = [product.vendor, product.product_type].filter(Boolean).join(' · ') || DASH;

  return (
    <div className="card-elevated p-5 hover:border-ds-border/80 transition-colors">
      {/* Top: gallery + headline */}
      <div className="flex gap-5">
        <ImageGallery images={product.images} fallback={product.image_url} title={product.title} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h3 className="text-ds-text font-semibold text-lg leading-tight truncate">{product.title}</h3>
              <p className="text-ds-muted text-xs mt-1">{meta}</p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-medium shrink-0 capitalize ${statusClass}`}>
              {product.status ?? 'unknown'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            <CopyChip text={product.sku} label="SKU" />
            <CopyChip text={product.handle} label="Handle" />
            <CopyChip text={String(product.shopify_product_id)} label="ID" />
          </div>

          <p className="text-ds-text2 text-xs leading-relaxed line-clamp-2 mb-3 min-h-[2.2em]">
            {product.description || <span className="italic text-ds-muted">No description</span>}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            <StatCard
              icon={<DollarSign size={10} />}
              label="Price"
              value={formatPriceRange(product.price_min, product.price_max, product.currency)}
              sublabel={product.currency ?? DASH}
            />
            <StatCard
              icon={<Boxes size={10} />}
              label="Inventory"
              value={
                <span className="flex items-center gap-1.5">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${invTone.dot}`} />
                  {product.total_inventory ?? DASH}
                </span>
              }
              sublabel={<span className={invTone.text}>{invTone.label}</span>}
            />
            <StatCard
              icon={<Layers size={10} />}
              label="Variants"
              value={product.variants_count}
              sublabel={product.options.map((o) => o.name).join(' · ') || 'no options'}
            />
            <StatCard
              icon={<Calendar size={10} />}
              label="Published"
              value={formatDate(product.published_at)}
              sublabel={product.published_at ? formatRelative(product.published_at) : 'not published'}
            />
          </div>
        </div>
      </div>

      <Section title="Options">
        {product.options.length === 0 ? (
          <EmptyRow text="No options defined" />
        ) : (
          <div className="space-y-1.5">
            {product.options.map((opt) => (
              <div key={opt.name} className="flex items-start gap-2 text-xs">
                <span className="text-ds-text2 font-medium min-w-[70px]">{opt.name}</span>
                <div className="flex flex-wrap gap-1">
                  {opt.values.map((v) => (
                    <span key={v} className="text-ds-text2 bg-ds-hover px-1.5 py-0.5 rounded">{v}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title={`Variants (${product.variants.length})`}>
        {product.variants.length === 0 ? (
          <EmptyRow text="No variants" />
        ) : (
          <>
            <div className="bg-ds-surface2 border border-ds-borderSoft rounded-lg divide-y divide-ds-borderSoft overflow-hidden">
              {visibleVariants.map((v) => {
                const tone = inventoryTone(v.inventory_quantity);
                return (
                  <div key={v.id} className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-ds-hover/50 transition-colors">
                    <span className="text-ds-text font-medium flex-1 truncate min-w-0">{variantLabel(v)}</span>
                    <span className="font-mono text-ds-muted text-[11px] w-24 truncate">{v.sku ?? DASH}</span>
                    <span className="text-ds-text2 w-20 text-right">{formatPrice(v.price, product.currency)}</span>
                    <span className={`flex items-center gap-1.5 w-28 justify-end ${tone.text}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                      {v.inventory_quantity == null ? 'untracked' : `${v.inventory_quantity} ${tone.label}`}
                    </span>
                  </div>
                );
              })}
            </div>
            {hiddenCount > 0 && (
              <button
                onClick={() => setShowAllVariants(true)}
                className="text-xs text-ds-accent hover:text-ds-accentHover mt-2 transition-colors"
              >
                Show {hiddenCount} more
              </button>
            )}
          </>
        )}
      </Section>

      <Section title="Tags">
        {product.tags.length === 0 ? (
          <EmptyRow text="No tags" />
        ) : (
          <div className="flex items-start gap-2">
            <Tag size={11} className="text-ds-muted shrink-0 mt-1" />
            <div className="flex flex-wrap gap-1">
              {product.tags.map((t) => (
                <span key={t} className="text-[11px] text-ds-text2 bg-ds-hover px-1.5 py-0.5 rounded">#{t}</span>
              ))}
            </div>
          </div>
        )}
      </Section>

      <div className="mt-4 pt-3 border-t border-ds-borderSoft flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ds-muted min-w-0">
          <span className="flex items-center gap-1">
            <ImageIcon size={10} />
            {product.images.length} image{product.images.length !== 1 ? 's' : ''}
          </span>
          <span>·</span>
          <span>Created {formatDate(product.shopify_created_at)}</span>
          <span>·</span>
          <span>Updated {formatRelative(product.shopify_updated_at)}</span>
          <span>·</span>
          <span>Synced {formatRelative(product.synced_at)}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={product.storefront_url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!product.storefront_url}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 transition-colors ${
              product.storefront_url ? 'hover:bg-emerald-500/10' : 'opacity-40 pointer-events-none'
            }`}
          >
            <ExternalLink size={11} />
            Storefront
          </a>
          <a
            href={product.admin_url ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!product.admin_url}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-violet-500/20 bg-violet-500/5 text-violet-400 transition-colors ${
              product.admin_url ? 'hover:bg-violet-500/10' : 'opacity-40 pointer-events-none'
            }`}
          >
            <ExternalLink size={11} />
            Shopify Admin
          </a>
        </div>
      </div>
    </div>
  );
}
