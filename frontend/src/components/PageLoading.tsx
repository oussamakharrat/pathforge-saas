import { CARBON } from "../lib/constants";

export function PageLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-32 rounded-lg" style={{ backgroundColor: "#E6E8E6" }} />
          <div className="h-3.5 w-56 rounded-lg" style={{ backgroundColor: "#E6E8E6" }} />
        </div>
        <div className="h-9 w-28 rounded-xl" style={{ backgroundColor: "#E6E8E6" }} />
      </div>

      {/* Stats strip skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl" style={{ backgroundColor: "#E6E8E6" }} />
        ))}
      </div>

      {/* Card grid skeleton */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-52 rounded-2xl" style={{ backgroundColor: "#E6E8E6" }} />
        <div className="h-52 rounded-2xl" style={{ backgroundColor: "#E6E8E6" }} />
      </div>

      {/* Bottom row skeleton */}
      <div className="grid md:grid-cols-5 gap-4">
        <div className="md:col-span-3 h-64 rounded-2xl" style={{ backgroundColor: "#E6E8E6" }} />
        <div className="md:col-span-2 h-64 rounded-2xl" style={{ backgroundColor: "#E6E8E6" }} />
      </div>
    </div>
  );
}
