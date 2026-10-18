import React from 'react';
import { GameType } from '../../types/game.ts';

interface GameCardHeroProps {
  gameType: GameType;
  accentColor: string;
}

export const GameCardHero: React.FC<GameCardHeroProps> = ({ gameType, accentColor }) => {
  switch (gameType) {
    case 'undercover':
      return (
        <div className="relative w-full h-24 overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#102213] via-[#0B150E] to-[#0A0D10] flex items-center justify-between px-5 border-b border-[#2B333D]/60">
          {/* Radar background grid */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C6F36A_1px,transparent_1px)] [background-size:12px_12px]" />
          
          {/* Subtle neon glow */}
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#C6F36A]/20 blur-2xl" />

          {/* Left Text Label */}
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#C6F36A]/10 border border-[#C6F36A]/30 text-[10px] font-mono tracking-widest text-[#C6F36A] font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6F36A] animate-ping" />
              <span>IMPOSTOR PROTOCOL</span>
            </div>
            <p className="text-[11px] text-[#A7B0BA] font-medium">1 Secret Word &bull; 1 Fake</p>
          </div>

          {/* Right SVG Graphic */}
          <div className="relative z-10 w-16 h-16 flex items-center justify-center">
            {/* Crosshair & Radar Scope */}
            <svg viewBox="0 0 64 64" className="w-14 h-14 text-[#C6F36A]" fill="none" stroke="currentColor">
              <circle cx="32" cy="32" r="28" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
              <circle cx="32" cy="32" r="18" strokeWidth="1.5" opacity="0.6" />
              <line x1="32" y1="4" x2="32" y2="60" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
              <line x1="4" y1="32" x2="60" y2="32" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
              {/* Sleek Undercover Agent Silhouette */}
              <circle cx="32" cy="24" r="8" fill="#C6F36A" fillOpacity="0.2" strokeWidth="2" />
              <path d="M18 48c0-7.732 6.268-14 14-14s14 6.268 14 14" strokeWidth="2.5" strokeLinecap="round" />
              {/* Spy Sunglasses */}
              <rect x="25" y="22" width="6" height="4" rx="1" fill="#C6F36A" />
              <rect x="33" y="22" width="6" height="4" rx="1" fill="#C6F36A" />
              <line x1="31" y1="24" x2="33" y2="24" strokeWidth="2" stroke="#0B0D10" />
            </svg>
          </div>
        </div>
      );

    case 'who_said_that':
      return (
        <div className="relative w-full h-24 overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#0D1C30] via-[#091321] to-[#0A0D10] flex items-center justify-between px-5 border-b border-[#2B333D]/60">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#78A9FF_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#78A9FF]/20 blur-2xl" />

          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#78A9FF]/10 border border-[#78A9FF]/30 text-[10px] font-mono tracking-widest text-[#78A9FF] font-bold uppercase">
              <span>CONFIDENTIAL ROAST</span>
            </div>
            <p className="text-[11px] text-[#A7B0BA] font-medium">Anonymous Confessions &bull; Guess Author</p>
          </div>

          <div className="relative z-10 w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-14 h-14 text-[#78A9FF]" fill="none" stroke="currentColor">
              {/* Sealed Letter with Mystery Question */}
              <rect x="10" y="16" width="44" height="32" rx="4" strokeWidth="2" fill="#78A9FF" fillOpacity="0.1" />
              <path d="M10 20l22 16 22-16" strokeWidth="2" strokeLinecap="round" />
              {/* Glowing Question Mark Stamp */}
              <circle cx="32" cy="36" r="9" fill="#12161B" stroke="#78A9FF" strokeWidth="2" />
              <text x="32" y="41" textAnchor="middle" fill="#78A9FF" fontSize="13" fontWeight="900" fontFamily="sans-serif">?</text>
            </svg>
          </div>
        </div>
      );

    case 'most_likely_to':
      return (
        <div className="relative w-full h-24 overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#2D1805] via-[#1B1006] to-[#0A0D10] flex items-center justify-between px-5 border-b border-[#2B333D]/60">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#F4C56A_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#F4C56A]/20 blur-2xl" />

          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F4C56A]/10 border border-[#F4C56A]/30 text-[10px] font-mono tracking-widest text-[#F4C56A] font-bold uppercase">
              <span>HOT SEAT CONSENSUS</span>
            </div>
            <p className="text-[11px] text-[#A7B0BA] font-medium">Expose The Most Chaotic Friend</p>
          </div>

          <div className="relative z-10 w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-14 h-14 text-[#F4C56A]" fill="none" stroke="currentColor">
              {/* Fiery Megaphone & Spotlight */}
              <path d="M14 26l20-8v28l-20-8H8V26h6z" strokeWidth="2" strokeLinejoin="round" fill="#F4C56A" fillOpacity="0.15" />
              <path d="M38 22c4 2 7 6 7 10s-3 8-7 10" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M44 16c7 4 12 10 12 16s-5 12-12 16" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
              {/* Flame spark */}
              <path d="M22 46l2 8h4l-3-8" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      );

    case 'campus_quiz':
      return (
        <div className="relative w-full h-24 overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#092218] via-[#071711] to-[#0A0D10] flex items-center justify-between px-5 border-b border-[#2B333D]/60">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#74D7A1_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#74D7A1]/20 blur-2xl" />

          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#74D7A1]/10 border border-[#74D7A1]/30 text-[10px] font-mono tracking-widest text-[#74D7A1] font-bold uppercase">
              <span>SPEED TRIVIA BOWL</span>
            </div>
            <p className="text-[11px] text-[#A7B0BA] font-medium">NMU Lore &bull; Grading &bull; General IQ</p>
          </div>

          <div className="relative z-10 w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-14 h-14 text-[#74D7A1]" fill="none" stroke="currentColor">
              {/* Academic Cap + Compass Rose */}
              <polygon points="32 14, 54 24, 32 34, 10 24" strokeWidth="2" fill="#74D7A1" fillOpacity="0.2" />
              <path d="M18 28v12c0 6 6 10 14 10s14-4 14-10V28" strokeWidth="2" strokeLinecap="round" />
              <line x1="50" y1="26" x2="50" y2="44" strokeWidth="2" strokeLinecap="round" />
              {/* Lightning Speed bolt */}
              <polygon points="32 36, 36 44, 31 44, 33 52, 27 44, 31 44" fill="#74D7A1" stroke="none" />
            </svg>
          </div>
        </div>
      );

    case 'real_or_fake_course':
      return (
        <div className="relative w-full h-24 overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#1C102C] via-[#120B1D] to-[#0A0D10] flex items-center justify-between px-5 border-b border-[#2B333D]/60">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C084FC_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#C084FC]/20 blur-2xl" />

          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#C084FC]/10 border border-[#C084FC]/30 text-[10px] font-mono tracking-widest text-[#C084FC] font-bold uppercase">
              <span>ACCREDITED VS BANTER</span>
            </div>
            <p className="text-[11px] text-[#A7B0BA] font-medium">2 Seconds to Call the Bluff</p>
          </div>

          <div className="relative z-10 w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-14 h-14 text-[#C084FC]" fill="none" stroke="currentColor">
              {/* Official Seal / Rubber Stamp */}
              <circle cx="32" cy="32" r="22" strokeWidth="2" strokeDasharray="3 2" />
              <circle cx="32" cy="32" r="16" strokeWidth="1.5" fill="#C084FC" fillOpacity="0.15" />
              <path d="M24 32l6 6 12-12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      );

    case 'would_you_rather':
    default:
      return (
        <div className="relative w-full h-24 overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#2D0F16] via-[#1A0A0E] to-[#0A0D10] flex items-center justify-between px-5 border-b border-[#2B333D]/60">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#FF7777_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#FF7777]/20 blur-2xl" />

          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FF7777]/10 border border-[#FF7777]/30 text-[10px] font-mono tracking-widest text-[#FF7777] font-bold uppercase">
              <span>UNFORGIVING DILEMMAS</span>
            </div>
            <p className="text-[11px] text-[#A7B0BA] font-medium">Would You Rather &bull; Group Vote</p>
          </div>

          <div className="relative z-10 w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-14 h-14 text-[#FF7777]" fill="none" stroke="currentColor">
              {/* Diverging Paths / Opposing Swords */}
              <path d="M18 48L32 16l14 32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 36h14" strokeWidth="2" strokeLinecap="round" />
              <path d="M38 36h14" strokeWidth="2" strokeLinecap="round" />
              <circle cx="32" cy="16" r="3" fill="#FF7777" />
            </svg>
          </div>
        </div>
      );
  }
};
