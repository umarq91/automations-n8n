export const PRODUCT_STATUS = {
  NOT_IMPORTED: 'NOT_IMPORTED',
  READY_TO_IMPORT: 'READY_TO_IMPORT',
  ALREADY_IMPORTED: 'ALREADY_IMPORTED',
  IMPORTING: 'IMPORTING',
  IMPORTED: 'IMPORTED',
  NOT_OPTIMIZED: 'NOT_OPTIMIZED',
  OPTIMIZED: 'OPTIMIZED',
} as const;

export const PRODUCT_STATUS_LABEL: Record<string, string> = {
  NOT_IMPORTED: 'Not Imported',
  READY_TO_IMPORT: 'Ready to Import',
  ALREADY_IMPORTED: 'Already Imported',
  IMPORTING: 'Importing',
  IMPORTED: 'Imported',
  NOT_OPTIMIZED: 'Pending Optimization',
  OPTIMIZED: 'Optimized',
};

export const PRODUCT_STATUS_CLASS: Record<string, string> = {
  NOT_IMPORTED: 'text-ds-muted bg-ds-surface2 border-ds-border',
  READY_TO_IMPORT: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  ALREADY_IMPORTED: 'text-ds-accent bg-ds-accent/10 border-ds-accent/20',
  IMPORTING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  IMPORTED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  NOT_OPTIMIZED: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  OPTIMIZED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};
