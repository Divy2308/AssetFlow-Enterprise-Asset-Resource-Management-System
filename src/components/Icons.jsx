import React from 'react';

// Common base wrapper to keep icon definitions clean
const IconWrapper = ({ size = 20, className = '', strokeWidth = 2.2, children, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block align-middle ${className}`}
    {...props}
  >
    {children}
  </svg>
);

export const BoxIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </IconWrapper>
);

export const OrgSetupIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
    <path d="M7 12v4M17 8v4" />
  </IconWrapper>
);

export const AssetsIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
    <path d="M2 10h20" />
  </IconWrapper>
);

export const TransferIcon = (props) => (
  <IconWrapper {...props}>
    <path d="m17 3 4 4-4 4" />
    <path d="M3 7h18" />
    <path d="m7 21-4-4 4-4" />
    <path d="M21 17H3" />
  </IconWrapper>
);

export const CalendarIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </IconWrapper>
);

export const WrenchIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </IconWrapper>
);

export const ShieldIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </IconWrapper>
);

export const ReportsIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </IconWrapper>
);

export const BellIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </IconWrapper>
);

export const ClipboardIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 14h6" />
    <path d="M9 10h6" />
    <path d="M9 18h6" />
  </IconWrapper>
);

export const CheckCircleIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </IconWrapper>
);

export const RefreshIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </IconWrapper>
);

export const AlertTriangleIcon = (props) => (
  <IconWrapper {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </IconWrapper>
);

export const HandIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8.5" />
    <path d="M6 14v-1.5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2V18a6 6 0 0 0 6 6h4a8 8 0 0 0 8-8v-3.5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2V12" />
  </IconWrapper>
);

export const ChevronRightIcon = ({ size = 16, className = '', strokeWidth = 2.5, ...props }) => (
  <IconWrapper size={size} strokeWidth={strokeWidth} className={className} {...props}>
    <polyline points="9 18 15 12 9 6" />
  </IconWrapper>
);

export const ChevronDownIcon = ({ size = 16, className = '', strokeWidth = 2.5, ...props }) => (
  <IconWrapper size={size} strokeWidth={strokeWidth} className={className} {...props}>
    <polyline points="6 9 12 15 18 9" />
  </IconWrapper>
);
