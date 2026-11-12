const VARIANT_CLASSES = {
  primary:
    'bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus:ring-slate-900',
  accent:
    'bg-amber-500 text-slate-950 shadow-sm hover:bg-amber-400 focus:ring-amber-500',
  secondary:
    'bg-stone-200 text-slate-800 hover:bg-stone-300 focus:ring-stone-400',
  danger:
    'bg-rose-600 text-white shadow-xs hover:bg-rose-700 focus:ring-rose-500',
  outline:
    'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-stone-50 focus:ring-slate-400',
};

function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  onClick,
}) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-tight transition duration-150 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-55 ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
