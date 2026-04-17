import { useState, useRef, useEffect } from 'react';
import { Pencil, Upload, X, Plus, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../contexts/AuthContext';
import { getProductById, updateProduct, uploadProductPhoto } from '../../lib/supabase/products';
import type { Product, ProductStatus } from '../../lib/supabase/types';
import type { ActiveSection } from '../Sidebar';

interface EditFormData {
  title: string;
  competitor_link: string;
  date: string;
  photo: File | null;
  photoPreview: string | null;
  existingPhotoUrl: string | null;
  colors: string[];
  sizes: string[];
  material: string;
  purchase_price: string;
  currency: string;
  supplier_link: string;
  note: string;
  season: string;
  gender: string;
  status: string;
  discount: string;
}

const selectClass =
  'flex w-full px-3.5 py-2.5 bg-ds-surface2 border border-ds-border rounded-xl ' +
  'text-sm text-ds-text focus:outline-none focus:ring-2 focus:ring-ds-accent/30 ' +
  'focus:border-ds-accent/60 transition-all appearance-none cursor-pointer';

function TagInput({
  id,
  placeholder,
  tags,
  onAdd,
  onRemove,
}: {
  id: string;
  placeholder: string;
  tags: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}) {
  const [input, setInput] = useState('');

  function add() {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) onAdd(trimmed);
    setInput('');
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          id={id}
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button
          type="button"
          onClick={add}
          className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-ds-surface2 border border-ds-border hover:border-ds-accent/60 hover:bg-ds-hover transition-all"
        >
          <Plus size={15} className="text-ds-accent" />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {tags.map((tag, i) => (
            <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-ds-surface2 border border-ds-border rounded-lg text-xs text-ds-text">
              {tag}
              <button type="button" onClick={() => onRemove(i)} className="text-ds-muted hover:text-red-400 transition-colors">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

type SaveState = 'idle' | 'saving' | 'error';

interface EditItemFormProps {
  productId: string;
  onNavigate: (section: ActiveSection) => void;
}

function productToFormData(p: Product): EditFormData {
  return {
    title: p.title,
    competitor_link: p.competitor_link ?? '',
    date: p.date ?? '',
    photo: null,
    photoPreview: null,
    existingPhotoUrl: p.photo_url ?? null,
    colors: p.colors ?? [],
    sizes: p.sizes ?? [],
    material: p.material ?? '',
    purchase_price: p.purchase_price != null ? String(p.purchase_price) : '',
    currency: p.currency ?? 'USD',
    supplier_link: p.supplier_link ?? '',
    note: p.note ?? '',
    season: p.season ?? '',
    gender: p.gender ?? '',
    status: p.status,
    discount: p.discount != null ? String(p.discount) : '',
  };
}

export default function EditItemForm({ productId, onNavigate }: EditItemFormProps) {
  const { activeOrg } = useAuth();
  const [form, setForm] = useState<EditFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProductById(productId)
      .then((p) => setForm(productToFormData(p)))
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load product.'));
  }, [productId]);

  function set<K extends keyof EditFormData>(field: K, value: EditFormData[K]) {
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);
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
    if (!form.title.trim()) {
      setErrorMsg('Title is required.');
      setSaveState('error');
      return;
    }

    setSaveState('saving');
    setErrorMsg('');

    try {
      let photoUrl: string | null = form.existingPhotoUrl;

      if (form.photo) {
        photoUrl = await uploadProductPhoto(form.photo, activeOrg.id, productId);
      }

      await updateProduct(productId, {
        title: form.title.trim(),
        status: form.status as ProductStatus,
        date: form.date || null,
        photo_url: photoUrl,
        colors: form.colors,
        sizes: form.sizes,
        material: form.material.trim() || null,
        purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
        currency: form.currency || null,
        discount: form.discount ? parseFloat(form.discount) : null,
        competitor_link: form.competitor_link.trim() || null,
        supplier_link: form.supplier_link.trim() || null,
        note: form.note.trim() || null,
        season: form.season || null,
        gender: form.gender || null,
      });

      if (form.photoPreview) URL.revokeObjectURL(form.photoPreview);
      onNavigate('products-list');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setErrorMsg(msg);
      setSaveState('error');
    }
  }

  if (loadError) {
    return (
      <div className="animate-fade-in card flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle size={28} className="text-red-400 mb-3" />
        <p className="text-red-400 text-sm mb-4">{loadError}</p>
        <Button variant="secondary" onClick={() => onNavigate('products-list')}>
          <ArrowLeft size={14} /> Back to Products
        </Button>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="animate-fade-in card flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-ds-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const photoDisplay = form.photoPreview ?? form.existingPhotoUrl;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => onNavigate('products-list')}
          className="w-8 h-8 rounded-xl bg-ds-surface2 border border-ds-border flex items-center justify-center hover:bg-ds-hover transition-colors"
        >
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

      {/* Error banner */}
      {saveState === 'error' && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-sm flex-1">{errorMsg}</p>
          <button type="button" onClick={() => setSaveState('idle')} className="text-red-400/50 hover:text-red-400 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="sm:col-span-2 lg:col-span-3">
              <Label htmlFor="edit-title">Title <span className="text-red-400">*</span></Label>
              <Input
                id="edit-title"
                placeholder="Product title"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                className={selectClass}
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                <option value="NOT_IMPORTED">Not Imported</option>
                <option value="READY_TO_IMPORT">Ready to Import</option>
                <option value="ALREADY_IMPORTED">Already Imported</option>
                <option value="IMPORTING">Importing</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit-gender">Gender</Label>
              <select
                id="edit-gender"
                className={selectClass}
                value={form.gender}
                onChange={(e) => set('gender', e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
                <option value="kids">Kids</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit-season">Season</Label>
              <select
                id="edit-season"
                className={selectClass}
                value={form.season}
                onChange={(e) => set('season', e.target.value)}
              >
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

        {/* Photo */}
        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">Photo</h2>

          {photoDisplay ? (
            <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-ds-border group">
              <img src={photoDisplay} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-[#0B0F14]/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={11} className="text-white" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-ds-border rounded-xl cursor-pointer hover:border-ds-accent/50 hover:bg-ds-surface2/50 transition-all">
              <Upload size={20} className="text-ds-muted mb-2" />
              <span className="text-ds-muted text-sm">Click to upload photo</span>
              <span className="text-ds-muted text-xs mt-1">PNG, JPG, WEBP up to 10MB</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />
            </label>
          )}
          {photoDisplay && (
            <label className="mt-3 flex items-center gap-2 cursor-pointer text-xs text-ds-accent hover:text-ds-accentHover transition-colors w-fit">
              <Upload size={12} />
              Replace photo
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />
            </label>
          )}
        </section>

        {/* Attributes */}
        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">Attributes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="edit-colors">Colors</Label>
              <TagInput
                id="edit-colors"
                placeholder="e.g. Red"
                tags={form.colors}
                onAdd={(v) => addTag('colors', v)}
                onRemove={(i) => removeTag('colors', i)}
              />
            </div>
            <div>
              <Label htmlFor="edit-sizes">Sizes</Label>
              <TagInput
                id="edit-sizes"
                placeholder="e.g. M"
                tags={form.sizes}
                onAdd={(v) => addTag('sizes', v)}
                onRemove={(i) => removeTag('sizes', i)}
              />
            </div>
            <div>
              <Label htmlFor="edit-material">Material</Label>
              <Input
                id="edit-material"
                placeholder="e.g. 100% Cotton"
                value={form.material}
                onChange={(e) => set('material', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="edit-purchase-price">Purchase Price</Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ds-muted text-sm">$</span>
                <Input
                  id="edit-purchase-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7"
                  value={form.purchase_price}
                  onChange={(e) => set('purchase_price', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-currency">Currency</Label>
              <select
                id="edit-currency"
                className={selectClass}
                value={form.currency}
                onChange={(e) => set('currency', e.target.value)}
              >
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="CAD">CAD — Canadian Dollar</option>
                <option value="AUD">AUD — Australian Dollar</option>
                <option value="JPY">JPY — Japanese Yen</option>
                <option value="CNY">CNY — Chinese Yuan</option>
                <option value="INR">INR — Indian Rupee</option>
                <option value="BRL">BRL — Brazilian Real</option>
                <option value="MXN">MXN — Mexican Peso</option>
                <option value="AED">AED — UAE Dirham</option>
                <option value="SAR">SAR — Saudi Riyal</option>
                <option value="CHF">CHF — Swiss Franc</option>
                <option value="SEK">SEK — Swedish Krona</option>
                <option value="NOK">NOK — Norwegian Krone</option>
                <option value="TRY">TRY — Turkish Lira</option>
                <option value="PKR">PKR — Pakistani Rupee</option>
              </select>
            </div>
            <div>
              <Label htmlFor="edit-discount">Discount (%)</Label>
              <div className="relative">
                <Input
                  id="edit-discount"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  className="pr-8"
                  value={form.discount}
                  onChange={(e) => set('discount', e.target.value)}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ds-muted text-sm">%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Links */}
        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="edit-competitor-link">Competitor Link</Label>
              <Input
                id="edit-competitor-link"
                type="url"
                placeholder="https://"
                value={form.competitor_link}
                onChange={(e) => set('competitor_link', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-supplier-link">Supplier Link</Label>
              <Input
                id="edit-supplier-link"
                type="url"
                placeholder="https://"
                value={form.supplier_link}
                onChange={(e) => set('supplier_link', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">Notes</h2>
          <Textarea
            id="edit-note"
            placeholder="Add any additional notes about this product…"
            rows={4}
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
          />
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button type="button" variant="secondary" onClick={() => onNavigate('products-list')} disabled={saveState === 'saving'}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saveState === 'saving'}>
            {saveState === 'saving' ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
