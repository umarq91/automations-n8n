import { useState } from "react";
import { PackagePlus, Loader2 } from "lucide-react";
import ErrorBanner from "../../../components/shared/ErrorBanner";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { Switch } from "../../../components/ui/switch";
import { useAuth } from "../../../contexts/AuthContext";
import { ProductModel } from "../../../models/ProductModel";
import type {
  ProductCurrency,
  ProductStatus,
} from "../../../lib/supabase/types";
import type { ActiveSection } from "../../../components/layout/Sidebar";
import { currencyOptions } from "../../../lib/constants";
import TagInput from "../../../components/shared/TagInput";
import {
  productSchema,
  type FieldErrors,
} from "../../../lib/productValidation";

interface AddItemFormData {
  title: string;
  use_competitor_title: boolean;
  competitor_link: string;
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
  shopify_initial_status: 'DRAFT' | 'PUBLISH';
}

const emptyForm: AddItemFormData = {
  title: "",
  use_competitor_title: false,
  competitor_link: "",
  colors: [],
  sizes: [],
  material: "",
  purchase_price: "",
  base_currency: "USD",
  converted_currency: "",
  supplier_link: "",
  note: "",
  season: "",
  gender: "",
  status: "DRAFT",
  discount: "",
  stock_quantity: "100",
  to_optimize: false,
  shopify_initial_status: 'DRAFT',
};

const selectClass =
  "flex w-full px-3.5 py-2.5 bg-ds-surface2 border border-ds-border rounded-xl " +
  "text-sm text-ds-text focus:outline-none focus:ring-2 focus:ring-ds-accent/30 " +
  "focus:border-ds-accent/60 transition-all appearance-none cursor-pointer";

type SaveState = "idle" | "saving" | "error";

interface AddItemFormProps {
  onNavigate: (section: ActiveSection, productId?: string) => void;
}

