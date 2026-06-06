import { Trophy } from "lucide-react";
import type { Student } from "@/types/classroom";

type LeaderboardProps = {
  topLearners: Student[];
};

export function Leaderboard({ topLearners }: LeaderboardProps) {
  const [first, second, third] = topLearners;

  return (
    <div className="pt-3 border-t border-[var(--outline-variant)]/40">
      <p className="mb-3 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--on-surface-variant)]">
        <Trophy size={12} />
        Leaderboard
      </p>
      <div className="flex h-14 items-end justify-center gap-2">
        <div
          className="h-5 w-8 rounded-t-lg bg-[var(--surface-container-highest)] text-[8px] font-bold text-[var(--on-surface-variant)] flex items-center justify-center shadow-sm"
          title={second?.name ?? "-"}
        >
          2
        </div>
        <div className="h-10 w-10 rounded-t-lg bg-gradient-to-b from-orange-300 to-orange-500 text-[10px] font-black text-white shadow-lg flex items-center justify-center" title={first?.name ?? "-"}>
          1
        </div>
        <div
          className="h-4 w-8 rounded-t-lg bg-[var(--tertiary-fixed-dim)]/60 text-[8px] font-bold text-[var(--on-surface-variant)] flex items-center justify-center shadow-sm"
          title={third?.name ?? "-"}
        >
          3
        </div>
      </div>
    </div>
  );
}
