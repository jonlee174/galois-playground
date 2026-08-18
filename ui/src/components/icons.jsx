// Minimal line-icon set (currentColor strokes, 24x24) used in place of emoji
// throughout the app, so icon color/weight stays consistent with the theme.

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const WarningIcon = ({ className = "w-6 h-6" }) => (
  <svg {...base} className={className}>
    <path d="M12 3.5 21.5 20h-19L12 3.5Z" />
    <path d="M12 9.5v4.25" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

export const ErrorIcon = ({ className = "w-6 h-6" }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5 14.5 14.5" />
    <path d="M14.5 9.5 9.5 14.5" />
  </svg>
);

export const OfflineIcon = ({ className = "w-6 h-6" }) => (
  <svg {...base} className={className}>
    <path d="M3 3l18 18" />
    <path d="M8.5 8.5a7 7 0 0 1 9.8 1.2" />
    <path d="M5.7 5.7A11 11 0 0 1 20.8 8" />
    <path d="M11 15.5a3 3 0 0 1 3.2.7" />
    <circle cx="12" cy="19" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

export const InfoIcon = ({ className = "w-6 h-6" }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5" />
    <circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

export const CheckCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5 11 15l4.5-6" />
  </svg>
);

export const XCircleThinIcon = ({ className = "w-6 h-6" }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 14.5 14.5 9.5" />
  </svg>
);

export const LatticeIcon = ({ className = "w-6 h-6" }) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="4" r="1.4" />
    <circle cx="5" cy="12" r="1.4" />
    <circle cx="19" cy="12" r="1.4" />
    <circle cx="12" cy="20" r="1.4" />
    <path d="M12 5.4 5 10.8M12 5.4l7 5.4M5 13.2l7 6.4M19 13.2l-7 6.4" />
  </svg>
);

export const ExternalLinkIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg {...base} strokeWidth={2} className={className}>
    <path d="M7 17 17 7" />
    <path d="M9 7h8v8" />
  </svg>
);
