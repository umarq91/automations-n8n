import { z } from 'zod';

export const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  purchase_price: z.string().min(1, 'Purchase price is required'),
  competitor_link: z.string().min(1, 'Competitor link is required').url('Must be a valid URL'),
});

export type FieldErrors = Partial<Record<'title' | 'purchase_price' | 'competitor_link', string>>;
