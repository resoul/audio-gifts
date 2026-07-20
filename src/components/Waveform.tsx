interface WaveformProps {
  bars?: number;
  className?: string;
  animated?: boolean;
}

export function Waveform({ bars = 48, className = "", animated = true }: WaveformProps) {
  // Deterministic pseudo-random heights for SSR consistency
  const heights = Array.from({ length: bars }, (_, i) => {
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    return 30 + Math.abs(seed - Math.floor(seed)) * 70;
  });

  return (
    <div className={`flex items-center gap-[3px] h-16 ${className}`}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-full bg-gradient-brand opacity-80"
          style={{
            height: `${h}%`,
            animation: animated ? `wave 1.4s ease-in-out ${i * 0.04}s infinite` : undefined,
            transformOrigin: "center",
          }}
        />
      ))}
    </div>
  );
}
