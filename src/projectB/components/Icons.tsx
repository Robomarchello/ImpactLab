
import React from 'react';

const iconProps = {
  className: "w-6 h-6",
  strokeWidth: 2,
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as "round",
  strokeLinejoin: "round" as "round",
};

export const FireIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 12a5 5 0 0 0 5-5c0-2.76-2.24-5-5-5s-5 2.24-5 5a5 5 0 0 0 5 5z" />
    <path d="M12 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
    <path d="M14.12 7.88a3 3 0 0 0-4.24 4.24" />
  </svg>
);

export const GlobeIcon = () => (
  <svg {...iconProps} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);


export const ResetIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
)

export const TsunamiIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M2.26 10.43a2.5 2.5 0 0 0 3.28 2.05 4.5 4.5 0 0 1 5.92 0 4.5 4.5 0 0 0 5.92 0 2.5 2.5 0 0 1 3.28 2.05" />
        <path d="M2.26 14.43a2.5 2.5 0 0 0 3.28 2.05 4.5 4.5 0 0 1 5.92 0 4.5 4.5 0 0 0 5.92 0 2.5 2.5 0 0 1 3.28 2.05" />
        <path d="M2.26 6.43a2.5 2.5 0 0 0 3.28 2.05 4.5 4.5 0 0 1 5.92 0 4.5 4.5 0 0 0 5.92 0 2.5 2.5 0 0 1 3.28 2.05" />
    </svg>
)

export const CraterIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" />
        <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path d="M12 12a6 6 0 0 0-6 6" />
    </svg>
)

export const ZapIcon = () => (
    <svg {...iconProps} viewBox="0 0 24 24">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
)
