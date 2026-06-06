import { ShieldCheck } from "lucide-react";

type TutorCardProps = {
  name: string;
  subtitle: string;
  speaking?: boolean;
};

export function TutorCard({ name, subtitle, speaking }: TutorCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-white/[0.12] w-full h-full shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_rgba(0,0,0,0.45)] group bg-[#060b14] flex flex-col justify-end p-0">

      {/* Cinematic Ambient Glow Behind Image */}
      <div className="absolute inset-0 bg-blue-500/10 blur-[50px] z-0" />

      {/* Cinematic Tutor Portrait */}
      <div
        className="absolute inset-0 bg-cover transition-transform duration-1000 group-hover:scale-[1.08] opacity-90 mix-blend-screen"
        style={{ 
          backgroundImage: "url('/images/AI%20Tutor.png')",
          backgroundPosition: 'center 28%',
          transform: 'scale(1.04)'
        }}
      />

      {/* Deep Shadow Gradients for Cinematic Feel */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.28) 45%, rgba(0,0,0,0) 100%)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#02050a]/30 to-transparent z-0 pointer-events-none" />

      {/* Top Badge */}
      <div className="absolute top-3 left-3 z-10" style={{ opacity: 0.45, filter: 'blur(0.2px)' }}>
        <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur-md border border-white/5 shadow-lg">
          <ShieldCheck size={12} className="text-[#F59E0B]" />
          <div className="flex flex-col leading-[0.85]">
            <span className="text-[7px] font-black text-[#F59E0B] tracking-widest uppercase">NextGen</span>
            <span className="text-[7px] font-bold text-white tracking-widest uppercase">Mindz</span>
          </div>
        </div>
      </div>

      {/* Subtle Blue Rim Glow on the entire card */}
      <div className="absolute inset-0 border border-blue-500/10 rounded-2xl pointer-events-none z-20" />

      {/* Bottom Overlay - Glassmorphism Strip */}
      <div className="relative z-10 m-0 mt-auto h-[64px] px-3 py-2 rounded-b-[18px] bg-black/30 backdrop-blur-xl border-t border-white/10 flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="font-semibold text-white text-[12px] tracking-wide leading-tight">{name}</h3>
          <p className="text-[9px] text-slate-400 font-medium tracking-wide mt-0.5">{subtitle}</p>
        </div>

        {/* Elegant Audio Indicator */}
        <div className="flex gap-[2px] items-end h-3 mr-1 opacity-80">
          {speaking ? (
            <>
              <div className="w-[3px] h-1.5 bg-[#10B981] rounded-sm animate-[bounce_1s_infinite]" />
              <div className="w-[3px] h-3 bg-[#10B981] rounded-sm animate-[bounce_1.2s_infinite_0.1s]" />
              <div className="w-[3px] h-2 bg-[#10B981] rounded-sm animate-[bounce_0.9s_infinite_0.2s]" />
              <div className="w-[3px] h-1 bg-[#10B981] rounded-sm animate-[bounce_1.1s_infinite_0.3s]" />
            </>
          ) : (
            <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
}
