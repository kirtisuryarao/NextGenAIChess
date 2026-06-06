import { MicOff, Video, MoreHorizontal, Mic } from "lucide-react";
import type { Student } from "@/types/classroom";

type StudentCardProps = {
  student?: Student;
  name?: string;
  isMuted?: boolean;
  isSpeaking?: boolean;
};

export function StudentCard({ student, name, isMuted = true, isSpeaking = false }: StudentCardProps) {
  const displayName = student?.name ?? name ?? "Student";
  const avatarUrl = student?.avatarUrl ?? "/student.jpg";

  return (
    <div className="relative overflow-hidden rounded-[18px] border border-white/5 w-full h-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] group bg-[#060b14] flex flex-col justify-end p-0">

      {/* Cinematic Ambient Glow */}
      {isSpeaking && <div className="absolute inset-0 bg-emerald-500/10 blur-[50px] z-0" />}

      {/* Cinematic Student Portrait */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-90 mix-blend-screen"
        style={{ backgroundImage: `url('${avatarUrl}')` }}
      />

      {/* Deep Shadow Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#02050a]/90 via-[#02050a]/20 to-transparent z-0 pointer-events-none" />

      {/* Top Right Status (Muted) */}
      {isMuted && (
        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-red-500/30 backdrop-blur-md flex items-center justify-center border border-red-500/40 z-10">
          <MicOff size={10} className="text-red-300" />
        </div>
      )}

      {/* Active Speaker Border Glow */}
      {isSpeaking && (
        <div className="absolute inset-0 border border-emerald-500/40 rounded-2xl pointer-events-none z-20" />
      )}

      {/* Bottom Content - Premium Glass Strip */}
      <div className="relative z-10 m-0 mt-auto h-[64px] px-3 py-2 rounded-b-[18px] bg-black/30 backdrop-blur-xl border-t border-white/10 flex flex-col gap-1">

        {/* Floating Hover Controls (Compact) */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 absolute bottom-full left-0 mb-2">
          <button className="h-[26px] w-[26px] rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors shadow-lg">
            <Mic size={12} />
          </button>
          <button className="h-[26px] w-[26px] rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors shadow-lg">
            <Video size={12} />
          </button>
          <button className="h-[26px] w-[26px] rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors shadow-lg">
            <MoreHorizontal size={12} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold text-white tracking-wide text-[12px]">{displayName}</span>
          {/* Subtle Online Indicator */}
          <div className="flex items-center justify-center h-4 w-4 rounded-full bg-[#10B981]/10">
            <div className="h-1.5 w-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
