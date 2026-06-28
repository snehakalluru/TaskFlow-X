import type { ReactNode } from 'react';

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
      <div className="text-base font-semibold">{title}</div>
      {description && <div className="mt-2 text-sm text-white/70">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

