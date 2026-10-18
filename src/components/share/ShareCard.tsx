import React, { useRef, useState } from 'react';
import { APP_CONFIG } from '../../config/appConfig.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { Share2, Copy, Check, MessageSquare, Flame, Sparkles, Award } from 'lucide-react';
import { sounds } from '../../lib/audio.ts';

interface ShareCardProps {
  score: number;
  maxScore: number;
  streak: number;
  dateId: string;
  circleName?: string;
  verdict?: string;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  score,
  maxScore,
  streak,
  dateId,
  circleName,
  verdict,
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const percentage = Math.round((score / maxScore) * 100);
  let title = "NO CAP MASTER 🎓";
  let tierColor = "#C6F36A"; // Lime
  let matrix = "🟩🟩🟩";
  let defaultQuote = "Zero cap detected. Total intellectual dominance across campus!";

  if (percentage < 40) {
    title = "HOSTEL SURVIVOR 🛌";
    tierColor = "#78A9FF"; // Soft Blue
    matrix = score === 0 ? "⬛⬛⬛" : "🟩⬛⬛";
    defaultQuote = "Hostel survived. They haven't seen my final CGPA yet!";
  } else if (percentage < 70) {
    title = "CAMPUS SCHOLAR ⚡";
    tierColor = "#F4C56A"; // Gold
    matrix = "🟩🟩⬛";
    defaultQuote = "Solid read! Who is testing me in this department?";
  }

  const avatar = APP_CONFIG.avatars.find((a) => a.id === user?.avatarKey);
  const playerEmoji = avatar?.emoji || '⚓';
  const playerNickname = user?.nickname || 'Campus Scholar';
  const playerDept = user?.department || 'Marine Engineering';
  const playerLevel = user?.level || '300L';

  const shareText = `🎓 NO CAP Campus Showdown (${dateId})
👤 ${playerNickname} (${playerDept} · ${playerLevel})
🏆 Score: ${score}/${maxScore} (${percentage}%) — ${title}
${matrix}
🔥 Streak: ${streak} day${streak === 1 ? '' : 's'}
${circleName ? `📍 Circle: ${circleName}\n` : ''}
"${verdict || defaultQuote}"

Think you know NMU better than ${playerNickname}?
Beat my score in 2 minutes: ${window.location.origin}`;

  const handleCopyText = async () => {
    sounds.playTap();
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleWhatsAppShare = () => {
    sounds.playTap();
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${APP_CONFIG.name} Daily Showdown`,
          text: shareText,
          url: window.location.origin,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-4 space-y-4">
      {/* Visual Trophy Card (Figma/Spotify Wrapped Grade) */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl border border-[#2B333D] bg-gradient-to-b from-[#161B22] via-[#0E1217] to-[#0A0D11] p-6 shadow-2xl transition-all"
        style={{
          boxShadow: `0 20px 40px -15px ${tierColor}15, 0 0 0 1px ${tierColor}20`,
        }}
      >
        {/* Glow Spheres */}
        <div
          className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: tierColor }}
        />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#78A9FF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: Brand & Date */}
        <div className="flex items-center justify-between border-b border-[#2B333D]/60 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-wider text-[#F4F6F8]">
              NO CAP
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#727D89]">
              DAILY SHOWDOWN
            </span>
          </div>
          <span className="text-xs font-mono text-[#727D89]">{dateId}</span>
        </div>

        {/* User Identity & Avatar Crest */}
        <div className="flex items-center gap-3.5 mb-5 p-3 rounded-2xl bg-[#12161B]/80 border border-[#2B333D]/60">
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center text-2xl shadow-inner border"
            style={{
              backgroundColor: `${tierColor}15`,
              borderColor: `${tierColor}40`,
            }}
          >
            {playerEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-[#F4F6F8] truncate">
                {playerNickname}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[#191F26] text-[#A7B0BA] border border-[#2B333D]">
                {playerLevel}
              </span>
            </div>
            <div className="text-xs text-[#727D89] truncate mt-0.5">
              {playerDept} &bull; NMU
            </div>
          </div>
          {streak > 0 && (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C6F36A]/10 border border-[#C6F36A]/30 text-[#C6F36A] text-xs font-black">
                <Flame className="w-3.5 h-3.5 fill-[#C6F36A]" />
                <span>{streak}d</span>
              </div>
            </div>
          )}
        </div>

        {/* Score & Tier Callout */}
        <div className="text-center py-2 space-y-1">
          <div
            className="text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-1"
            style={{ color: tierColor }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{title}</span>
          </div>

          <div className="flex items-baseline justify-center gap-1 my-1">
            <span className="text-6xl font-black tabular-nums tracking-tighter text-[#F4F6F8]">
              {score}
            </span>
            <span className="text-2xl font-bold text-[#727D89]">/{maxScore}</span>
          </div>

          <p className="text-xs text-[#A7B0BA] font-medium">
            {score === 30
              ? 'Flawless 3/3 campus mastery'
              : score >= 20
              ? 'Passed 2 of 3 stages with distinction'
              : 'Completed daily challenge'}
          </p>
        </div>

        {/* Visual Stage Progress Matrix */}
        <div className="grid grid-cols-3 gap-2 my-4 pt-3 border-t border-[#2B333D]/60 text-center text-[11px]">
          <div className="p-2 rounded-xl bg-[#12161B] border border-[#2B333D]">
            <div className="text-[10px] text-[#727D89] uppercase font-bold">Quickfire</div>
            <div className="text-xs font-bold text-[#C6F36A] mt-0.5">
              {score >= 10 ? '✅ +10' : '❌ 0'}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-[#12161B] border border-[#2B333D]">
            <div className="text-[10px] text-[#727D89] uppercase font-bold">Real/Fake</div>
            <div className="text-xs font-bold text-[#C6F36A] mt-0.5">
              {score >= 20 ? '✅ +10' : score === 10 ? '⚪ 0' : '❌ 0'}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-[#12161B] border border-[#2B333D]">
            <div className="text-[10px] text-[#727D89] uppercase font-bold">Campus Read</div>
            <div className="text-xs font-bold text-[#C6F36A] mt-0.5">
              {score === 30 ? '✅ +10' : '⚪ +0'}
            </div>
          </div>
        </div>

        {/* Relatable Campus Quote */}
        <div className="p-3 rounded-2xl bg-[#0B0D10]/90 border border-[#2B333D] text-xs text-[#F4F6F8] italic text-center leading-relaxed">
          "{verdict || defaultQuote}"
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-[#2B333D]/40 flex items-center justify-between text-[11px] text-[#727D89]">
          <span className="font-medium text-[#A7B0BA]">
            {circleName ? `Circle: ${circleName}` : 'Nigerian Maritime University'}
          </span>
          <span className="font-semibold text-[#C6F36A]">nocap.campus</span>
        </div>
      </div>

      {/* Share Actions */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={handleWhatsAppShare}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs shadow-lg shadow-[#25D366]/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 fill-black" />
          <span>Post to WhatsApp</span>
        </button>

        <button
          onClick={handleCopyText}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#191F26] hover:bg-[#222A33] border border-[#2B333D] text-[#F4F6F8] font-bold text-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#C6F36A]" />
              <span className="text-[#C6F36A]">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-[#A7B0BA]" />
              <span>Copy Score Card</span>
            </>
          )}
        </button>
      </div>

      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={handleNativeShare}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#12161B] hover:bg-[#191F26] border border-[#2B333D] text-xs text-[#A7B0BA] font-medium transition-all cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>More Share Channels</span>
        </button>
      )}
    </div>
  );
};
