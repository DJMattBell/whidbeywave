import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

type EmptyStateProps = {
  icon: LucideIcon;
  headline: string;
  subtext?: string;
  action?: { label: string; href: string };
};

export default function EmptyState({ icon: Icon, headline, subtext, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Icon className="empty-state-icon" size={48} strokeWidth={1.5} />
      <h3 className="empty-state-title">{headline}</h3>
      {subtext && <p className="empty-state-text">{subtext}</p>}
      {action && (
        <Link href={action.href} className="btn-primary">
          {action.label}
        </Link>
      )}
    </div>
  );
}
