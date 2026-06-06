"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { ChessBoard } from "@/components/board/ChessBoard";
import { LessonRenderer } from "@/components/lesson/LessonRenderer";
import { MCQDropdown } from "@/components/controls/MCQDropdown";
import { useFocusMode } from "@/hooks/useFocusMode";
import { useFocusModeInteraction } from "@/hooks/useFocusModeInteraction";
import { useLessonStore } from "@/store/lessonStore";

type RightPanelProps = {
  studentName: string;
  taskText: string;
  selectedSquare: string | null;
  legalMoveTargets: string[];
  orientation: "white" | "black";
  currentTurn: "w" | "b";
  isCheck: boolean;
  isCheckmate: boolean;
  checkSquare: string | null;
  onSquareSelect: (square: string) => void;
  gameFen: string;
  handlePieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  lastMoveHighlight: { from: string; to: string } | null;
};

const BANNER_H = 52;  // fixed banner height px
const GAP = 6;         // gap between banner and board

export function RightPanel({ studentName, taskText, selectedSquare, legalMoveTargets, orientation, currentTurn, isCheck, isCheckmate, checkSquare, onSquareSelect, gameFen, handlePieceDrop, lastMoveHighlight }: RightPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sharedWidth, setSharedWidth] = useState<number | null>(null);
  
  const focusMode = useFocusMode();
  const currentStep = useLessonStore((state) => state.currentStep);
  const { handleMCQAnswer } = useFocusModeInteraction();

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // Available height for the board after banner + gap
      const boardAreaHeight = height - BANNER_H - GAP;
      // Board is square — pick the smaller of width and available height
      const size = Math.min(width, boardAreaHeight);
      setSharedWidth(Math.floor(size));
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleMCQSelect = (selectedOption: string) => {
    // Use the proper validation flow from the lesson engine
    handleMCQAnswer(selectedOption);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: `${GAP}px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Focus Mode MCQ Dropdown - Shown when focusMode is active */}
      {focusMode.isActive && currentStep?.type === "multiple-choice" && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{
            width: '100%',
            maxWidth: sharedWidth ? `${sharedWidth}px` : '100%',
            flexShrink: 0,
          }}
        >
          <MCQDropdown
            isOpen={focusMode.isMCQDropdownOpen}
            options={currentStep.options ?? []}
            onSelect={handleMCQSelect}
            isShowingFeedback={focusMode.isShowingFeedback}
            feedbackType={focusMode.feedbackType}
            feedbackMessage={focusMode.feedbackMessage}
          />
        </motion.div>
      )}

      {/* ── Instruction Banner ── */}
      {/* Width matches the board exactly once sharedWidth is known; 100% until then */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{
          opacity: focusMode.shouldHideBoardPanel ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
        style={{
          flexShrink: 0,
          width: sharedWidth ? sharedWidth - 20 : '100%',
          height: `${BANNER_H}px`,
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '0 20px',
          boxSizing: 'border-box',
          background: 'rgba(14, 8, 34, 0.9)',
          border: '1px solid rgba(88, 28, 135, 0.5)',
          borderRadius: '16px',
          backdropFilter: 'blur(12px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Left accent */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
          background: '#8b5cf6', boxShadow: '0 0 8px rgba(139,92,246,0.8)',
        }} />

        {/* Icon */}
        <div style={{
          width: '32px', height: '32px', flexShrink: 0, borderRadius: '50%',
          background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Target size={16} color="#c4b5fd" strokeWidth={1.8} />
        </div>

        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden', flex: 1 }}>
          <span style={{ color: '#a78bfa', fontSize: '12px', fontWeight: 700, lineHeight: 1 }}>
            {studentName}
          </span>
          <span style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 600, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {taskText}
          </span>
          <span style={{ color: isCheckmate ? '#fca5a5' : isCheck ? '#f87171' : 'rgba(196,181,253,0.82)', fontSize: '10px', fontWeight: 700, lineHeight: 1 }}>
            {isCheckmate ? 'Checkmate' : isCheck ? 'Check' : `${currentTurn === 'w' ? 'White' : 'Black'} to move`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <div style={{
            minWidth: '44px',
            height: '28px',
            borderRadius: '9999px',
            padding: '0 10px',
            background: isCheckmate ? 'rgba(239,68,68,0.25)' : isCheck ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.14)',
            border: `1px solid ${isCheckmate ? 'rgba(239,68,68,0.55)' : isCheck ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.28)'}`,
            color: isCheckmate ? '#fecaca' : isCheck ? '#fca5a5' : '#bbf7d0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            boxShadow: isCheckmate ? '0 0 18px rgba(239,68,68,0.35)' : isCheck ? '0 0 18px rgba(239,68,68,0.20)' : '0 0 18px rgba(34,197,94,0.12)',
          }}>
            {checkSquare ? checkSquare.toUpperCase() : 'Live'}
          </div>
        </div>

        {/* Star dots */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%',
          backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.5) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 100%)',
          pointerEvents: 'none',
        }} />
      </motion.div>

      {/* ── Chessboard ── */}
      {/* Same sharedWidth; height = sharedWidth (square) */}
      <motion.div
        style={{
          width: sharedWidth ?? '100%',
          height: sharedWidth ?? undefined,
          flexShrink: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
        animate={{
          opacity: focusMode.shouldHideBoardPanel ? 0.3 : 1,
          scale: focusMode.shouldHideBoardPanel ? 0.95 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <ChessBoard 
          gameFen={gameFen}
          selectedSquare={selectedSquare}
          legalMoveTargets={legalMoveTargets}
          orientation={orientation}
          lastMoveHighlight={lastMoveHighlight}
          checkSquare={checkSquare}
          onSquareSelect={onSquareSelect} 
          onPieceDrop={handlePieceDrop}
        />
        <LessonRenderer />
      </motion.div>
    </div>
  );
}
