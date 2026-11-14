import { useEffect, useState } from 'react';

function ViewportBadge() {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = dimensions.width < 768;
  const isTablet = dimensions.width >= 768 && dimensions.width < 1024;
  const mode = isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop';

  return (
    <aside
      aria-label="Responsive Viewport Inspector"
      className="fixed bottom-20 left-3 md:bottom-5 md:left-5 z-30 select-none"
    >
      {/* Expanded Differences Cheat Sheet Modal/Popover */}
      {open && (
        <div className="mb-2 w-80 max-w-[90vw] rounded-3xl border border-white/80 bg-slate-950/90 p-5 text-white shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="font-serif text-sm font-bold text-white">Responsive Inspector</p>
              <p className="text-[11px] font-mono text-amber-400">
                Current Viewport: {dimensions.width}px ({mode})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs text-slate-300 hover:bg-white/20"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 space-y-2.5 text-xs text-slate-300">
            <p className="font-semibold text-white">Active Responsive Changes:</p>
            <div className="space-y-1.5 rounded-2xl bg-white/5 p-3 font-mono text-[11px]">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">1.</span>
                <span>
                  <strong>Nav:</strong> {isMobile ? 'Floating Glass Bottom Dock' : 'Top Horizontal Glass Bar'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">2.</span>
                <span>
                  <strong>Modal:</strong> {isMobile ? 'iOS Bottom Sheet with Drag Handle' : 'Floating Centered Dialog'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">3.</span>
                <span>
                  <strong>Inputs:</strong> {isMobile ? 'Touch Steppers (+/−, no keyboard)' : 'Standard Numeric Controls'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">4.</span>
                <span>
                  <strong>Filters:</strong> {isMobile ? 'Swipeable Touch Carousel + Drawer' : 'Full 5-Column Grid'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">5.</span>
                <span>
                  <strong>Stats:</strong> {isMobile ? 'Compact 2x2 Glass Grid' : 'Wide 4-Column Layout'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Viewport Pill Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-lg backdrop-blur-xl transition hover:bg-white hover:scale-105 active:scale-95 cursor-pointer"
        title="Click to view Desktop vs Mobile differences"
      >
        <span
          className={`h-2 w-2 rounded-full ${
            isMobile ? 'bg-emerald-500 animate-pulse' : isTablet ? 'bg-sky-500' : 'bg-amber-500'
          }`}
        />
        <span>{isMobile ? '📱 Mobile' : isTablet ? '💻 Tablet' : '🖥️ Desktop'}</span>
        <span className="font-mono text-[10px] text-slate-500">({dimensions.width}px)</span>
        <span className="rounded-full bg-slate-900 px-1.5 py-0.2 text-[9px] text-white">Diffs ⚡</span>
      </button>
    </aside>
  );
}

export default ViewportBadge;
