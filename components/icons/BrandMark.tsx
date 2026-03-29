import React from 'react';

export const BrandMark: React.FC<{ size?: number; className?: string; opacity?: number }> = ({ size = 24, className = '', opacity = 1 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 160 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ opacity }}
    >
        <defs>
            <linearGradient id="brandMarkFill" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
            </linearGradient>
        </defs>
        <path
            d="M80 10 L150 110 H10 L80 10Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
            fill="url(#brandMarkFill)"
        />
        <line x1="2" y1="60" x2="45" y2="60" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="115" y1="60" x2="155" y2="38" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="115" y1="60" x2="155" y2="60" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="115" y1="60" x2="155" y2="82" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
);
