export default function SettingsSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-white/10 animate-pulse rounded-lg"
          style={{ width: `${100 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
