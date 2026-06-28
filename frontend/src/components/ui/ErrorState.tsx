import type { ReactNode } from 'react';

export default function ErrorState({
  title,
  description,
  action,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
      <div className="text-base font-semibold text-red-100">{title}</div>
      {description && <div className="mt-2 text-sm text-red-100/80">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

