import type { ReactNode } from 'react';
import { useEffect } from 'react';

export default function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      <button
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <div className="absolute right-0 top-0 h-full w-full max-w-md rounded-l-2xl border border-white/10 bg-slate-900/80 p-4 md:p-6 shadow-2xl backdrop-blur">
        {title && <div className="text-base font-semibold">{title}</div>}
        <div className="mt-3 h-[calc(100%-6rem)] overflow-auto">{children}</div>
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}

