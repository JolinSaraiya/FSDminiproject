import { useEffect } from 'react';
import { createPortal } from 'react-dom';

function Modal({ isOpen, onClose, title, subtitle, children }) {
  // Prevent background scroll and signal mobile bottom nav to hide
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-slate-950/75 p-0 sm:p-4 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="flex max-h-[92vh] sm:max-h-[85vh] w-full sm:max-w-lg flex-col rounded-t-[2rem] sm:rounded-3xl border border-white/50 bg-white/95 backdrop-blur-2xl shadow-2xl shadow-slate-950/50 transition-all duration-300 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2">
        {/* Mobile Pull Handle Indicator Bar */}
        <div
          className="sm:hidden pt-3 pb-1 flex justify-center cursor-pointer shrink-0"
          onClick={onClose}
          title="Tap or drag to close"
        >
          <div className="h-1.5 w-12 rounded-full bg-stone-300" />
        </div>

        {/* Modal Header (Fixed at top of sheet) */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200/60 bg-white/60 px-6 py-4 backdrop-blur-md shrink-0">
          <div>
            <h3 className="font-serif text-xl font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs font-semibold text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-stone-200/80 bg-white/90 text-slate-500 shadow-xs transition hover:bg-stone-100 hover:text-slate-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 pb-20 sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default Modal;
