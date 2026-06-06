import { useState } from "react";
import { Sparkles, MessageSquare, Trophy, ListOrdered } from "lucide-react";
import { TutorCard } from "@/components/students/TutorCard";
import { StudentCard } from "@/components/students/StudentCard";
import { CollaborationPanel } from "@/components/sidebar/CollaborationPanel";
import { useLessonStore } from "@/store/lessonStore";
import type { RecordedMove } from "@/types/chess";
import type { Student } from "@/types/classroom";

type LeftPanelProps = {
  students: Student[];
  topLearners: Student[];
  onAskDoubt: () => void;
  moveHistory: RecordedMove[];
  currentMoveIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  onNavigateMove: (moveIndex: number) => void;
  onUndo: () => void;
  onRedo: () => void;
};

export function LeftPanel({ students, topLearners, onAskDoubt, moveHistory, currentMoveIndex, canUndo, canRedo, onNavigateMove, onUndo, onRedo }: LeftPanelProps) {
  const currentStudent = students.find((s) => s.id === "aryan") || students[0] || { name: "Vihaan" };
  const [activeTab, setActiveTab] = useState<"chat" | "participants" | "moves" | "leaderboard">("chat");
  const latestTranscriptMessage = useLessonStore((state) => state.transcriptMessages.at(-1));
  const currentDialogue = useLessonStore((state) => state.currentDialogue);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      background: 'var(--panel-background)',
      padding: '12px',
      borderRadius: '12px',
      color: 'var(--on-background)'
    }}>

      {/* ROW 1 — Transcript + Ask Doubt: fixed 52px */}
      <div style={{
        height: '52px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        {/* Speech Bubble — tall, multi-line, prominent */}
        <div style={{
          width: '56%',
          height: '100%',
          background: 'rgba(255,250,230,1)',
          border: '1px solid rgba(11,17,32,0.06)',
          borderRadius: '14px',
          borderBottomLeftRadius: '4px',
          padding: '8px 14px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '6px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
            <p style={{
              color: 'var(--on-background)',
              fontSize: '11.5px',
              fontWeight: 500,
              lineHeight: 1.35,
              margin: 0,
              flex: 1,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {latestTranscriptMessage?.message || currentDialogue || "Coco is ready to begin the AI classroom feed."}
            </p>
            <Sparkles size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
          </div>
        </div>

        {/* Ask Doubt Button */}
        <button
          onClick={onAskDoubt}
          style={{
            width: '140px',
            height: '38px',
            flexShrink: 0,
            borderRadius: '9999px',
            background: 'linear-gradient(180deg, #5b21b6 0%, #4c1d95 50%, #3b0764 100%)',
            border: '1px solid rgba(139,92,246,0.5)',
            boxShadow: '0 4px 20px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.12)',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            cursor: 'pointer',
            transition: 'transform 0.15s, opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Sparkles size={13} color="#c4b5fd" />
          ASK DOUBT
        </button>
      </div>

      {/* ROW 2 — Video Cards: responsive scaling, visually dominant */}
      <div style={{
        height: 'clamp(260px, 32vh, 360px)',
        flexShrink: 0,
        display: 'flex',
        gap: '8px',
      }}>
        <div style={{ flex: '0 0 56%', height: '100%' }}>
          <TutorCard name="Coco" subtitle="Your AI Chess Coach" speaking={true} />
        </div>
        <div style={{ flex: '0 0 calc(44% - 8px)', height: '100%' }}>
          <StudentCard name={currentStudent.name} isMuted={false} isSpeaking={false} />
        </div>
      </div>

      {/* ROW 3 — Tabs: fixed 36px, ultra-compact */}
      <div style={{
        flexShrink: 0,
        height: '32px',
        display: 'flex',
        gap: '8px',
        boxSizing: 'border-box',
      }}>
        {([
          { id: 'chat' as const, label: 'Chat', Icon: MessageSquare, bg: '#3B82F6' },
          { id: 'moves' as const, label: 'Moves', Icon: ListOrdered, bg: '#10B981' },
          { id: 'leaderboard' as const, label: 'Leaderboard', Icon: Trophy, bg: '#8B5CF6' },
        ]).map(({ id, label, Icon, bg }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                flex: 1,
                height: '100%',
                borderRadius: '8px',
                border: 'none',
                background: bg,
                opacity: isActive ? 1 : 0.65,
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isActive ? `0 4px 12px ${bg}50` : 'none',
                transform: isActive ? 'translateY(-1px)' : 'none',
              }}
            >
              <Icon size={14} color={id === 'leaderboard' ? '#FDE047' : '#fff'} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ROW 4: Collaboration Panel — fills remaining space */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CollaborationPanel
          students={students}
          topLearners={topLearners}
          moveHistory={moveHistory}
          currentMoveIndex={currentMoveIndex}
          canUndo={canUndo}
          canRedo={canRedo}
          onNavigateMove={onNavigateMove}
          onUndo={onUndo}
          onRedo={onRedo}
          activeTab={activeTab}
        />
      </div>

    </div>
  );
}
