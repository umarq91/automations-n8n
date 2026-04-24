import { useState, useRef, useEffect } from 'react';
import { Pencil, Upload, AlertCircle, Loader2, ArrowLeft, X } from 'lucide-react';
import ErrorBanner from '../../../components/shared/ErrorBanner';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { useAuth } from '../../../contexts/AuthContext';
import { ProductModel } from '../../../models/ProductModel';
import type { Product, ProductCurrency, ProductStatus } from '../../../lib/supabase/types';
import type { ActiveSection } from '../../../components/layout/Sidebar';
import { currencyOptions } from '../../../lib/constants';
import TagInput from '../../../components/shared/TagInput';
import { productSchema, type FieldErrors } from '../../../lib/productValidation';

interface EditFormData {
  title: string;
  use_competitor_title: boolean;
  competitor_link: string;
  date: string;
  photo: File | null;
  photoPreview: string | null;
  existingPhotoUrl: string | null;
  colors: string[];
  sizes: string[];
  material: string;
  purchase_price: string;
  base_currency: string;
  converted_currency: string;
  supplier_link: string;
  note: string;
  season: string;
  gender: string;
  status: string;
  discount: string;
  stock_quantity: string;
  to_optimize: boolean;
}

const selectClass =
  'flex w-full px-3.5 py-2.5 bg-ds-surface2 border border-ds-border rounded-xl ' +
  'text-sm text-ds-text focus:outline-none focus:ring-2 focus:ring-ds-accent/30 ' +
  'focus:border-ds-accent/60 transition-all appearance-none cursor-pointer';

function normalizeCurrency(c: Product['currency']): ProductCurrency {
  if (c && typeof c === 'object' && 'base_currency' in c && 'converted_currency' in c) {
    return c as ProductCurrency;
  }
  const base = typeof c === 'string' && c.trim() ? c.trim() : 'USD';
  return { base_currency: base, converted_currency: base };
}

function productToFormData(p: Product): EditFormData {
  const currency = normalizeCurrency(p.currency);
  return {
    title: p.title, use_competitor_title: p.use_competitor_title,
    competitor_link: p.competitor_link ?? '', date: p.date ?? '',
    photo: null, photoPreview: null, existingPhotoUrl: p.photo_url ?? null,
    colors: p.colors ?? [], sizes: p.sizes ?? [], material: p.material ?? '',
    purchase_price: p.purchase_price != null ? String(p.purchase_price) : '',
    base_currency: currency.base_currency,
    converted_currency: currency.converted_currency === currency.base_currency ? '' : currency.converted_currency,
    supplier_link: p.supplier_link ?? '', note: p.note ?? '',
    season: p.season ?? '', gender: p.gender ?? '', status: p.status,
    discount: p.discount != null ? String(p.discount) : '',
    stock_quantity: p.stock_quantity != null ? String(p.stock_quantity) : '100',
    to_optimize: p.to_optimize,
  };
}

type SaveState = 'idle' | 'saving' | 'error';

interface EditItemFormProps {
  productId: string;
  onNavigate: (section: ActiveSection) => void;
}