export default function AddItemForm({ onNavigate }: AddItemFormProps) {
  const { activeOrg, user } = useAuth();
  const [form, setForm] = useState<AddItemFormData>(emptyForm);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function set<K extends keyof AddItemFormData>(
    field: K,
    value: AddItemFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addTag(field: "colors" | "sizes", value: string) {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], value] }));
  }

  function removeTag(field: "colors" | "sizes", index: number) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }

  function handleReset() {
    setForm(emptyForm);
    setSaveState("idle");
    setErrorMsg("");
    setFieldErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeOrg || !user) return;

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
    setSaveState("saving");
    setErrorMsg("");

    try {
      const currency: ProductCurrency = {
        base_currency: form.base_currency,
        converted_currency: (
          form.converted_currency || form.base_currency
        ).trim(),
      };

      await ProductModel.create({
        organization_id: activeOrg.id,
        created_by: user.id,
        title: form.title.trim(),
        status: form.status as ProductStatus,
        date: null,
        photo_url: null,
        colors: form.colors,
        sizes: form.sizes,
        material: form.material.trim() || null,
        purchase_price: form.purchase_price
          ? parseFloat(form.purchase_price)
          : null,
        currency,
        discount: form.discount ? parseFloat(form.discount) : null,
        use_competitor_title: form.use_competitor_title,
        competitor_link: form.competitor_link.trim() || null,
        supplier_link: form.supplier_link.trim() || null,
        note: form.note.trim() || null,
        season: form.season || null,
        gender: form.gender || null,
        stock_quantity: form.stock_quantity
          ? parseInt(form.stock_quantity, 10)
          : 100,
        shopify_product_url: null,
        shopify_admin_url: null,
        to_optimize: form.to_optimize,
        shopify_initial_status: form.shopify_initial_status,
      });

      onNavigate("products-list");
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setSaveState("error");
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl gradient-indigo flex items-center justify-center shadow-accent-glow">
          <PackagePlus size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-ds-text font-bold text-xl tracking-tight">
            List Product
          </h1>
          <p className="text-ds-muted text-sm mt-0.5">
            Create a new product in your catalog
          </p>
        </div>
      </div>

      {saveState === "error" && (
        <ErrorBanner
          message={errorMsg}
          onDismiss={() => setSaveState("idle")}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">
            Basic Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Label htmlFor="item-title">
                Title <span className="text-red-400">*</span>
              </Label>
              <Input
                id="item-title"
                placeholder="Product title"
                value={form.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (fieldErrors.title)
                    setFieldErrors((p) => ({ ...p, title: undefined }));
                }}
                className={
                  fieldErrors.title ? "border-red-500 focus:border-red-500" : ""
                }
              />
              {fieldErrors.title && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.title}</p>
              )}
              <div className="flex items-center justify-between mt-3 px-3.5 py-2.5 bg-ds-surface2 border border-ds-border rounded-xl">
                <div>
                  <p className="text-ds-text2 text-xs font-medium">
                    Use competitor's title
                  </p>
                  <p className="text-ds-muted text-[11px] mt-0.5">
                    When enabled, the workflow will use the competitor's title
                    instead of yours.
                  </p>
                </div>
                <Switch
                  id="item-use-competitor-title"
                  checked={form.use_competitor_title}
                  onCheckedChange={(val) => set("use_competitor_title", val)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="item-gender">Gender</Label>
              <select
                id="item-gender"
                className={selectClass}
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
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
                onChange={(e) => set("season", e.target.value)}
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

        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">
            Attributes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="item-colors">Colors</Label>
              <TagInput
                id="item-colors"
                placeholder="e.g. Red"
                tags={form.colors}
                onAdd={(v) => addTag("colors", v)}
                onRemove={(i) => removeTag("colors", i)}
              />
            </div>
            <div>
              <Label htmlFor="item-sizes">Sizes</Label>
              <TagInput
                id="item-sizes"
                placeholder="e.g. M"
                tags={form.sizes}
                onAdd={(v) => addTag("sizes", v)}
                onRemove={(i) => removeTag("sizes", i)}
              />
            </div>
            <div>
              <Label htmlFor="item-material">Material</Label>
              <Input
                id="item-material"
                placeholder="e.g. 100% Cotton"
                value={form.material}
                onChange={(e) => set("material", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">
            Pricing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="item-purchase-price">
                Purchase Price <span className="text-red-400">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ds-muted text-sm">
                  $
                </span>
                <Input
                  id="item-purchase-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`pl-7${fieldErrors.purchase_price ? " border-red-500 focus:border-red-500" : ""}`}
                  value={form.purchase_price}
                  onChange={(e) => {
                    set("purchase_price", e.target.value);
                    if (fieldErrors.purchase_price)
                      setFieldErrors((p) => ({
                        ...p,
                        purchase_price: undefined,
                      }));
                  }}
                />
              </div>
              {fieldErrors.purchase_price && (
                <p className="text-red-400 text-xs mt-1">
                  {fieldErrors.purchase_price}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="item-base-currency">Base Currency</Label>
              <select
                id="item-base-currency"
                className={selectClass}
                value={form.base_currency}
                onChange={(e) => {
                  const next = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    base_currency: next,
                    converted_currency: prev.converted_currency
                      ? prev.converted_currency
                      : "",
                  }));
                }}
              >
                {currencyOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="mt-3 flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="item-converted-currency">
                    Converted Currency (optional)
                  </Label>
                  <select
                    id="item-converted-currency"
                    className={selectClass}
                    value={form.converted_currency}
                    onChange={(e) => set("converted_currency", e.target.value)}
                  >
                    <option value="">Same as base</option>
                    {currencyOptions.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => set("converted_currency", form.base_currency)}
                  className="h-10"
                >
                  Keep same
                </Button>
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
                  onChange={(e) => set("discount", e.target.value)}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ds-muted text-sm">
                  %
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="item-stock-quantity">Stock Quantity</Label>
              <Input
                id="item-stock-quantity"
                type="number"
                min="0"
                step="1"
                placeholder="100"
                value={form.stock_quantity}
                onChange={(e) => set("stock_quantity", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">
            Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="item-competitor-link">
                Competitor Link <span className="text-red-400">*</span>
              </Label>
              <Input
                id="item-competitor-link"
                type="url"
                placeholder="https://"
                value={form.competitor_link}
                onChange={(e) => {
                  set("competitor_link", e.target.value);
                  if (fieldErrors.competitor_link)
                    setFieldErrors((p) => ({
                      ...p,
                      competitor_link: undefined,
                    }));
                }}
                className={
                  fieldErrors.competitor_link
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }
              />
              {fieldErrors.competitor_link && (
                <p className="text-red-400 text-xs mt-1">
                  {fieldErrors.competitor_link}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="item-supplier-link">Supplier Link</Label>
              <Input
                id="item-supplier-link"
                type="url"
                placeholder="https://"
                value={form.supplier_link}
                onChange={(e) => set("supplier_link", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">
            Notes
          </h2>
          <Textarea
            id="item-note"
            placeholder="Add any additional notes about this product…"
            rows={4}
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
          />
        </section>

        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">
            Status
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: "DRAFT", label: "Draft", desc: "Saved but not queued for import." },
              { value: "READY_TO_IMPORT", label: "Ready to Import", desc: "Queued for Shopify import." },
            ] as const).map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => set("status", value)}
                className={`flex flex-col items-start px-4 py-3.5 rounded-xl border text-left transition-all ${
                  form.status === value
                    ? "border-ds-accent/60 bg-ds-accent/[0.08] shadow-accent-glow"
                    : "border-ds-border bg-ds-surface2 hover:border-ds-border/80 hover:bg-ds-hover"
                }`}
              >
                <span className={`text-sm font-semibold ${form.status === value ? "text-ds-accent" : "text-ds-text2"}`}>
                  {label}
                </span>
                <span className="text-xs text-ds-muted mt-0.5">{desc}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="text-ds-text2 text-xs font-semibold uppercase tracking-widest mb-5">
            Shopify Listing Status
          </h2>
          <p className="text-ds-muted text-xs mb-4">
            After the automated flow lists this product on Shopify, it will be created with this status.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: "DRAFT", label: "Draft", desc: "Listed privately, not visible in store." },
              { value: "PUBLISH", label: "Publish", desc: "Listed publicly, visible to customers." },
            ] as const).map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => set("shopify_initial_status", value)}
                className={`flex flex-col items-start px-4 py-3.5 rounded-xl border text-left transition-all ${
                  form.shopify_initial_status === value
                    ? "border-ds-accent/60 bg-ds-accent/[0.08] shadow-accent-glow"
                    : "border-ds-border bg-ds-surface2 hover:border-ds-border/80 hover:bg-ds-hover"
                }`}
              >
                <span className={`text-sm font-semibold ${form.shopify_initial_status === value ? "text-ds-accent" : "text-ds-text2"}`}>
                  {label}
                </span>
                <span className="text-xs text-ds-muted mt-0.5">{desc}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-ds-text text-sm font-semibold">
                Queue for AI Optimization
              </h2>
              <p className="text-ds-muted text-xs mt-1 leading-relaxed">
                When enabled, our AI workflow will automatically optimize this
                product's title, description, and tags before listing it on
                Shopify.
              </p>
            </div>
            <Switch
              id="add-to-optimize"
              checked={form.to_optimize}
              onCheckedChange={(val) => set("to_optimize", val)}
            />
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={saveState === "saving"}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saveState === "saving"}
          >
            {saveState === "saving" ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save Item"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
