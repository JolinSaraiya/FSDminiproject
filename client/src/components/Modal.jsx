function Modal({ isOpen, onClose, title, subtitle, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 p-0 sm:p-4 backdrop-blur-md transition-all duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[92vh] w-full sm:max-w-lg overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-white/40 bg-white/90 backdrop-blur-2xl shadow-2xl shadow-slate-950/40 transition-all">
        {/* Mobile Pull Handle Indicator (Visual Mobile Feature) */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="h-1.5 w-12 rounded-full bg-stone-300/80" />
        </div>

        <div className="flex items-start justify-between gap-4 border-b border-stone-200/50 bg-white/50 px-6 py-4.5 backdrop-blur-md">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs font-medium text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-stone-200/80 bg-white/80 text-slate-500 shadow-xs transition hover:bg-stone-100 hover:text-slate-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