export default function EditItemForm({ productId, onNavigate }: EditItemFormProps) {
  const { activeOrg } = useAuth();
  const [form,       setForm]       = useState<EditFormData | null>(null);
  const [loadError,  setLoadError]  = useState<string | null>(null);
  const [saveState,   setSaveState]   = useState<SaveState>('idle');
  const [errorMsg,    setErrorMsg]    = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ProductModel.getById(productId)
      .then((p) => setForm(productToFormData(p)))
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load product.'));
  }, [productId]);

  function set<K extends keyof EditFormData>(field: K, value: EditFormData[K]) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function addTag(field: 'colors' | 'sizes', value: string) {
    setForm((prev) => prev ? { ...prev, [field]: [...prev[field], value] } : prev);
  }

  function removeTag(field: 'colors' | 'sizes', index: number) {
    setForm((prev) => prev ? { ...prev, [field]: prev[field].filter((_, i) => i !== index) } : prev);
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file || !form) return;
    if (form.photoPreview) URL.revokeObjectURL(form.photoPreview);
    setForm((prev) => prev ? { ...prev, photo: file, photoPreview: URL.createObjectURL(file), existingPhotoUrl: null } : prev);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removePhoto() {
    if (!form) return;
    if (form.photoPreview) URL.revokeObjectURL(form.photoPreview);
    setForm((prev) => prev ? { ...prev, photo: null, photoPreview: null, existingPhotoUrl: null } : prev);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrg || !form) return;

    const parsed = productSchema.safeParse({
      title: form.title.trim(),
      purchase_price: form.purchase_price.trim(),
      competitor_link: form.competitor_link.trim(),
    });

    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!errs[field]) errs[field] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setSaveState('saving');
    setErrorMsg('');

    try {
      let photoUrl: string | null = form.existingPhotoUrl;
      if (form.photo) photoUrl = await ProductModel.uploadPhoto(form.photo, activeOrg.id, productId);

      const currency: ProductCurrency = {
        base_currency: form.base_currency,
        converted_currency: (form.converted_currency || form.base_currency).trim(),
      };

      await ProductModel.update(productId, {
        title: form.title.trim(), status: form.status as ProductStatus,
        date: form.date || null, photo_url: photoUrl,
        colors: form.colors, sizes: form.sizes,
        material: form.material.trim() || null,
        purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
        currency, discount: form.discount ? parseFloat(form.discount) : null,
        use_competitor_title: form.use_competitor_title,
        competitor_link: form.competitor_link.trim() || null,
        supplier_link: form.supplier_link.trim() || null,
        note: form.note.trim() || null,
        season: form.season || null, gender: form.gender || null,
        stock_quantity: form.stock_quantity ? parseInt(form.stock_quantity, 10) : 100,
        to_optimize: form.to_optimize,
      });

      if (form.photoPreview) URL.revokeObjectURL(form.photoPreview);
      onNavigate('products-list');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSaveState('error');
    }
  }

  if (loadError) {
    return (
      <div className="animate-fade-in card flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle size={28} className="text-red-400 mb-3" />
        <p className="text-red-400 text-sm mb-4">{loadError}</p>
        <Button variant="secondary" onClick={() => onNavigate('products-list')}><ArrowLeft size={14} /> Back to Products</Button>
      </div>
    );
  }

  if (!form) {
    return <div className="animate-fade-in card flex items-center justify-center py-20"><div className="w-5 h-5 border-2 border-ds-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  const photoDisplay = form.photoPreview ?? form.existingPhotoUrl;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <button type="button" onClick={() => onNavigate('products-list')}
          className="w-8 h-8 rounded-xl bg-ds-surface2 border border-ds-border flex items-center justify-center hover:bg-ds-hover transition-colors">
          <ArrowLeft size={15} className="text-ds-text2" />
        </button>
        <div className="w-10 h-10 rounded-xl gradient-indigo flex items-center justify-center shadow-accent-glow">
          <Pencil size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-ds-text font-bold text-xl tracking-tight">Edit Item</h1>
          <p className="text-ds-muted text-sm mt-0.5">Update product details</p>
        </div>
      </div>

      {saveState === 'error' && <ErrorBanner message={errorMsg} onDismiss={() => setSaveState('idle')} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="sm:col-span-2 lg:col-span-3">
              <Label htmlFor="edit-title">Title <span className="text-red-400">*</span></Label>
              <Input id="edit-title" placeholder="Product title" value={form.title} onChange={(e) => { set('title', e.target.value); if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: undefined })); }} className={fieldErrors.title ? 'border-red-500 focus:border-red-500' : ''} />
              {fieldErrors.title && <p className="text-red-400 text-xs mt-1">{fieldErrors.title}</p>}
              <div className="flex items-center justify-between mt-3 px-3.5 py-2.5 bg-ds-surface2 border border-ds-border rounded-xl">
                <div>
                  <p className="text-ds-text2 text-xs font-medium">Use competitor's title</p>
                  <p className="text-ds-muted text-[11px] mt-0.5">When enabled, the workflow will use the competitor's title instead of yours.</p>
                </div>
                <Switch id="edit-use-competitor-title" checked={form.use_competitor_title} onCheckedChange={(val) => set('use_competitor_title', val)} />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-date">Date</Label>
              <Input id="edit-date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select id="edit-status" className={selectClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="NOT_IMPORTED">Not Imported</option>
                <option value="READY_TO_IMPORT">Ready to Import</option>
                <option value="ALREADY_IMPORTED">Already Imported</option>
                <option value="IMPORTING">Importing</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit-gender">Gender</Label>
              <select id="edit-gender" className={selectClass} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <option value="">Select gender</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
                <option value="kids">Kids</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit-season">Season</Label>
              <select id="edit-season" className={selectClass} value={form.season} onChange={(e) => set('season', e.target.value)}>
                <option value="">Select season</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="fall">Fall</option>
                <option value="winter">Winter</option>
                <option value="all-season">All Season</option>
              </select>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">Photo</h2>
          {photoDisplay ? (
            <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-ds-border group">
              <img src={photoDisplay} alt="preview" className="w-full h-full object-cover" />
              <button type="button" onClick={removePhoto}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-[#0B0F14]/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={11} className="text-white" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-ds-border rounded-xl cursor-pointer hover:border-ds-accent/50 hover:bg-ds-surface2/50 transition-all">
              <Upload size={20} className="text-ds-muted mb-2" />
              <span className="text-ds-muted text-sm">Click to upload photo</span>
              <span className="text-ds-muted text-xs mt-1">PNG, JPG, WEBP up to 10MB</span>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          )}
          {photoDisplay && (
            <label className="mt-3 flex items-center gap-2 cursor-pointer text-xs text-ds-accent hover:text-ds-accentHover transition-colors w-fit">
              <Upload size={12} />Replace photo
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">Attributes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="edit-colors">Colors</Label>
              <TagInput id="edit-colors" placeholder="e.g. Red" tags={form.colors} onAdd={(v) => addTag('colors', v)} onRemove={(i) => removeTag('colors', i)} />
            </div>
            <div>
              <Label htmlFor="edit-sizes">Sizes</Label>
              <TagInput id="edit-sizes" placeholder="e.g. M" tags={form.sizes} onAdd={(v) => addTag('sizes', v)} onRemove={(i) => removeTag('sizes', i)} />
            </div>
            <div>
              <Label htmlFor="edit-material">Material</Label>
              <Input id="edit-material" placeholder="e.g. 100% Cotton" value={form.material} onChange={(e) => set('material', e.target.value)} />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="edit-purchase-price">Purchase Price <span className="text-red-400">*</span></Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ds-muted text-sm">$</span>
                <Input id="edit-purchase-price" type="number" min="0" step="0.01" placeholder="0.00" className={`pl-7${fieldErrors.purchase_price ? ' border-red-500 focus:border-red-500' : ''}`} value={form.purchase_price} onChange={(e) => { set('purchase_price', e.target.value); if (fieldErrors.purchase_price) setFieldErrors((p) => ({ ...p, purchase_price: undefined })); }} />
              </div>
              {fieldErrors.purchase_price && <p className="text-red-400 text-xs mt-1">{fieldErrors.purchase_price}</p>}
            </div>
            <div>
              <Label htmlFor="edit-base-currency">Base Currency</Label>
              <select id="edit-base-currency" className={selectClass} value={form.base_currency}
                onChange={(e) => { const next = e.target.value; setForm((prev) => prev ? { ...prev, base_currency: next, converted_currency: prev.converted_currency ? prev.converted_currency : '' } : prev); }}>
                {currencyOptions.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
              <div className="mt-3 flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="edit-converted-currency">Converted Currency (optional)</Label>
                  <select id="edit-converted-currency" className={selectClass} value={form.converted_currency} onChange={(e) => set('converted_currency', e.target.value)}>
                    <option value="">Same as base</option>
                    {currencyOptions.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </select>
                </div>
                <Button type="button" variant="secondary" onClick={() => set('converted_currency', form.base_currency)} className="h-10">Keep same</Button>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-discount">Discount (%)</Label>
              <div className="relative">
                <Input id="edit-discount" type="number" min="0" max="100" placeholder="0" className="pr-8" value={form.discount} onChange={(e) => set('discount', e.target.value)} />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ds-muted text-sm">%</span>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-stock-quantity">Stock Quantity</Label>
              <Input id="edit-stock-quantity" type="number" min="0" step="1" placeholder="100" value={form.stock_quantity} onChange={(e) => set('stock_quantity', e.target.value)} />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="edit-competitor-link">Competitor Link <span className="text-red-400">*</span></Label>
              <Input id="edit-competitor-link" type="url" placeholder="https://" value={form.competitor_link} onChange={(e) => { set('competitor_link', e.target.value); if (fieldErrors.competitor_link) setFieldErrors((p) => ({ ...p, competitor_link: undefined })); }} className={fieldErrors.competitor_link ? 'border-red-500 focus:border-red-500' : ''} />
              {fieldErrors.competitor_link && <p className="text-red-400 text-xs mt-1">{fieldErrors.competitor_link}</p>}
            </div>
            <div>
              <Label htmlFor="edit-supplier-link">Supplier Link</Label>
              <Input id="edit-supplier-link" type="url" placeholder="https://" value={form.supplier_link} onChange={(e) => set('supplier_link', e.target.value)} />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">Notes</h2>
          <Textarea id="edit-note" placeholder="Add any additional notes about this product…" rows={4} value={form.note} onChange={(e) => set('note', e.target.value)} />
        </section>

        <section className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-ds-text text-sm font-semibold">Queue for AI Optimization</h2>
              <p className="text-ds-muted text-xs mt-1 leading-relaxed">When enabled, our AI workflow will automatically optimize this product's title, description, and tags before listing it on Shopify.</p>
            </div>
            <Switch id="edit-to-optimize" checked={form.to_optimize} onCheckedChange={(val) => set('to_optimize', val)} />
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Button type="button" variant="secondary" onClick={() => onNavigate('products-list')} disabled={saveState === 'saving'}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={saveState === 'saving'}>
            {saveState === 'saving' ? <><Loader2 size={14} className="animate-spin" />Saving…</> : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
