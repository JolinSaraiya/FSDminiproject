import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getFallbackHotelImage, resolveHotelImage } from '../utils/hotelImages';

export default function PhotoGalleryModal({ hotel, isOpen, onClose, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !hotel) return null;

  const baseImage = resolveHotelImage(hotel);
  const fallback = getFallbackHotelImage(hotel);

  // Gallery of curated architectural angles
  const galleryImages = [
    {
      src: baseImage,
      title: `${hotel.name} — Signature View`,
      caption: `Grand facade and welcome pavilion located in ${hotel.city}.`,
    },
    {
      src: fallback,
      title: `${hotel.roomType} — Premium Sanctuary`,
      caption: `Elegantly appointed suites featuring bespoke linens and panoramic vistas.`,
    },
    {
      src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80',
      title: 'Luxury Suite & Master Bedroom',
      caption: 'Plush California king bedding, marble bath accents, and tailored room automation.',
    },
    {
      src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80',
      title: 'Infinity Pool & Sunset Horizon',
      caption: 'Temperature-controlled outdoor leisure waters with private cabanas.',
    },
    {
      src: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80',
      title: 'Gourmet Dining & Lounge',
      caption: 'Michelin-grade culinary experiences with world-class mixology.',
    },
  ];

  const currentPhoto = galleryImages[currentIndex] || galleryImages[0];

  function handlePrev() {
    setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex flex-col justify-between bg-black/95 backdrop-blur-2xl text-white select-none animate-in fade-in duration-200"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
            StayHub Architectural Gallery
          </p>
          <h2 className="font-serif text-lg font-bold text-white sm:text-xl">
            {hotel.name} <span className="text-xs font-normal text-slate-400">• {hotel.city}</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/10 px-3 py-1 font-mono text-xs font-semibold text-slate-300">
            {currentIndex + 1} / {galleryImages.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            title="Close Lightbox (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex flex-1 items-center justify-center p-4 sm:p-8 overflow-hidden">
        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous photo"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/60 text-xl font-bold text-white backdrop-blur-md transition hover:bg-black/90 hover:scale-105"
        >
          ‹
        </button>

        <img
          key={currentPhoto.src}
          src={currentPhoto.src}
          alt={currentPhoto.title}
          className="max-h-[68vh] max-w-full rounded-2xl object-contain shadow-2xl shadow-black ring-1 ring-white/15 animate-in zoom-in-95 duration-200"
        />

        {/* Next Button */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next photo"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/60 text-xl font-bold text-white backdrop-blur-md transition hover:bg-black/90 hover:scale-105"
        >
          ›
        </button>
      </div>

      {/* Caption & Thumbnail Strip Footer */}
      <div className="border-t border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="font-serif text-base font-bold text-amber-300">{currentPhoto.title}</h3>
          <p className="mt-0.5 text-xs text-slate-400">{currentPhoto.caption}</p>
        </div>

        {/* Thumbnails */}
        <div className="mt-3 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-12 w-18 shrink-0 overflow-hidden rounded-lg border-2 transition cursor-pointer ${
                currentIndex === idx
                  ? 'border-amber-400 scale-105 opacity-100 ring-2 ring-amber-400/50'
                  : 'border-white/20 opacity-50 hover:opacity-80'
              }`}
            >
              <img src={img.src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
