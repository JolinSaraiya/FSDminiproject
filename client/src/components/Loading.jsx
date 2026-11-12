function Loading({ message = 'Preparing your stays...' }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-4 py-12">
      <div className="relative h-11 w-11">
        <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-amber-500 border-r-slate-900" />
      </div>
      <p className="text-sm font-medium tracking-wide text-slate-500">{message}</p>
    </div>
  );
}

export default Loading;
