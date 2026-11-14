import { useState } from 'react';
import { getFallbackHotelImage, resolveHotelImage } from '../utils/hotelImages';
import { useCurrency } from '../context/CurrencyContext';
import PhotoGalleryModal from './PhotoGalleryModal';
import Button from './Button';

const CITY_CLIMATES = {
  mumbai: { temp: '31°C', condition: '☀️ Coastal Breeze' },
  bengaluru: { temp: '24°C', condition: '⛅ Pleasant Valley' },
  jaipur: { temp: '28°C', condition: '🌤️ Royal Sunset' },
  pune: { temp: '26°C', condition: '🌿 Deccan Hills' },
  goa: { temp: '30°C', condition: '🌊 Tropical Tide' },
  delhi: { temp: '27°C', condition: '🌤️ Golden Hour' },
};

function getCityClimate(cityName = '') {
  const key = cityName.trim().toLowerCase();
  return CITY_CLIMATES[key] || { temp: '27°C', condition: '🌤️ Fair Weather' };
}

function HotelCard({ hotel, onBook, isRecentlyBooked = false, layout = 'grid' }) {
  const {
    name,
    city,
    address,
    roomType,
    pricePerNight,
    totalRooms,
    availableRooms,
    amenities = [],
    description,
    gradient = 'from-indigo-600 to-violet-600',
  } = hotel;

  const { formatPrice } = useCurrency();
  const primaryImage = resolveHotelImage(hotel);
  const fallbackImage = getFallbackHotelImage(hotel);
  const [failedUrl, setFailedUrl] = useState('');
  const [shared, setShared] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const activeImage = failedUrl === primaryImage ? fallbackImage : primaryImage;
  const isAvailable = availableRooms > 0;
  const climate = getCityClimate(city);

  async function handleShare(e) {
    e.stopPropagation();
    const shareData = {
      title: `${name} | StayHub Luxury Stays`,
      text: `Reserve ${name} in ${city} on StayHub at ${formatPrice(pricePerNight)}/night.`,
      url: window.location.href,
    };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User dismissed share dialog
      }
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${name} in ${city} — ${window.location.href}`);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  return (
    <article
      className={`group flex ${
        layout === 'list' ? 'flex-col md:flex-row' : 'flex-col'
      } overflow-hidden rounded-3xl border bg-white/75 backdrop-blur-xl shadow-lg shadow-stone-950/5 transition duration-300 hover:-translate-y-1.5 hover:border-amber-400/80 hover:shadow-2xl hover:shadow-stone-900/15 ${
        isRecentlyBooked
          ? 'border-amber-400 ring-4 ring-amber-400/50 ring-offset-2'
          : 'border-white/70'
      }`}
    >
      {/* Property Photo Banner */}
      <div
        className={`relative ${
          layout === 'list' ? 'h-56 md:h-auto md:w-80 shrink-0' : 'h-52'
        } overflow-hidden bg-linear-to-br ${gradient} p-5 text-white`}
      >
        <img
          src={activeImage}
          alt={`${name} in ${city}`}
          loading="lazy"
          onError={() => {
            if (activeImage !== fallbackImage) {
              setFailedUrl(primaryImage);
            }
          }}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/20 to-slate-950/45"
        />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <span className="rounded-full border border-white/25 bg-slate-950/55 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-md">
              {roomType}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share property"
                title="Share property via Mobile Share Sheet"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-slate-950/60 text-white backdrop-blur-md transition hover:bg-slate-900 shadow-xs"
              >
                {shared ? (
                  <span className="text-[10px] font-bold text-emerald-400">✓</span>
                ) : (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                )}
              </button>
              {isRecentlyBooked ? (
                <span className="animate-pulse rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950 shadow-md">
                  ⚡ Just Reserved!
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-xs ${
                    isAvailable
                      ? 'bg-emerald-950/80 text-emerald-200 ring-1 ring-emerald-400/40 backdrop-blur-md'
                      : 'bg-rose-950/85 text-rose-200 ring-1 ring-rose-400/40 backdrop-blur-md'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isAvailable ? 'animate-pulse bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />
                  {isAvailable ? `${availableRooms} of ${totalRooms || availableRooms} left` : 'Sold Out'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm font-semibold text-white drop-shadow-xs">
            <div className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4 shrink-0 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              <span>{city}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setGalleryOpen(true);
              }}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/30 bg-slate-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 backdrop-blur-md transition hover:bg-slate-900 shadow-2xs"
              title="Open Fullscreen Architecture Gallery"
            >
              <span>📷</span>
              <span>5 Photos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-bold tracking-tight text-slate-900 group-hover:text-amber-700">
              {name}
            </h3>
            {address && <p className="mt-1 text-xs text-slate-500">{address}</p>}
          </div>
          <div className="shrink-0 text-right">
            <p className="font-serif text-xl font-extrabold tracking-tight text-slate-900">
              {formatPrice(pricePerNight)}
            </p>
            <p className="text-[11px] font-medium text-slate-400">per night</p>
          </div>
        </div>

        {/* Destination Climate & Weather Badge */}
        <div className="mt-2.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-950">
            <span>{climate.condition}</span>
            <span>{climate.temp}</span>
          </span>
          <span className="text-[11px] font-medium text-slate-400">Live Destination Climate</span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{description}</p>

        {amenities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="rounded-xl border border-white/60 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-slate-700 backdrop-blur-xs shadow-2xs"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-6">
          <Button
            variant={isAvailable ? 'primary' : 'secondary'}
            disabled={!isAvailable}
            onClick={() => onBook?.(hotel)}
            className="w-full min-h-[46px] py-3 font-bold"
          >
            {isAvailable ? 'Reserve Stay' : 'Currently Unavailable'}
          </Button>
        </div>
      </div>

      <PhotoGalleryModal
        hotel={hotel}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </article>
  );
}

export default HotelCard;
