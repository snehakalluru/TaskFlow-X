export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={
        className ??
        'h-4 w-full animate-pulse rounded-lg bg-white/10'
      }
      aria-hidden="true"
    />
  );
}

