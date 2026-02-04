import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto mb-4 flex items-center justify-center">
        <Icon className="w-8 h-8" />
      </div>
      <p className="text-base font-semibold text-zinc-900 mb-1">{title}</p>
      {description && (
        <p className="text-sm text-zinc-500 mb-6">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="club-btn-primary"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
