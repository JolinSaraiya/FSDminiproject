import { useEffect, useState } from 'react';

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 320);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll back to top"
      className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-30 flex items-center gap-1.5 rounded-full border border-white/40 bg-slate-950/80 px-3.5 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-xl transition hover:bg-slate-900 hover:scale-105 active:scale-95 animate-in fade-in"
    >
      <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
      <span>Top</span>
    </button>
  );
}

export default BackToTop;
