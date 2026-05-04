import { z } from 'zod';
import Papa from 'papaparse';

const VALID_STATUSES = ['NOT_IMPORTED', 'READY_TO_IMPORT', 'ALREADY_IMPORTED', 'IMPORTING'] as const;
const VALID_GENDERS = ['men', 'women', 'unisex', 'kids'] as const;
const VALID_SEASONS = ['spring', 'summer', 'fall', 'winter', 'all-season'] as const;

const csvRowSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  purchase_price: z
    .string()
    .min(1, 'Purchase price is required')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, 'Must be a non-negative number'),
  competitor_link: z
    .string()
    .min(1, 'Competitor link is required')
    .url('Must be a valid URL'),
  status: z.string().optional(),
  date: z.string().optional(),
  material: z.string().optional(),
  colors: z.string().optional(),
  sizes: z.string().optional(),
  gender: z.string().optional(),
  season: z.string().optional(),
  supplier_link: z
    .string()
    .optional()
    .refine((v) => !v || v === '' || z.string().url().safeParse(v).success, 'Supplier link must be a valid URL'),
  note: z.string().optional(),
  discount: z
    .string()
    .optional()
    .refine((v) => !v || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0 && parseFloat(v) <= 100), 'Must be 0–100'),
  stock_quantity: z
    .string()
    .optional()
    .refine((v) => !v || (!isNaN(parseInt(v, 10)) && parseInt(v, 10) >= 0), 'Must be a non-negative integer'),
});

export type CsvRowParsed = z.infer<typeof csvRowSchema>;

export interface ParsedRow {
  rowIndex: number;
  data: CsvRowParsed;
}

export interface RowError {
  rowIndex: number;
  field: string;
  message: string;
}

export interface CsvParseResult {
  valid: ParsedRow[];
  errors: RowError[];
  totalRows: number;
}

export const CSV_REQUIRED_HEADERS = ['title', 'purchase_price', 'competitor_link'] as const;

export const CSV_TEMPLATE_HEADERS = [
  'title', 'purchase_price', 'competitor_link',
  'status', 'date', 'material', 'colors', 'sizes',
  'gender', 'season', 'supplier_link', 'note', 'discount', 'stock_quantity',
];

export function downloadCsvTemplate() {
  const example = [
    'Blue Denim Jacket', '25.99', 'https://competitor.com/product/123',
    'NOT_IMPORTED', '2024-01-15', '100% Cotton', 'Blue|Navy', 'S|M|L|XL',
    'men', 'fall', 'https://supplier.com/item/456', 'Best seller', '10', '100',
  ];
  const rows = [CSV_TEMPLATE_HEADERS.join(','), example.join(',')];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products_import_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCsv(file: File): Promise<CsvParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        if (results.errors.length > 0 && results.data.length === 0) {
          reject(new Error('Could not parse CSV. Make sure it is comma-separated with a header row.'));
          return;
        }
        const headers = results.meta.fields ?? [];
        const missing = CSV_REQUIRED_HEADERS.filter((h) => !headers.includes(h));
        if (missing.length > 0) {
          reject(new Error(`Missing required columns: ${missing.join(', ')}`));
          return;
        }
        if (results.data.length === 0) {
          reject(new Error('CSV has no data rows.'));
          return;
        }

        const valid: ParsedRow[] = [];
        const errors: RowError[] = [];

        results.data.forEach((row, i) => {
          const rowIndex = i + 2;
          const parsed = csvRowSchema.safeParse(row);
          if (parsed.success) {
            valid.push({ rowIndex, data: parsed.data });
          } else {
            for (const issue of parsed.error.issues) {
              errors.push({ rowIndex, field: String(issue.path[0] ?? 'unknown'), message: issue.message });
            }
          }
        });

        resolve({ valid, errors, totalRows: results.data.length });
      },
      error(err) {
        reject(new Error(err.message));
      },
    });
  });
}

export function toDatabaseRow(row: CsvRowParsed, organizationId: string, createdBy: string) {
  const status = VALID_STATUSES.includes(row.status as typeof VALID_STATUSES[number])
    ? (row.status as typeof VALID_STATUSES[number])
    : 'NOT_IMPORTED';
  const gender = VALID_GENDERS.includes(row.gender as typeof VALID_GENDERS[number])
    ? (row.gender as typeof VALID_GENDERS[number])
    : null;
  const season = VALID_SEASONS.includes(row.season as typeof VALID_SEASONS[number])
    ? (row.season as typeof VALID_SEASONS[number])
    : null;

  return {
    organization_id: organizationId,
    created_by: createdBy,
    source: 'manual' as const,
    title: row.title.trim(),
    purchase_price: parseFloat(row.purchase_price),
    competitor_link: row.competitor_link.trim(),
    status,
    date: row.date?.trim() || null,
    material: row.material?.trim() || null,
    colors: row.colors ? row.colors.split('|').map((c) => c.trim()).filter(Boolean) : [],
    sizes: row.sizes ? row.sizes.split('|').map((s) => s.trim()).filter(Boolean) : [],
    gender,
    season,
    supplier_link: row.supplier_link?.trim() || null,
    note: row.note?.trim() || null,
    discount: row.discount ? parseFloat(row.discount) : null,
    stock_quantity: row.stock_quantity ? parseInt(row.stock_quantity, 10) : 100,
    currency: { base_currency: 'USD', converted_currency: 'USD' },
    photo_url: null,
    shopify_product_url: null,
    shopify_admin_url: null,
    use_competitor_title: false,
    to_optimize: false,
    shopify_initial_status: 'DRAFT' as const,
  };
}
