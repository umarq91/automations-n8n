interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-ds-surface2 border border-ds-border flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-ds-text2 text-sm font-medium">{title}</p>
      {description && <p className="text-ds-muted text-xs mt-1">{description}</p>}
    </div>
  );
}
