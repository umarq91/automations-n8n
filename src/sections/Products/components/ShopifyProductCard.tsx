import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, ExternalLink, Tag, Boxes, DollarSign, Calendar,
  Layers, Copy, Check, Image as ImageIcon, Zap, X, Loader2,
  ChevronDown, Package,
} from 'lucide-react';
import type { Product, ShopifyProductMeta, ShopifyProductVariant } from '../../../lib/supabase/types';
import { ProductModel } from '../../../models/ProductModel';
import { formatDate, formatRelative } from '../../../lib/utils';

const STATUS_CLASS: Record<string, string> = {
  active:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  draft:    'text-amber-400  bg-amber-500/10  border-amber-500/20',
  archived: 'text-ds-muted   bg-ds-surface2   border-ds-border',
};

const DASH = '—';

const EMPTY_META: ShopifyProductMeta = {
  handle: null, vendor: null, product_type: null,
  tags: [], images: [], options: [], variants: [],
  sku: null, price: null, compare_at_price: null,
  price_min: null, price_max: null, total_inventory: null,
  currency: null, variants_count: 0, body_html: null,
  description: null, published_at: null,
  shopify_created_at: null, shopify_updated_at: null, synced_at: null,
};

function getMeta(product: Product): ShopifyProductMeta {
  return { ...EMPTY_META, ...(product.metadata ?? {}) };
}

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

function inventoryTone(qty: number | null): { dot: string; text: string; label: string } {
  if (qty == null) return { dot: 'bg-ds-muted',     text: 'text-ds-muted',     label: 'untracked' };
  if (qty <= 0)    return { dot: 'bg-red-400',       text: 'text-red-400',       label: 'out of stock' };
  if (qty <= 10)   return { dot: 'bg-amber-400',     text: 'text-amber-400',     label: 'low stock' };
  return                   { dot: 'bg-emerald-400',  text: 'text-emerald-400',  label: 'in stock' };
}

function variantLabel(v: ShopifyProductVariant): string {
  const parts = [v.option1, v.option2, v.option3].filter(Boolean);
  return parts.length ? parts.join(' / ') : (v.title || 'Default');
}

function CopyChip({ text, label }: { text: string | null; label: string }) {
  const [copied, setCopied] = useState(false);
  const canCopy = Boolean(text);
  async function handleCopy() {
    if (!canCopy) return;
    try { await navigator.clipboard.writeText(text!); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch { /* ignore */ }
  }
  return (
    <button
      onClick={handleCopy}
      disabled={!canCopy}
      className="inline-flex items-center gap-1 text-[11px] text-ds-text2 bg-ds-surface2 border border-ds-borderSoft hover:bg-ds-hover disabled:opacity-50 disabled:cursor-default px-2 py-0.5 rounded-md transition-colors"
      title={canCopy ? `Copy ${label}` : label}
    >
      <span className="text-ds-muted">{label}:</span>
      <span className="font-mono">{text ?? DASH}</span>
      {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} className="text-ds-muted opacity-60" />}
    </button>
  );
}

function StatPill({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub: React.ReactNode }) {
  return (
    <div className="flex-1 min-w-[130px] bg-ds-surface2/60 border border-ds-borderSoft rounded-xl px-3.5 py-2.5 space-y-0.5">
      <div className="flex items-center gap-1.5 text-ds-muted text-[10px] uppercase tracking-wider font-semibold">{icon}{label}</div>
      <div className="text-ds-text font-semibold text-sm leading-snug">{value}</div>
      <div className="text-ds-muted text-[11px] leading-snug">{sub}</div>
    </div>
  );
}

