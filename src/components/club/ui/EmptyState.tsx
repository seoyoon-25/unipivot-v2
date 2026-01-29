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
      <Icon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
      <p className="text-gray-500 font-medium">{title}</p>
      {description && (
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block mt-4 text-sm text-blue-600 hover:underline"
        >
          {actionLabel} &rarr;
        </Link>
      )}
    </div>
  );
}
