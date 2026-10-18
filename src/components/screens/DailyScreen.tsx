import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../lib/api.ts';
import { DailyAttempt, DailyQuestionPackPublic, DailyStageQuestion } from '../../types/game.ts';
import { ShareCard } from '../share/ShareCard.tsx';
import { Flame, Clock, CheckCircle2, XCircle, ArrowRight, Trophy, RefreshCw, AlertCircle } from 'lucide-react';

import { sounds } from '../../lib/audio.ts';

interface DailyScreenProps {
  onNavigateToLeaderboard?: () => void;
}

export const DailyScreen: React.FC<DailyScreenProps> = ({ onNavigateToLeaderboard }) => {
  const { user, refreshUser } = useAuth();
  const [pack, setPack] = useState<DailyQuestionPackPublic | null>(null);
  const [attempt, setAttempt] = useState<DailyAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [currentStageResult, setCurrentStageResult] = useState<{ isCorrect: boolean; points: number } | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(120);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const packRes = await api.getDailyPack();
      setPack(packRes.pack);

      const attemptRes = await api.getDailyAttempt(user.userId, packRes.pack.dateId);
      if (attemptRes.attempt) {
        setAttempt(attemptRes.attempt);
      } else {
        // Automatically start the attempt
        const startRes = await api.startDailyAttempt(user.userId, packRes.pack.dateId);
        setAttempt(startRes.attempt);
      }
    } catch (err) {
      console.error('Failed to load daily challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Countdown timer for active attempt
  useEffect(() => {
    if (!attempt || attempt.completed) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [attempt?.completed]);

  const currentStageIndex = attempt?.currentStage ?? 0;
  const currentQuestion: DailyStageQuestion | undefined = pack?.stages[currentStageIndex];

  const handleSelectOption = (idx: number) => {
    if (submitting || currentStageResult !== null) return;
    sounds.playTap();
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = async () => {
    if (!user || !pack || selectedOption === null || submitting) return;

    try {
      setSubmitting(true);
      const res = await api.submitDailyAnswer({
        userId: user.userId,
        stageIndex: currentStageIndex,
        selectedOptionIndex: selectedOption,
        dateId: pack.dateId,
      });

      const recorded = res.attempt.answers.find((a) => a.stageIndex === currentStageIndex);
      if (recorded) {
        setCurrentStageResult({
          isCorrect: recorded.isCorrect,
          points: recorded.pointsAwarded,
        });

        if (recorded.isCorrect) {
          sounds.playCorrect();
        } else {
          sounds.playWrong();
        }
      }

      setAttempt(res.attempt);
      if (res.verdict) {
        setVerdict(res.verdict);
      }

      if (res.attempt.completed && res.attempt.totalScore >= 20) {
        setTimeout(() => sounds.playFanfare(), 300);
      }

      await refreshUser();
    } catch (err: any) {
      console.error('Error submitting stage answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextStage = () => {
    sounds.playTap();
    setSelectedOption(null);
    setCurrentStageResult(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#727D89] space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#C6F36A]" />
        <p className="text-xs">Loading today’s challenge...</p>
      </div>
    );
  }

  if (!pack || !attempt) {
    return (
      <div className="p-6 rounded-2xl bg-[#12161B] border border-[#2B333D] text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-[#FF7777] mx-auto" />
        <p className="text-sm font-bold text-[#F4F6F8]">Challenge Unavailable</p>
        <p className="text-xs text-[#A7B0BA]">Could not load today’s challenge pack. Please check connection.</p>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-[#191F26] text-xs font-bold text-[#C6F36A]"
        >
          Try Again
        </button>
      </div>
    );
  }

  // --- Completed Screen ---
  if (attempt.completed) {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C6F36A]/10 border border-[#C6F36A]/30 text-xs font-bold text-[#C6F36A]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Challenge Completed</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#F4F6F8]">
            Today's Verdict
          </h1>
          <p className="text-xs text-[#A7B0BA]">
            Your score is recorded and ranked on your circles and campus leaderboards.
          </p>
        </div>

        {/* Share Card */}
        <ShareCard
          score={attempt.totalScore}
          maxScore={attempt.maxScore}
          streak={attempt.streakAfter || user?.streak || 1}
          dateId={attempt.dateId}
          verdict={verdict || (attempt.totalScore === 30 ? "No cap! Perfect score." : undefined)}
        />

        {/* Answers Review */}
        <div className="p-4 rounded-2xl bg-[#12161B] border border-[#2B333D] space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#A7B0BA]">
            Stage Breakdown
          </h2>
          {pack.stages.map((stg, i) => {
            const ans = attempt.answers.find((a) => a.stageIndex === i);
            return (
              <div
                key={stg.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#191F26] border border-[#2B333D]/60 text-xs"
              >
                <div>
                  <div className="font-semibold text-[#F4F6F8]">{stg.title}</div>
                  <div className="text-[11px] text-[#727D89] truncate max-w-[220px]">
                    {stg.prompt}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  {ans?.isCorrect ? (
                    <span className="text-[#C6F36A] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> +10
                    </span>
                  ) : (
                    <span className="text-[#FF7777] flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> +0
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Leaderboard CTA */}
        {onNavigateToLeaderboard && (
          <button
            onClick={onNavigateToLeaderboard}
            className="w-full py-3 px-4 rounded-xl bg-[#191F26] hover:bg-[#222A33] border border-[#2B333D] text-xs font-bold text-[#F4F6F8] flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4 text-[#F4C56A]" />
            <span>View Campus Rankings</span>
          </button>
        )}
      </div>
    );
  }

  // --- Active Play Screen ---
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header info */}
      <div className="flex items-center justify-between border-b border-[#1E252D] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C6F36A]">
            Stage {currentStageIndex + 1} of {pack.stages.length}
          </span>
          <span className="text-[#727D89]">&bull;</span>
          <span className="text-xs font-mono text-[#727D89]">{pack.dateId}</span>
        </div>

        {/* Timer display */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#191F26] border border-[#2B333D] text-xs font-mono font-bold text-[#A7B0BA]">
          <Clock className="w-3.5 h-3.5 text-[#C6F36A]" />
          <span>{Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Stage Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-[#191F26] overflow-hidden">
        <div
          className="h-full bg-[#C6F36A] transition-all duration-300"
          style={{ width: `${((currentStageIndex + (currentStageResult ? 1 : 0)) / pack.stages.length) * 100}%` }}
        />
      </div>

      {/* Current Question Card */}
      {currentQuestion && (
        <div className="p-6 rounded-2xl border border-[#2B333D] bg-[#12161B] space-y-5 shadow-xl">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#78A9FF] mb-1">
              {currentQuestion.title}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#F4F6F8] leading-snug">
              {currentQuestion.prompt}
            </h2>
            {currentQuestion.context && (
              <p className="text-xs text-[#A7B0BA] mt-2 italic">
                {currentQuestion.context}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let btnClass = 'bg-[#191F26] border-[#2B333D] text-[#F4F6F8] hover:border-[#78A9FF]/60';

              if (currentStageResult !== null) {
                if (isSelected) {
                  btnClass = currentStageResult.isCorrect
                    ? 'bg-[#74D7A1]/20 border-[#74D7A1] text-[#74D7A1]'
                    : 'bg-[#FF7777]/20 border-[#FF7777] text-[#FF7777]';
                } else {
                  btnClass = 'bg-[#12161B] border-[#1E252D] text-[#727D89] opacity-50';
                }
              } else if (isSelected) {
                btnClass = 'bg-[#C6F36A]/10 border-[#C6F36A] text-[#C6F36A] ring-1 ring-[#C6F36A]';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={currentStageResult !== null || submitting}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${btnClass}`}
                >
                  <span>{opt}</span>
                  {isSelected && currentStageResult === null && (
                    <span className="w-2 h-2 rounded-full bg-[#C6F36A]" />
                  )}
                  {isSelected && currentStageResult !== null && (
                    <span>
                      {currentStageResult.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-[#74D7A1]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-[#FF7777]" />
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Post-submit Feedback */}
          {currentStageResult !== null ? (
            <div className="pt-2 animate-in fade-in duration-200 space-y-3">
              <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                currentStageResult.isCorrect
                  ? 'bg-[#74D7A1]/10 border-[#74D7A1]/30 text-[#74D7A1]'
                  : 'bg-[#FF7777]/10 border-[#FF7777]/30 text-[#FF7777]'
              }`}>
                <span>{currentStageResult.isCorrect ? 'Correct! +10 Points' : 'Incorrect. +0 Points'}</span>
                <span>Stage Score: {attempt.totalScore} pts</span>
              </div>

              <button
                onClick={handleNextStage}
                className="w-full py-3.5 rounded-xl bg-[#C6F36A] hover:bg-[#B4E74F] text-black font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{attempt.completed ? 'See Final Results' : 'Continue to Next Stage'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null || submitting}
              className={`w-full py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                selectedOption !== null && !submitting
                  ? 'bg-[#C6F36A] hover:bg-[#B4E74F] text-black shadow-lg shadow-[#C6F36A]/20 active:scale-[0.98]'
                  : 'bg-[#191F26] border border-[#2B333D] text-[#727D89] cursor-not-allowed'
              }`}
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Validating Answer...</span>
                </>
              ) : (
                <span>Confirm & Lock Answer</span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
