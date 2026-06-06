"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { BoardOverlayLayer } from "@/components/board/BoardOverlayLayer";
import { processLessonInteraction } from "@/lib/lesson-engine/validationEngine";
import { speakLessonText } from "@/lib/speech/voiceAssistant";
import { useLessonStore } from "@/store/lessonStore";

type ChessBoardProps = {
  gameFen?: string;
  orientation?: "white" | "black";
  selectedSquare?: string | null;
  legalMoveTargets?: string[];
  lastMoveHighlight?: { from: string; to: string } | null;
  checkSquare?: string | null;
  onSquareSelect?: (square: string) => void;
  onPieceDrop?: (sourceSquare: string, targetSquare: string) => boolean;
};

const FILES = ["A", "B", "C", "D", "E", "F", "G", "H"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];
const COORD = 24; // px reserved for coordinate labels
const STARTING_FEN = "8/8/8/8/8/8/8/8 w - - 0 1";

function buildSquareStyles(
  highlightedSquares: string[] = [],
  selectedSquare?: string | null,
  legalMoveTargets: string[] = [],
  lastMoveHighlight?: { from: string; to: string } | null,
  checkSquare?: string | null
) {
  const squareStyles: Record<string, CSSProperties> = {};

  for (const square of highlightedSquares) {
    squareStyles[square] = {
      ...(squareStyles[square] ?? {}),
      backgroundColor: "rgba(34,197,94,0.22)",
      boxShadow: `${squareStyles[square]?.boxShadow ?? ""}${squareStyles[square]?.boxShadow ? ", " : ""}inset 0 0 0 4px rgba(34,197,94,0.76), 0 0 18px rgba(34,197,94,0.5)`,
    };
  }

  if (selectedSquare) {
    squareStyles[selectedSquare] = {
      ...(squareStyles[selectedSquare] ?? {}),
      boxShadow: "inset 0 0 0 4px rgba(59,130,246,0.95)",
      backgroundColor: "rgba(59,130,246,0.20)",
    };
  }

  for (const square of legalMoveTargets) {
    squareStyles[square] = {
      ...(squareStyles[square] ?? {}),
      boxShadow: `${squareStyles[square]?.boxShadow ?? ""}${squareStyles[square]?.boxShadow ? ", " : ""}inset 0 0 0 3px rgba(34,197,94,0.55)`,
      backgroundImage: `${squareStyles[square]?.backgroundImage ?? ""}${squareStyles[square]?.backgroundImage ? ", " : ""}radial-gradient(circle at center, rgba(34,197,94,0.62) 0 13%, transparent 14%)`,
      backgroundColor: squareStyles[square]?.backgroundColor ?? "rgba(34,197,94,0.10)",
    };
  }

  if (lastMoveHighlight?.from) {
    for (const square of [lastMoveHighlight.from, lastMoveHighlight.to]) {
      squareStyles[square] = {
        ...(squareStyles[square] ?? {}),
        boxShadow: `${squareStyles[square]?.boxShadow ?? ""}${squareStyles[square]?.boxShadow ? ", " : ""}inset 0 0 0 3px rgba(251,191,36,0.72)`,
        backgroundColor: squareStyles[square]?.backgroundColor ?? "rgba(251,191,36,0.12)",
      };
    }
  }

  if (checkSquare) {
    squareStyles[checkSquare] = {
      ...(squareStyles[checkSquare] ?? {}),
      boxShadow: `${squareStyles[checkSquare]?.boxShadow ?? ""}${squareStyles[checkSquare]?.boxShadow ? ", " : ""}inset 0 0 0 4px rgba(239,68,68,0.95), 0 0 16px rgba(239,68,68,0.55)`,
      backgroundColor: squareStyles[checkSquare]?.backgroundColor ?? "rgba(239,68,68,0.18)",
    };
  }

  return squareStyles;
}

