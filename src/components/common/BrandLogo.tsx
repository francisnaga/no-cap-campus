import React, { useState } from 'react';

interface BrandLogoProps {
  customLogoUrl?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  customLogoUrl = '/logo.png',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      {/* If custom logo image exists, render it; otherwise render crisp vector mark */}
      {!imageError && customLogoUrl ? (
        <img
          src={customLogoUrl}
          alt="NO CAP"
          onError={() => setImageError(true)}
          className="h-8 w-auto max-w-[120px] object-contain rounded-md"
        />
      ) : (
        <div className="flex items-center gap-2">
          {/* Sleek minimal emblem */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C6F36A] to-[#88CC14] flex items-center justify-center text-black shadow-md shadow-[#C6F36A]/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-black"
            >
              {/* Graduation Cap / Crown geometric contour */}
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="font-black text-lg tracking-wider text-[#F4F6F8] whitespace-nowrap">
            NO CAP
          </span>
        </div>
      )}
    </div>
  );
};
