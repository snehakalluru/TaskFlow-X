import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
};

const Input = forwardRef<HTMLInputElement, Props>(function Input({ label, error, className, id, ...rest }, ref) {
  const inputId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm text-white/70" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={clsx(
          'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20',
          error ? 'border-red-400/40 focus:ring-red-400/30' : '',
          className
        )}
        {...rest}
      />
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
});

export default Input;