export function ChessBoard({
  gameFen = STARTING_FEN,
  orientation = "white",
  selectedSquare,
  legalMoveTargets = [],
  lastMoveHighlight,
  checkSquare,
  onSquareSelect,
  onPieceDrop,
}: ChessBoardProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [boardPx, setBoardPx] = useState(480);
  const lessonHighlightedSquares = useLessonStore((state) => state.highlightedSquares);
  const validationFeedback = useLessonStore((state) => state.validationFeedback);
  const activeArrows = useLessonStore((state) => state.activeArrows);
  const currentLessonStep = useLessonStore((state) => state.currentStep);
  const isWaitingForInteraction = useLessonStore((state) => state.isWaitingForInteraction);
  const nextLessonStep = useLessonStore((state) => state.nextStep);
  const addTranscriptMessage = useLessonStore((state) => state.addTranscriptMessage);
  const setWaitingForInteraction = useLessonStore((state) => state.setWaitingForInteraction);
  const setExpectedInteraction = useLessonStore((state) => state.setExpectedInteraction);
  const setLastValidationResult = useLessonStore((state) => state.setLastValidationResult);
  const setValidationFeedback = useLessonStore((state) => state.setValidationFeedback);
  const isVoiceEnabled = useLessonStore((state) => state.isVoiceEnabled);

  const mergedHighlightedSquares = Array.from(new Set(lessonHighlightedSquares));
  const lessonInteractionType = isWaitingForInteraction ? currentLessonStep?.type : null;
  const boardIsLessonLocked = Boolean(lessonInteractionType);
  const selectedSquareStyle = boardIsLessonLocked ? null : selectedSquare;
  const legalMoveTargetStyles = boardIsLessonLocked ? [] : legalMoveTargets;
  const validationActions = {
    addTranscriptMessage,
    setWaitingForInteraction,
    setExpectedInteraction,
    setLastValidationResult,
    setValidationFeedback,
    nextStep: nextLessonStep,
    speakText: (text: string) => {
      if (!isVoiceEnabled) {
        return Promise.resolve(false);
      }
      return speakLessonText(text);
    },
  };

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      // Parent is already a square (set by RightPanel).
      // Board fills the full parent minus the coordinate strip.
      const size = Math.floor(entry.contentRect.width) - COORD;
      if (size > 100) setBoardPx(size);
    });
    if (hostRef.current) ro.observe(hostRef.current);
    return () => ro.disconnect();
  }, []);

  const currentTurn = gameFen.split(" ")[1] ?? "w";

  return (
    // Fills the square parent provided by RightPanel
    <div
      ref={hostRef}
      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* boardPx × boardPx board + COORD strip for labels */}
      <div style={{ position: 'relative', width: boardPx + COORD, height: boardPx + COORD, flexShrink: 0 }}>

        {/* Board squares — no dark wrapper */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: boardPx, height: boardPx }}>
          <Chessboard
            options={{
              position: gameFen,
              boardOrientation: orientation,
              allowDragging: true,
              showNotation: false,
              darkSquareStyle: { backgroundColor: '#779556' },
              lightSquareStyle: { backgroundColor: '#ebecd0' },
              boardStyle: {
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              },
              squareStyles: buildSquareStyles(mergedHighlightedSquares, selectedSquareStyle, legalMoveTargetStyles, lastMoveHighlight, checkSquare),
              arrows: activeArrows.map((arrow) => ({
                startSquare: arrow.from,
                endSquare: arrow.to,
                color: arrow.color ?? "#22c55e",
              })),
              canDragPiece: ({ piece, sourceSquare }: { piece: { pieceType?: string }; sourceSquare?: string }) => {
                if (boardIsLessonLocked) {
                  if (lessonInteractionType !== "move-piece") {
                    return false;
                  }

                  if (currentLessonStep?.from && sourceSquare && sourceSquare !== currentLessonStep.from) {
                    return false;
                  }
                }

                const pieceType = piece?.pieceType;
                return pieceType ? pieceType.toLowerCase().startsWith(currentTurn) : false;
              },
              onPieceDrop: ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
                if (!targetSquare) {
                  return false;
                }

                if (boardIsLessonLocked) {
                  if (currentLessonStep?.type !== "move-piece") {
                    return false;
                  }

                  const attemptedMove = `${sourceSquare}${targetSquare}`;
                  const isExpectedMove = attemptedMove === currentLessonStep.expectedMove;
                  const accepted = isExpectedMove ? onPieceDrop?.(sourceSquare, targetSquare) ?? false : false;
                  processLessonInteraction({
                    step: currentLessonStep,
                    input: { type: "move-piece", from: sourceSquare, to: targetSquare, isLegalMove: isExpectedMove && accepted },
                    actions: validationActions,
                  });
                  return accepted;
                }

                const accepted = onPieceDrop?.(sourceSquare, targetSquare) ?? false;
                return accepted;
              },
              onSquareClick: ({ square }: { square: string }) => {
                if (boardIsLessonLocked) {
                  if (currentLessonStep?.type !== "click-square") {
                    return;
                  }

                  processLessonInteraction({
                    step: currentLessonStep,
                    input: { type: "click-square", square },
                    actions: validationActions,
                  });
                  return;
                }

                onSquareSelect?.(square);
              },
              animationDurationInMs: 200,
            }}
          />
          <BoardOverlayLayer
            highlightedSquares={mergedHighlightedSquares}
            feedback={validationFeedback}
            orientation={orientation}
          />
        </div>

        {/* Rank labels (8→1) — right strip */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: COORD, height: boardPx,
          display: 'flex', flexDirection: 'column',
        }}>
            {RANKS.map(r => (
            <div key={r} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: 'var(--on-background)', userSelect: 'none',
            }}>
              {r}
            </div>
          ))}
        </div>

        {/* File labels (a→h) — bottom strip */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          width: boardPx, height: COORD,
          display: 'flex', flexDirection: 'row',
        }}>
          {FILES.map(f => (
            <div key={f} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: 'var(--on-background)', userSelect: 'none',
            }}>
              {f}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
