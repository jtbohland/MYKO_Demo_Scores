type Props = {
  size?: number;
  className?: string;
};

/**
 * Agent Analytics logo — sparkle + bar chart icon.
 * Designed as an emoji-style icon with vibrant colors.
 */
export default function AgentAnalyticsLogo({ size = 40, className = "" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      fill="none"
    >
      {/* 4-pointed sparkle star — top left */}
      <path
        d="M20 4 L23 16 L34 20 L23 24 L20 36 L17 24 L6 20 L17 16 Z"
        fill="url(#sparkleGrad)"
      />
      {/* Small sparkle accent */}
      <path
        d="M8 6 L9.5 10 L13.5 11.5 L9.5 13 L8 17 L6.5 13 L2.5 11.5 L6.5 10 Z"
        fill="url(#sparkleGrad)"
        opacity="0.6"
      />

      {/* Bar chart — 3 bars, right side */}
      {/* Tallest bar */}
      <rect x="34" y="14" width="8" height="44" rx="3" fill="url(#barGrad1)" />
      {/* Medium bar */}
      <rect x="45" y="26" width="8" height="32" rx="3" fill="url(#barGrad2)" />
      {/* Short bar */}
      <rect x="56" y="38" width="8" height="20" rx="3" fill="url(#barGrad3)" opacity="0.85" />

      {/* Gradients */}
      <defs>
        <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="barGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="barGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="barGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  );
}
