// Minimal line-icon set (currentColor strokes, 24x24, square caps and miter
// joins to match the sharp-edged UI).

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "square",
  strokeLinejoin: "miter",
};

export const WarningIcon = ({ className = "w-6 h-6" }) => (
  <svg {...base} className={className}>
    <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
    <path d="M12 10v3.5" />
    <rect x="11.25" y="16.25" width="1.5" height="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const ErrorIcon = ({ className = "w-6 h-6" }) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="3.5" width="17" height="17" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </svg>
);

export const OfflineIcon = ({ className = "w-6 h-6" }) => (
  <svg {...base} className={className}>
    <path d="M3 3l18 18" />
    <path d="M8.5 8.5a7 7 0 0 1 9.8 1.2" />
    <path d="M5.7 5.7A11 11 0 0 1 20.8 8" />
    <path d="M11 15.5a3 3 0 0 1 3.2.7" />
    <rect x="11.25" y="18.25" width="1.5" height="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const InfoIcon = ({ className = "w-6 h-6" }) => (
  <svg {...base} className={className}>
    <rect x="3.5" y="3.5" width="17" height="17" />
    <path d="M12 11v6" />
    <rect x="11.25" y="7.25" width="1.5" height="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const LatticeIcon = ({ className = "w-6 h-6" }) => (
  <svg {...base} className={className}>
    <rect x="10.5" y="2.5" width="3" height="3" />
    <rect x="3.5" y="10.5" width="3" height="3" />
    <rect x="17.5" y="10.5" width="3" height="3" />
    <rect x="10.5" y="18.5" width="3" height="3" />
    <path d="M10.5 5.5 6.5 10.5M13.5 5.5l4 5M6.5 13.5l4 5M17.5 13.5l-4 5" />
  </svg>
);

export const ExternalLinkIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg {...base} strokeWidth={2} className={className}>
    <path d="M7 17 17 7" />
    <path d="M9 7h8v8" />
  </svg>
);
