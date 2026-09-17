'use client';

import React, { useState, useEffect } from 'react';
import { getDriverMedia, DriverMedia } from '@/lib/f1/wikimedia';
import DriverIdentityCard from './DriverIdentityCard';

interface DriverAvatarProps {
  driverId: string;
  driverName: string;
  permanentNumber?: string | number;
  teamColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showCredit?: boolean;
  mode?: 'generative' | 'photo';
}

export default function DriverAvatar({
  driverId,
  driverName,
  permanentNumber,
  teamColor = '#E10600',
  size = 'md',
  className = '',
  showCredit = false,
  mode = 'photo',
}: DriverAvatarProps) {
  const [media, setMedia] = useState<DriverMedia | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setHasError(false);
    setIsLoading(true);

    getDriverMedia(driverId, driverName).then((m) => {
      if (isMounted) {
        setMedia(m);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [driverId, driverName]);

  // Derive driver initials (e.g. "Max Verstappen" -> "MV")
  const initials = driverName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'F1';

  // Size mapping
  const sizeStyles = {
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 sm:w-24 sm:h-24 text-xl',
  };

  if (mode === 'generative') {
    const cardSize = size === 'sm' ? 'sm' : size === 'xl' ? 'hero' : 'card';
    return (
      <DriverIdentityCard
        driverId={driverId}
        size={cardSize}
        className={className}
      />
    );
  }

  const hasImage = Boolean(media?.thumbUrl) && !hasError;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className={`relative rounded border overflow-hidden shrink-0 flex items-center justify-center select-none ${sizeStyles[size]} transition-all`}
        style={{
          borderColor: `${teamColor}40`,
          backgroundColor: hasImage ? 'var(--bg-primary)' : `${teamColor}15`,
        }}
        title={`${driverName} (#${permanentNumber || '—'})`}
      >
        {hasImage ? (
          <img
            src={media?.thumbUrl}
            alt={`${driverName} portrait`}
            className="w-full h-full object-cover object-top transition-opacity duration-300"
            onError={() => setHasError(true)}
            loading="lazy"
          />
        ) : (
          /* Graceful Minimal Technical Fallback Avatar */
          <div className="w-full h-full flex flex-col items-center justify-center p-1 relative">
            <span
              className="font-hud font-black tracking-tighter leading-none"
              style={{ color: teamColor }}
            >
              {initials}
            </span>
            {permanentNumber && (
              <span className="text-[9px] font-mono-num font-bold text-[var(--text-muted)] tracking-tighter mt-0.5">
                #{permanentNumber}
              </span>
            )}
          </div>
        )}

        {/* Livery Indicator Bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ backgroundColor: teamColor }}
        />
      </div>

      {/* Attribution Credit Line (for compliance with CC-BY/CC-BY-SA licenses) */}
      {showCredit && media && (
        <div className="mt-1.5 text-[9px] text-[var(--text-muted)] font-mono-num text-center max-w-[200px] leading-tight">
          <span>Photo: </span>
          <a
            href={media.attribution.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] underline transition-colors"
          >
            {media.attribution.photographer}
          </a>{' '}
          (
          <a
            href={media.attribution.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] underline transition-colors"
          >
            {media.attribution.license}
          </a>
          )
        </div>
      )}
    </div>
  );
}
