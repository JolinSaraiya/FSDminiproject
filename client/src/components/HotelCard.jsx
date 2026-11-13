import { useState } from 'react';
import { getFallbackHotelImage, resolveHotelImage } from '../utils/hotelImages';
import Button from './Button';

function HotelCard({ hotel, onBook, isRecentlyBooked = false }) {
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

  const primaryImage = resolveHotelImage(hotel);
  const fallbackImage = getFallbackHotelImage(hotel);
  const [failedUrl, setFailedUrl] = useState('');

  const activeImage = failedUrl === primaryImage ? fallbackImage : primaryImage;
  const isAvailable = availableRooms > 0;

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-amber-300/80 hover:shadow-xl ${
        isRecentlyBooked
          ? 'border-amber-400 ring-4 ring-amber-400/40 ring-offset-2'
          : 'border-stone-200/90'
      }`}
    >
      {/* Property Photo Banner */}
      <div className={`relative h-52 overflow-hidden bg-linear-to-br ${gradient} p-5 text-white`}>
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

          <div className="flex items-center gap-1.5 text-sm font-semibold text-white drop-shadow-xs">
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
            <p className="text-xl font-extrabold tracking-tight text-slate-900">
              ₹{Number(pricePerNight).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] font-medium text-slate-400">per night</p>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{description}</p>

        {amenities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
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
            className="w-full py-3"
          >
            {isAvailable ? 'Reserve Stay' : 'Currently Unavailable'}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default HotelCard;
