export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hexagon background */}
      <path
        d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
        fill="url(#logoGrad)"
        opacity="0.15"
      />
      <path
        d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
        stroke="url(#logoGrad)"
        strokeWidth="1.5"
        fill="none"
        filter="url(#glow)"
      />

      {/* 3 layer bars — representing the 3-layer architecture */}
      <rect x="9" y="11" width="9" height="2.5" rx="1.25" fill="url(#logoGrad)" filter="url(#glow)" />
      <rect x="9" y="15" width="12" height="2.5" rx="1.25" fill="url(#logoGrad)" opacity="0.8" />
      <rect x="9" y="19" width="7" height="2.5" rx="1.25" fill="url(#logoGrad)" opacity="0.6" />

      {/* Dot accent */}
      <circle cx="22" cy="12.25" r="1.5" fill="#3b82f6" filter="url(#glow)" />
    </svg>
  );
}