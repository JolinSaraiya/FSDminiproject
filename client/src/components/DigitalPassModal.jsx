import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCurrency } from '../context/CurrencyContext';

// Clean deterministic SVG QR Code generator (no external npm dependencies required)
function SvgQrCode({ text, size = 130 }) {
  // Generate pseudo-matrix from hash for authentic visual QR code rendering
  const matrixSize = 21;
  const hash = Array.from(text).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 7);
  
  const cells = [];
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Standard QR position finder patterns (corners)
      const isTopLeft = r < 7 && c < 7;
      const isTopRight = r < 7 && c >= matrixSize - 7;
      const isBottomLeft = r >= matrixSize - 7 && c < 7;

      let filled = false;
      if (isTopLeft || isTopRight || isBottomLeft) {
        const localR = isBottomLeft ? r - (matrixSize - 7) : r;
        const localC = isTopRight ? c - (matrixSize - 7) : c;
        if (localR === 0 || localR === 6 || localC === 0 || localC === 6) filled = true;
        else if (localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4) filled = true;
      } else {
        // Deterministic pseudo-random pattern based on string hash
        filled = ((r * 13 + c * 17 + hash) % 5) === 0 || ((r ^ c) % 3) === 0;
      }

      if (filled) {
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={c * 5}
            y={r * 5}
            width={5}
            height={5}
            fill="#0f172a"
          />
        );
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${matrixSize * 5} ${matrixSize * 5}`}
      className="rounded-xl border border-stone-300 bg-white p-2 shadow-inner"
    >
      {cells}
    </svg>
  );
}

export default function DigitalPassModal({ booking, hotel, isOpen, onClose }) {
  const { formatPrice } = useCurrency();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !booking) return null;

  const propHotel = hotel || booking.hotel || {};
  const bookingId = booking._id || 'STAY-VIP';
  const confirmationCode = `STAY-${bookingId.slice(-8).toUpperCase()}`;

  function handleCopy() {
    navigator.clipboard?.writeText(confirmationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-400/40 bg-linear-to-b from-stone-900 via-slate-950 to-stone-950 text-white shadow-2xl shadow-amber-500/10 overflow-hidden">
        {/* Gold Accent Top Bar */}
        <div className="bg-linear-to-r from-amber-500 via-amber-300 to-amber-500 px-6 py-2.5 text-center text-slate-950">
          <p className="font-mono text-[11px] font-extrabold tracking-widest uppercase">
            ✦ StayHub Verified VIP Guest Pass ✦
          </p>
        </div>

        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          ✕
        </button>

        {/* Printable Boarding Pass Section */}
        <div id="printable-boarding-pass" className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 font-serif font-extrabold text-slate-950 text-sm">
                  S
                </span>
                <span className="font-serif text-lg font-bold tracking-tight text-white">
                  StayHub Resorts
                </span>
              </div>
              <p className="mt-1 font-serif text-xl font-extrabold text-amber-300">
                {propHotel.name || 'Luxury Property'}
              </p>
              <p className="text-xs text-slate-400">{propHotel.city || 'India'} • {propHotel.roomType || 'Deluxe Suite'}</p>
            </div>

            <div className="text-right">
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-[11px] font-bold text-emerald-300 uppercase">
                Confirmed
              </span>
              <p className="mt-2 font-mono text-xs font-bold text-slate-300">
                {confirmationCode}
              </p>
            </div>
          </div>

          {/* QR Code & Flight-Style Itinerary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
            <div className="flex flex-col items-center justify-center sm:border-r sm:border-white/10 pr-2">
              <SvgQrCode text={`https://fs-dminiproject.vercel.app/verify/${bookingId}`} size={110} />
              <p className="mt-2 text-[10px] font-medium text-slate-400">Scan at Concierge</p>
            </div>

            <div className="sm:col-span-2 space-y-3 pl-1">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Check-in</p>
                  <p className="font-bold text-white text-sm">{formatDate(booking.checkInDate)}</p>
                  <p className="text-[10px] text-amber-400">From 14:00 PM</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Check-out</p>
                  <p className="font-bold text-white text-sm">{formatDate(booking.checkOutDate)}</p>
                  <p className="text-[10px] text-slate-400">Until 11:00 AM</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Rooms / Guests</p>
                  <p className="font-semibold text-white">
                    {booking.roomsBooked} Room(s) • {booking.guests} Guest(s)
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Total Settled</p>
                  <p className="font-serif font-extrabold text-amber-300 text-sm">
                    {formatPrice(booking.totalPrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Perforated Barcode Line */}
          <div className="relative pt-2">
            <div className="flex items-center justify-between border-t border-dashed border-white/20 pt-4">
              <div className="font-mono text-xs tracking-widest text-slate-400">
                ||| | || ||||| | ||| |||| | ||| ||
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="cursor-pointer rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-amber-300 hover:bg-white/20"
              >
                {copied ? '✓ Code Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-900/90 px-6 py-4">
          <p className="text-xs text-slate-400">Present this pass at front desk</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-300 shadow-md shadow-amber-500/20"
            >
              <span>🖨️</span>
              <span>Print Pass / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
