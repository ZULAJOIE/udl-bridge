import React from 'react';

interface BridgeMotifProps {
  className?: string;
}

/**
 * A single, restrained line-art bridge motif used as the brand element.
 * Intended for sparing use only: step progress rails, section dividers,
 * and empty states. Not a decorative/illustration system.
 */
export const BridgeMotif: React.FC<BridgeMotifProps> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 240 28"
      fill="none"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M4 22 C 60 2, 180 2, 236 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2 24H238" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M40 24V16M120 24V10M200 24V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
};
