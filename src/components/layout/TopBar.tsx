"use client";

import { Clock3, LogOut, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import { useLessonStore } from "@/store/lessonStore";

type TopBarProps = {
  timerText: string;
  lessonTitle: string;
  lessonStatusLabel: string;
  progressPercent: number;
};

export function TopBar({ timerText, lessonTitle, lessonStatusLabel, progressPercent }: TopBarProps) {
  const isVoiceEnabled = useLessonStore((state) => state.isVoiceEnabled);
  const setVoiceEnabled = useLessonStore((state) => state.setVoiceEnabled);

  return (
    <header style={{ background: 'var(--background)', color: 'var(--on-background)' }} className="h-full w-full border-b border-black/5 backdrop-blur-xl relative flex items-center">
      <div className="flex h-full w-full px-6 items-center justify-between">
        {/* Left Side: Logo & Titles */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <ShieldCheck size={22} className="text-[#3B82F6]" />
            <span className="font-bold text-[16px] text-[var(--on-background)]">NextGen Mindz</span>
          </div>
          <div className="h-7 w-px bg-white/10 shrink-0" />
          <div className="flex flex-col justify-center">
            <h1 className="text-[14px] font-bold text-[var(--on-background)] leading-tight">Beginner Chess Workshop</h1>
            <p className="text-[10px] font-medium text-slate-500">{lessonTitle}</p>
          </div>
        </div>

        {/* Right Side: Timer & Exit */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setVoiceEnabled(!isVoiceEnabled)}
            className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-50 px-4 h-8 text-[13px] font-semibold text-amber-700 transition hover:bg-amber-100"
            aria-pressed={isVoiceEnabled}
            aria-label={isVoiceEnabled ? "Disable voice assistance" : "Enable voice assistance"}
          >
            {isVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className="hidden sm:inline">Voice</span>
          </button>
          <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 h-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-600">{lessonStatusLabel}</span>
            <span className="text-[12px] font-semibold text-emerald-700">{progressPercent}%</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-50 px-4 h-8 shadow-[0_0_15px_rgba(59,130,246,0.06)]">
            <Clock3 size={16} className="text-[#3B82F6]" />
            <span className="text-[13px] font-semibold tracking-wider text-blue-700">{timerText}</span>
          </div>
          <button className="flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-4 h-8 text-[13px] font-semibold text-red-400 transition hover:bg-red-500/20 hover:text-red-300">
            <LogOut size={14} />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
}
