"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Crown, MicOff, Hand, Search, MessageSquare, ListOrdered } from "lucide-react";
import { Leaderboard } from "@/components/sidebar/Leaderboard";
import { StudentInteractionTray } from "@/components/sidebar/StudentInteractionTray";
import { mockParticipants } from "@/features/mock-data";
import { processLessonInteraction } from "@/lib/lesson-engine/validationEngine";
import { speakLessonText } from "@/lib/speech/voiceAssistant";
import { useLessonStore } from "@/store/lessonStore";
import type { RecordedMove } from "@/types/chess";
import type { Student } from "@/types/classroom";
import type { TranscriptMessage, TranscriptMessageType } from "@/types/transcript";

type CollaborationPanelProps = {
  students: Student[];
  topLearners: Student[];
  moveHistory: RecordedMove[];
  currentMoveIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  onNavigateMove: (moveIndex: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  activeTab: "chat" | "participants" | "moves" | "leaderboard";
};

export function CollaborationPanel({ students, topLearners, moveHistory, currentMoveIndex, canUndo, canRedo, onNavigateMove, onUndo, onRedo, activeTab }: CollaborationPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);
  const transcriptMessages = useLessonStore((state) => state.transcriptMessages);
  const currentStep = useLessonStore((state) => state.currentStep);
  const isWaitingForInteraction = useLessonStore((state) => state.isWaitingForInteraction);
  const isLessonRunning = useLessonStore((state) => state.isLessonRunning);
  const nextStep = useLessonStore((state) => state.nextStep);
  const setWaitingForInteraction = useLessonStore((state) => state.setWaitingForInteraction);
  const setExpectedInteraction = useLessonStore((state) => state.setExpectedInteraction);
  const setLastValidationResult = useLessonStore((state) => state.setLastValidationResult);
  const setValidationFeedback = useLessonStore((state) => state.setValidationFeedback);
  const addTranscriptMessage = useLessonStore((state) => state.addTranscriptMessage);
  const isVoiceEnabled = useLessonStore((state) => state.isVoiceEnabled);

  useEffect(() => {
    if (!feedRef.current) {
      return;
    }

    feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [transcriptMessages]);

  const filtered = mockParticipants.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const notationRows = [] as Array<{ moveNumber: number; white?: string; black?: string }>;

  for (let index = 0; index < moveHistory.length; index += 2) {
    notationRows.push({
      moveNumber: Math.floor(index / 2) + 1,
      white: moveHistory[index]?.san,
      black: moveHistory[index + 1]?.san,
    });
  }

  if (activeTab === "chat") {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', gap: '8px',
        paddingTop: '2px',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', opacity: 0.95 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={14} color="#34d399" />
            <p style={{ color: 'rgba(203,213,225,0.95)', fontSize: '12px', fontWeight: 700, margin: 0 }}>AI Classroom Feed</p>
          </div>
          <div style={{ color: isWaitingForInteraction ? '#fcd34d' : 'rgba(167,243,208,0.78)', fontSize: '10px', fontWeight: 800 }}>
            {isWaitingForInteraction ? 'Listening' : 'Live'}
          </div>
        </div>
        <div style={{
          flex: 1,
          minHeight: 0,
          borderRadius: '14px',
          border: '1px solid rgba(52,211,153,0.16)',
          background: 'linear-gradient(180deg, rgba(15,23,42,0.74), rgba(2,6,23,0.56))',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }} className="scrollbar-thin">

          {/* Messages area (scrollable) */}
          <div ref={feedRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px' }}>
            {transcriptMessages.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {transcriptMessages.map((message) => (
                  <TranscriptFeedMessage key={message.id} message={message} />
                ))}
              </div>
            ) : (
              <p style={{ color: 'rgba(148,163,184,0.82)', fontSize: '12px', lineHeight: 1.5, margin: 0 }}>
                Coco is ready to begin the lesson stream. Connected learners: {students.length}
              </p>
            )}
          </div>

          {/* Input area docked to bottom and visually part of same panel */}
          <div style={{ flexShrink: 0, padding: '10px' }}>
            <StudentInteractionTray
          isWaitingForInteraction={isWaitingForInteraction}
          options={isWaitingForInteraction && (currentStep?.type === "wait-response" || currentStep?.type === "multiple-choice" || currentStep?.type === "text-response") ? currentStep.options ?? [] : []}
          onSubmit={(response) => {
            if (
              isWaitingForInteraction &&
              (currentStep?.type === "wait-response" ||
                currentStep?.type === "multiple-choice" ||
                currentStep?.type === "text-response")
            ) {
              processLessonInteraction({
                step: currentStep,
                input: { type: currentStep.type, response },
                actions: {
                  addTranscriptMessage,
                  setWaitingForInteraction,
                  setExpectedInteraction,
                  setLastValidationResult,
                  setValidationFeedback,
                  nextStep,
                  speakText: (text) => {
                    if (!isVoiceEnabled) {
                      return Promise.resolve(false);
                    }
                    return speakLessonText(text);
                  },
                },
              });
              return;
            }

            addTranscriptMessage({
              type: "student",
              sender: "Vihaan",
              message: response,
            });
            if (isLessonRunning) {
              addTranscriptMessage({
                type: "system",
                sender: "Classroom",
                message: "Coco heard your response and will weave it into the class.",
              });
            }
          }}
            embedded
            />
          </div>

        </div>
      </div>
    );
  }

  if (activeTab === "moves") {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', gap: '10px',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ListOrdered size={14} color="#34d399" />
            <p style={{ color: 'rgba(203,213,225,0.95)', fontSize: '12px', fontWeight: 600, margin: 0 }}>Notation sheet</p>
          </div>
          <div style={{ color: 'rgba(148,163,184,0.78)', fontSize: '10px', fontWeight: 700 }}>
            {currentMoveIndex === 0 ? 'Start position' : `At move ${currentMoveIndex}`}
          </div>
        </div>
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          borderRadius: '14px',
          border: '1px solid rgba(52,211,153,0.14)',
          background: 'rgba(15,23,42,0.68)',
          padding: '10px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 1fr', gap: '6px 8px', alignItems: 'start' }}>
            <div style={{ color: 'rgba(148,163,184,0.85)', fontSize: '10px', fontWeight: 700 }}>#</div>
            <div style={{ color: 'rgba(148,163,184,0.85)', fontSize: '10px', fontWeight: 700 }}>White</div>
            <div style={{ color: 'rgba(148,163,184,0.85)', fontSize: '10px', fontWeight: 700 }}>Black</div>
            {notationRows.length > 0 ? notationRows.map((row, rowIndex) => {
              const whiteMoveIndex = rowIndex * 2 + 1;
              const blackMoveIndex = whiteMoveIndex + 1;

              return (
                <div key={row.moveNumber} style={{ display: 'contents' }}>
                  <div style={{ color: 'rgba(203,213,225,0.65)', fontSize: '11px', fontWeight: 700, paddingTop: '1px' }}>
                    {row.moveNumber}.
                  </div>
                  <button
                    type="button"
                    onClick={() => row.white && onNavigateMove(whiteMoveIndex)}
                    style={{
                      textAlign: 'left',
                      border: 'none',
                      outline: 'none',
                      background: currentMoveIndex === whiteMoveIndex ? 'rgba(52,211,153,0.18)' : 'transparent',
                      color: '#f8fafc',
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      borderRadius: '8px',
                      padding: '4px 6px',
                      cursor: row.white ? 'pointer' : 'default',
                      boxShadow: currentMoveIndex === whiteMoveIndex ? 'inset 0 0 0 1px rgba(52,211,153,0.55)' : 'none',
                    }}
                  >
                    {row.white ?? ""}
                  </button>
                  <button
                    type="button"
                    onClick={() => row.black && onNavigateMove(blackMoveIndex)}
                    style={{
                      textAlign: 'left',
                      border: 'none',
                      outline: 'none',
                      background: currentMoveIndex === blackMoveIndex ? 'rgba(52,211,153,0.18)' : 'transparent',
                      color: '#f8fafc',
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      borderRadius: '8px',
                      padding: '4px 6px',
                      cursor: row.black ? 'pointer' : 'default',
                      boxShadow: currentMoveIndex === blackMoveIndex ? 'inset 0 0 0 1px rgba(52,211,153,0.55)' : 'none',
                    }}
                  >
                    {row.black ?? ""}
                  </button>
                </div>
              );
            }) : (
              <div style={{ gridColumn: '1 / -1', color: 'rgba(148,163,184,0.8)', fontSize: '12px', paddingTop: '4px' }}>
                Make a move to start the notation sheet.
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            style={{
              flex: 1,
              height: '34px',
              borderRadius: '10px',
              border: '1px solid rgba(96,165,250,0.22)',
              background: canUndo ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.08)',
              color: canUndo ? '#dbeafe' : 'rgba(148,163,184,0.6)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: canUndo ? 'pointer' : 'not-allowed',
            }}
          >
            ⬅ Back
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            style={{
              flex: 1,
              height: '34px',
              borderRadius: '10px',
              border: '1px solid rgba(96,165,250,0.22)',
              background: canRedo ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.08)',
              color: canRedo ? '#dbeafe' : 'rgba(148,163,184,0.6)',
              fontSize: '11px',
              fontWeight: 700,
              cursor: canRedo ? 'pointer' : 'not-allowed',
            }}
          >
            Forward ➡
          </button>
        </div>
      </div>
    );
  }

  if (activeTab === "leaderboard") {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <Leaderboard topLearners={topLearners} />
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header: "Participants (12)" + Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 2px 10px',
        flexShrink: 0,
      }}>
        <span style={{ color: 'rgba(203,213,225,0.9)', fontSize: '12.5px', fontWeight: 500 }}>
          Participants <span style={{ color: 'rgba(203,213,225,0.9)' }}>(12)</span>
        </span>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', opacity: 0.55 }}>
          <input
            type="text"
            placeholder="Search participants..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              height: '34px',
              width: '180px',
              background: 'transparent',
              border: 'none',
              borderBottom: 'none',
              color: 'rgba(148,163,184,0.7)',
              fontSize: '11.5px',
              outline: 'none',
              textAlign: 'right',
              paddingRight: '22px',
            }}
          />
          <Search size={13} color="rgba(148,163,184,0.5)" style={{ position: 'absolute', right: 0 }} />
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', flexShrink: 0, marginBottom: '4px' }} />

      {/* Participant Rows */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="scrollbar-thin">
        {filtered.map(p => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '54px',
              padding: '0 4px',
              borderRadius: '10px',
              cursor: 'default',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Avatar */}
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              overflow: 'hidden', flexShrink: 0, marginRight: '10px',
              background: 'rgba(51,65,85,0.8)',
              border: '1px solid rgba(71,85,105,0.4)',
            }}>
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.name}&backgroundColor=transparent`}
                alt={p.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'screen' }}
              />
            </div>

            {/* Name + Crown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.72)', whiteSpace: 'nowrap' }}>
                {p.name}
              </span>
              {p.isTop && <Crown size={13} color="#f59e0b" fill="#f59e0b" />}
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Status text */}
            <span style={{
              fontSize: '12px', fontWeight: 500,
              color: 'rgba(255,255,255,0.42)',
              marginRight: '12px',
              minWidth: '44px',
              textAlign: 'right',
            }}>
              {p.status}
            </span>

            {/* Interaction icon */}
            <div style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px' }}>
              {p.icon === 'mic2' && <MicOff size={14} color="rgba(148,163,184,0.6)" />}
              {p.icon === 'hand' && <Hand size={14} color="#f59e0b" fill="#f59e0b" />}
            </div>

            {/* Status dot */}
            <div style={{
              width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0,
              background: p.status === 'Online' ? 'rgba(16,185,129,0.5)' : 'rgba(245,158,11,0.5)',
              boxShadow: p.status === 'Online'
                ? '0 0 3px rgba(16,185,129,0.2)'
                : '0 0 3px rgba(245,158,11,0.2)',
            }} />
          </div>
        ))}
      </div>

      {/* Cinematic bottom fade overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '40px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 72%, rgba(0,0,0,0.42) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

function getMessageColor(type: TranscriptMessageType) {
  switch (type) {
    case "student":
      return {
        border: "rgba(96,165,250,0.24)",
        background: "rgba(59,130,246,0.12)",
        accent: "#93c5fd",
      };
    case "system":
      return {
        border: "rgba(148,163,184,0.18)",
        background: "rgba(148,163,184,0.08)",
        accent: "#cbd5e1",
      };
    case "success":
      return {
        border: "rgba(52,211,153,0.28)",
        background: "rgba(16,185,129,0.14)",
        accent: "#86efac",
      };
    case "error":
      return {
        border: "rgba(248,113,113,0.28)",
        background: "rgba(239,68,68,0.12)",
        accent: "#fca5a5",
      };
    case "ai":
    default:
      return {
        border: "rgba(52,211,153,0.22)",
        background: "rgba(6,78,59,0.20)",
        accent: "#6ee7b7",
      };
  }
}

function TranscriptFeedMessage({ message }: { message: TranscriptMessage }) {
  const color = getMessageColor(message.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        borderRadius: '12px',
        border: `1px solid ${color.border}`,
        background: color.background,
        padding: '9px 10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
        <span style={{ color: color.accent, fontSize: '10.5px', fontWeight: 900, textTransform: 'uppercase' }}>
          {message.sender}
        </span>
        <span style={{ color: 'rgba(148,163,184,0.62)', fontSize: '9.5px', fontWeight: 700 }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <p style={{ color: 'rgba(248,250,252,0.92)', fontSize: '12px', lineHeight: 1.45, margin: 0, fontWeight: 550 }}>
        {message.message}
      </p>
    </motion.div>
  );
}
