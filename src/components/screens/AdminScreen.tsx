import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api.ts';
import { APP_CONFIG } from '../../config/appConfig.ts';
import { Shield, Sparkles, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

export const AdminScreen: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState<string | null>(null);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminOverview();
      setOverview(res);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const handleGenerateDaily = async () => {
    try {
      setGenerating(true);
      setGenerateMsg(null);
      const res = await api.generateDailyCandidate();
      if (res.success) {
        setGenerateMsg('Successfully generated new AI pack for today!');
      }
    } catch (err: any) {
      setGenerateMsg(err.message || 'Generation error');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-[#727D89]">
        <RefreshCw className="w-5 h-5 animate-spin text-[#C6F36A]" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="pb-3 border-b border-[#1E252D]">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#F4F6F8]">
          Developer Diagnostics & Admin
        </h1>
        <p className="text-xs text-[#A7B0BA] mt-0.5">
          Campus content moderation, challenge pack management, and system state.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-[#12161B] border border-[#2B333D] text-center">
          <div className="text-2xl font-black text-[#F4F6F8]">{overview?.totalUsers || 0}</div>
          <div className="text-[11px] text-[#727D89] uppercase font-bold mt-1">Total Users</div>
        </div>
        <div className="p-4 rounded-xl bg-[#12161B] border border-[#2B333D] text-center">
          <div className="text-2xl font-black text-[#C6F36A]">{overview?.totalCircles || 0}</div>
          <div className="text-[11px] text-[#727D89] uppercase font-bold mt-1">Active Circles</div>
        </div>
        <div className="p-4 rounded-xl bg-[#12161B] border border-[#2B333D] text-center">
          <div className="text-2xl font-black text-[#FF7777]">{overview?.reports?.length || 0}</div>
          <div className="text-[11px] text-[#727D89] uppercase font-bold mt-1">Reports</div>
        </div>
      </div>

      {/* Daily Content Management */}
      <div className="p-5 rounded-2xl border border-[#2B333D] bg-[#12161B] space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F4C56A]" />
          <h2 className="text-sm font-bold text-[#F4F6F8]">AI Daily Challenge Operations</h2>
        </div>
        <p className="text-xs text-[#A7B0BA]">
          Server Timezone: <strong>{APP_CONFIG.dailyChallenge.timezone}</strong> &bull; Current Day:{' '}
          <strong>{overview?.todayDateId}</strong>
        </p>

        <button
          onClick={handleGenerateDaily}
          disabled={generating}
          className="w-full py-3 rounded-xl bg-[#191F26] hover:bg-[#222A33] border border-[#2B333D] text-xs font-bold text-[#F4C56A] flex items-center justify-center gap-2 transition-all"
        >
          {generating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{generating ? 'Querying Gemini API...' : 'Generate New Daily Pack with Gemini'}</span>
        </button>

        {generateMsg && (
          <p className="text-xs text-[#74D7A1] font-semibold text-center">{generateMsg}</p>
        )}
      </div>

      {/* Safety & Moderation Queue */}
      <div className="p-5 rounded-2xl border border-[#2B333D] bg-[#12161B] space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#FF7777]" />
          <h2 className="text-sm font-bold text-[#F4F6F8]">Moderation Queue</h2>
        </div>

        {overview?.reports?.length === 0 ? (
          <p className="text-xs text-[#727D89] italic">No active reports. The campus is peaceful.</p>
        ) : (
          <div className="space-y-2">
            {overview?.reports?.map((rep: any) => (
              <div key={rep.id} className="p-3 rounded-xl bg-[#191F26] border border-[#2B333D] text-xs space-y-1">
                <div className="flex items-center justify-between text-[#FF7777] font-bold">
                  <span>{rep.reason}</span>
                  <span className="text-[10px] text-[#727D89]">{new Date(rep.createdAt).toLocaleDateString()}</span>
                </div>
                {rep.details && <p className="text-[#A7B0BA]">"{rep.details}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
