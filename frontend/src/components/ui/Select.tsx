import { forwardRef, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

type Option = { value: string; label: string };

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> & {
  label?: string;
  error?: string | null;
  value?: string;
  onValueChange?: (v: string) => void;
  options: Option[];
};

const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { label, error, className, id, options, value, onValueChange, onChange, ...rest },
  ref
) {
  const selectId = id ?? (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm text-white/70" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={clsx(
          'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20',
          error ? 'border-red-400/40 focus:ring-red-400/30' : '',
          className
        )}
        value={value ?? ''}
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(e.target.value);
        }}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-slate-900">
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
});

export default Select;

