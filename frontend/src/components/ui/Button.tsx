import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export default function Button({
  variant = 'primary',
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}: Props) {
  const styles =
    variant === 'primary'
      ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
      : variant === 'secondary'
        ? 'bg-white/5 hover:bg-white/10 text-white'
        : variant === 'danger'
          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-500/30'
          : 'bg-transparent hover:bg-white/5 text-white/90';

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-60 disabled:cursor-not-allowed',
        styles,
        className
      )}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}