export default function ShopifyProductCard({ product }: { product: Product }) {
  const [open, setOpen]                   = useState(false);
  const [showAllVariants, setShowAllVariants] = useState(false);
  const [toOptimize, setToOptimize]       = useState(product.to_optimize && product.status !== 'OPTIMIZED');
  const [optimizedAt, setOptimizedAt]     = useState(product.optimized_at ?? null);
  const [optimizing, setOptimizing]       = useState(false);

  const meta        = getMeta(product);
  const isOptimized = Boolean(optimizedAt) || product.status === 'OPTIMIZED';
  const statusKey   = (product.shopify_status ?? '').toLowerCase();
  const statusClass = STATUS_CLASS[statusKey] ?? STATUS_CLASS.archived;
  const invTone     = inventoryTone(meta.total_inventory);
  const metaLabel   = [meta.vendor, meta.product_type].filter(Boolean).join(' · ') || null;
  const thumb       = meta.images[0]?.src ?? product.photo_url ?? null;
  const visibleVariants = showAllVariants ? meta.variants : meta.variants.slice(0, 5);
  const hiddenCount     = meta.variants.length - visibleVariants.length;

  async function handleOptimizeToggle() {
    const next = !toOptimize;
    setOptimizing(true);
    try {
      await ProductModel.setOptimizeStatus(product.id, next, null);
      setToOptimize(next);
      if (next) setOptimizedAt(null);
    } catch { /* ignore */ }
    setOptimizing(false);
  }

  return (
    <div className="card-elevated overflow-hidden transition-shadow hover:shadow-card">

      {/* ── Collapsed header ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-ds-hover/30 transition-colors text-left"
      >
        {/* Thumbnail */}
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-ds-surface2 border border-ds-borderSoft shrink-0 flex items-center justify-center">
          {thumb
            ? <img src={thumb} alt="" className="w-full h-full object-cover" />
            : <ShoppingBag size={16} className="text-ds-muted" />
          }
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-ds-text font-semibold text-sm leading-tight truncate">{product.title}</p>
          {metaLabel && <p className="text-ds-muted text-[11px] mt-0.5 truncate">{metaLabel}</p>}
        </div>

        {/* Right badges */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Inventory dot */}
          <span className={`flex items-center gap-1.5 text-[11px] font-medium ${invTone.text}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${invTone.dot}`} />
            <span className="hidden sm:inline">{meta.total_inventory != null ? meta.total_inventory : DASH}</span>
          </span>

          {/* Price */}
          <span className="text-ds-text2 text-[11px] font-mono hidden sm:block">
            {formatPriceRange(meta.price_min, meta.price_max, meta.currency)}
          </span>

          {/* Status badge */}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium capitalize ${statusClass}`}>
            {product.shopify_status ?? 'unknown'}
          </span>

          {/* Chevron */}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="text-ds-muted"
          >
            <ChevronDown size={15} />
          </motion.span>
        </div>
      </button>

      {/* ── Expanded body ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pb-5 border-t border-ds-borderSoft">

              {/* Image gallery + main info */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 pt-5">
                {/* Gallery */}
                <div className="w-full sm:w-44 sm:shrink-0 flex flex-col gap-2">
                  <div className="w-full sm:w-44 h-44 bg-ds-surface2 border border-ds-border rounded-xl overflow-hidden flex items-center justify-center">
                    {thumb
                      ? <img src={thumb} alt={product.title} className="w-full h-full object-cover" />
                      : <Package size={32} className="text-ds-muted" />
                    }
                  </div>
                  {meta.images.length > 1 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {meta.images.slice(0, 5).map((img, i) => (
                        <div key={`${img.src}-${i}`} className="w-9 h-9 rounded-md overflow-hidden border border-ds-borderSoft">
                          <img src={img.src} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {meta.images.length > 5 && (
                        <div className="w-9 h-9 rounded-md border border-ds-border bg-ds-surface2 flex items-center justify-center">
                          <span className="text-[10px] text-ds-muted">+{meta.images.length - 5}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div className="flex-1 min-w-0">
                  {/* Copy chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <CopyChip text={meta.sku}    label="SKU" />
                    <CopyChip text={meta.handle} label="Handle" />
                    <CopyChip text={product.shopify_id != null ? String(product.shopify_id) : null} label="ID" />
                  </div>

                  {/* Description */}
                  {meta.description && (
                    <p className="text-ds-text2 text-xs leading-relaxed line-clamp-2 mb-3">
                      {meta.description}
                    </p>
                  )}

                  {/* Stat pills */}
                  <div className="flex flex-wrap gap-2">
                    <StatPill
                      icon={<DollarSign size={10} />} label="Price"
                      value={formatPriceRange(meta.price_min, meta.price_max, meta.currency)}
                      sub={meta.currency ?? DASH}
                    />
                    <StatPill
                      icon={<Boxes size={10} />} label="Inventory"
                      value={
                        <span className="flex items-center gap-1.5">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${invTone.dot}`} />
                          {meta.total_inventory ?? DASH}
                        </span>
                      }
                      sub={<span className={invTone.text}>{invTone.label}</span>}
                    />
                    <StatPill
                      icon={<Layers size={10} />} label="Variants"
                      value={meta.variants_count}
                      sub={meta.options.map((o) => o.name).join(' · ') || 'no options'}
                    />
                    <StatPill
                      icon={<Calendar size={10} />} label="Published"
                      value={formatDate(meta.published_at)}
                      sub={meta.published_at ? (formatRelative(meta.published_at) ?? DASH) : 'not published'}
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              {meta.options.length > 0 && (
                <div className="mt-5 pt-4 border-t border-ds-borderSoft">
                  <p className="text-ds-muted text-[10px] uppercase tracking-wider font-semibold mb-2">Options</p>
                  <div className="space-y-1.5">
                    {meta.options.map((opt) => (
                      <div key={opt.name} className="flex items-start gap-2 text-xs">
                        <span className="text-ds-text2 font-medium min-w-[70px]">{opt.name}</span>
                        <div className="flex flex-wrap gap-1">
                          {opt.values.map((v) => (
                            <span key={v} className="text-ds-text2 bg-ds-hover px-1.5 py-0.5 rounded-md">{v}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Variants */}
              {meta.variants.length > 0 && (
                <div className="mt-5 pt-4 border-t border-ds-borderSoft">
                  <p className="text-ds-muted text-[10px] uppercase tracking-wider font-semibold mb-2">
                    Variants ({meta.variants.length})
                  </p>
                  <div className="bg-ds-surface2/50 border border-ds-borderSoft rounded-xl divide-y divide-ds-borderSoft overflow-hidden">
                    {visibleVariants.map((v) => {
                      const tone = inventoryTone(v.inventory_quantity);
                      return (
                        <div key={v.id} className="flex items-center gap-3 px-3.5 py-2 text-xs hover:bg-ds-hover/40 transition-colors">
                          <span className="text-ds-text font-medium flex-1 truncate min-w-0">{variantLabel(v)}</span>
                          <span className="font-mono text-ds-muted text-[11px] w-24 truncate hidden sm:block">{v.sku ?? DASH}</span>
                          <span className="text-ds-text2 w-20 text-right">{formatPrice(v.price, meta.currency)}</span>
                          <span className={`flex items-center gap-1.5 w-28 justify-end ${tone.text}`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                            {v.inventory_quantity == null ? 'untracked' : `${v.inventory_quantity}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {hiddenCount > 0 && (
                    <button onClick={() => setShowAllVariants(true)} className="text-xs text-ds-accent hover:text-ds-accentHover mt-2 transition-colors">
                      Show {hiddenCount} more variants
                    </button>
                  )}
                </div>
              )}

              {/* Tags */}
              {meta.tags.length > 0 && (
                <div className="mt-5 pt-4 border-t border-ds-borderSoft">
                  <p className="text-ds-muted text-[10px] uppercase tracking-wider font-semibold mb-2">Tags</p>
                  <div className="flex items-start gap-2">
                    <Tag size={11} className="text-ds-muted shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {meta.tags.map((t) => (
                        <span key={t} className="text-[11px] text-ds-text2 bg-ds-hover px-1.5 py-0.5 rounded-md">#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-5 pt-4 border-t border-ds-borderSoft flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ds-muted">
                  <span className="flex items-center gap-1"><ImageIcon size={10} />{meta.images.length} image{meta.images.length !== 1 ? 's' : ''}</span>
                  <span>·</span>
                  <span>Created {formatDate(meta.shopify_created_at)}</span>
                  <span>·</span>
                  <span>Synced {formatRelative(meta.synced_at) ?? DASH}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleOptimizeToggle}
                    disabled={optimizing}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${
                      toOptimize
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                        : isOptimized
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                          : 'border-ds-border text-ds-muted hover:bg-ds-accent/10 hover:border-ds-accent/30 hover:text-ds-accent'
                    }`}
                  >
                    {optimizing
                      ? <Loader2 size={11} className="animate-spin" />
                      : toOptimize ? <X size={11} />
                      : isOptimized ? <Check size={11} />
                      : <Zap size={11} />
                    }
                    {toOptimize ? 'Queued' : isOptimized ? 'Optimized' : 'Optimize'}
                  </button>
                  <a
                    href={product.shopify_product_url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!product.shopify_product_url}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-medium transition-colors ${product.shopify_product_url ? 'hover:bg-emerald-500/10' : 'opacity-40 pointer-events-none'}`}
                  >
                    <ExternalLink size={11} />Storefront
                  </a>
                  <a
                    href={product.shopify_admin_url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!product.shopify_admin_url}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-violet-500/20 bg-violet-500/5 text-violet-400 font-medium transition-colors ${product.shopify_admin_url ? 'hover:bg-violet-500/10' : 'opacity-40 pointer-events-none'}`}
                  >
                    <ExternalLink size={11} />Admin
                  </a>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
