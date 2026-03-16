/**
 * SourceMind Logo — the blue network/node icon.
 * Shared across Navbar, TabBar, and anywhere else the brand mark appears.
 */
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="sourcemind-lg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#2563EB" />
        </linearGradient>
      </defs>
      {/* central node */}
      <circle cx="18" cy="18" r="3" fill="url(#sourcemind-lg)" />
      {/* ring nodes */}
      {[0, 72, 144, 216, 288].map((a) => {
        const r = 11;
        const x = 18 + r * Math.cos((a * Math.PI) / 180);
        const y = 18 + r * Math.sin((a * Math.PI) / 180);
        return (
          <g key={a}>
            <line x1="18" y1="18" x2={x} y2={y} stroke="url(#sourcemind-lg)" strokeWidth="0.8" opacity="0.35" />
            <circle cx={x} cy={y} r="2" fill="url(#sourcemind-lg)" opacity="0.8" />
          </g>
        );
      })}
    </svg>
  );
}
