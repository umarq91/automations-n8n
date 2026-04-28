import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | 'ellipsis')[] = [1];

  if (current <= 4) {
    pages.push(2, 3, 4, 5, 'ellipsis', total);
  } else if (current >= total - 3) {
    pages.push('ellipsis', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push('ellipsis', current - 1, current, current + 1, 'ellipsis', total);
  }

  return pages;
}

const itemBase =
  'inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-all select-none';

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav
      className={cn('flex items-center justify-center gap-1', className)}
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={cn(itemBase, 'gap-0.5 text-ds-muted hover:bg-ds-hover hover:text-ds-text2 disabled:opacity-30 disabled:cursor-not-allowed')}
        aria-label="Previous page"
      >
        <ChevronLeft size={14} />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span
            key={`ellipsis-${i}`}
            className={cn(itemBase, 'text-ds-muted cursor-default')}
          >
            <MoreHorizontal size={14} />
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              itemBase,
              p === page
                ? 'bg-ds-accent text-white shadow-accent-glow'
                : 'text-ds-muted hover:bg-ds-hover hover:text-ds-text2'
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={cn(itemBase, 'gap-0.5 text-ds-muted hover:bg-ds-hover hover:text-ds-text2 disabled:opacity-30 disabled:cursor-not-allowed')}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={14} />
      </button>
    </nav>
  );
}
