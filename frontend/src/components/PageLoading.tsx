export function PageLoading() {
  return (
    <div className="anim-fade space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="anim-shimmer h-5 w-32 rounded-lg" style={{ backgroundColor: '#E6E8E6' }} />
          <div className="anim-shimmer anim-delay-1 h-3.5 w-56 rounded-lg" style={{ backgroundColor: '#E6E8E6' }} />
        </div>
        <div className="anim-shimmer anim-delay-2 h-9 w-28 rounded-xl" style={{ backgroundColor: '#E6E8E6' }} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="anim-shimmer h-24 rounded-2xl"
            style={{ backgroundColor: '#E6E8E6', animationDelay: `${i * 45}ms` }}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="anim-shimmer h-52 rounded-2xl" style={{ backgroundColor: '#E6E8E6' }} />
        <div className="anim-shimmer h-52 rounded-2xl" style={{ backgroundColor: '#E6E8E6', animationDelay: '45ms' }} />
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="anim-shimmer md:col-span-3 h-64 rounded-2xl" style={{ backgroundColor: '#E6E8E6' }} />
        <div className="anim-shimmer md:col-span-2 h-64 rounded-2xl" style={{ backgroundColor: '#E6E8E6', animationDelay: '45ms' }} />
      </div>
    </div>
  );
}
