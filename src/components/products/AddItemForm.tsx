import { useState } from 'react';
import { PackagePlus, Upload, X, HardHat, Plus } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface AddItemFormData {
  title: string;
  competitor_link: string;
  date: string;
  photo: File | null;
  colors: string[];
  sizes: string[];
  material: string;
  purchase_price: string;
  supplier_link: string;
  note: string;
  season: string;
  gender: string;
  status: string;
  discount: string;
}

const emptyForm: AddItemFormData = {
  title: '',
  competitor_link: '',
  date: '',
  photo: null,
  colors: [],
  sizes: [],
  material: '',
  purchase_price: '',
  supplier_link: '',
  note: '',
  season: '',
  gender: '',
  status: 'draft',
  discount: '',
};

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
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed);
    }
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          id={id}
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
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
            <span
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-ds-surface2 border border-ds-border rounded-lg text-xs text-ds-text"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-ds-muted hover:text-red-400 transition-colors"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AddItemForm() {
  const [form, setForm] = useState<AddItemFormData>(emptyForm);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  function set<K extends keyof AddItemFormData>(field: K, value: AddItemFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addTag(field: 'colors' | 'sizes', value: string) {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], value] }));
  }

  function removeTag(field: 'colors' | 'sizes', index: number) {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, photo: file }));
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
  }

  function clearPhoto() {
    setForm((prev) => ({ ...prev, photo: null }));
    setPhotoPreview(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  function handleReset() {
    setForm(emptyForm);
    setPhotoPreview(null);
  }

  return (
    <div className="animate-fade-in">
      {/* Under development banner */}
      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 mb-6 w-fit">
        <HardHat size={14} className="text-amber-400 shrink-0" />
        <span className="text-amber-400 text-xs font-semibold">Under Development</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl gradient-indigo flex items-center justify-center shadow-accent-glow">
          <PackagePlus size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-ds-text font-bold text-xl tracking-tight">Add Item</h1>
          <p className="text-ds-muted text-sm mt-0.5">Create a new product in your catalog</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">Basic Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="sm:col-span-2 lg:col-span-3">
              <Label htmlFor="item-title">Title</Label>
              <Input
                id="item-title"
                placeholder="Product title"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="item-date">Date</Label>
              <Input
                id="item-date"
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="item-status">Status</Label>
              <select
                id="item-status"
                className={selectClass}
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <Label htmlFor="item-gender">Gender</Label>
              <select
                id="item-gender"
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
              <Label htmlFor="item-season">Season</Label>
              <select
                id="item-season"
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
          {photoPreview ? (
            <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-ds-border group">
              <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={clearPhoto}
                className="absolute top-2 right-2 w-6 h-6 bg-[#0B0F14]/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} className="text-ds-text" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-ds-border rounded-xl cursor-pointer hover:border-ds-accent/50 hover:bg-ds-surface2/50 transition-all">
              <Upload size={20} className="text-ds-muted mb-2" />
              <span className="text-ds-muted text-sm">Click to upload photo</span>
              <span className="text-ds-muted text-xs mt-1">PNG, JPG, WEBP up to 10MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          )}
        </section>

        {/* Attributes */}
        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">Attributes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="item-colors">Colors</Label>
              <TagInput
                id="item-colors"
                placeholder="e.g. Red"
                tags={form.colors}
                onAdd={(v) => addTag('colors', v)}
                onRemove={(i) => removeTag('colors', i)}
              />
            </div>
            <div>
              <Label htmlFor="item-sizes">Sizes</Label>
              <TagInput
                id="item-sizes"
                placeholder="e.g. M"
                tags={form.sizes}
                onAdd={(v) => addTag('sizes', v)}
                onRemove={(i) => removeTag('sizes', i)}
              />
            </div>
            <div>
              <Label htmlFor="item-material">Material</Label>
              <Input
                id="item-material"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="item-purchase-price">Purchase Price</Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ds-muted text-sm">$</span>
                <Input
                  id="item-purchase-price"
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
              <Label htmlFor="item-discount">Discount (%)</Label>
              <div className="relative">
                <Input
                  id="item-discount"
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
              <Label htmlFor="item-competitor-link">Competitor Link</Label>
              <Input
                id="item-competitor-link"
                type="url"
                placeholder="https://"
                value={form.competitor_link}
                onChange={(e) => set('competitor_link', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="item-supplier-link">Supplier Link</Label>
              <Input
                id="item-supplier-link"
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
            id="item-note"
            placeholder="Add any additional notes about this product…"
            rows={4}
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
          />
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button type="button" variant="secondary" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" variant="primary" disabled>
            Save Item
          </Button>
        </div>
      </form>
    </div>
  );
}
