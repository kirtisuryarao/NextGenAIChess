"use client";

import { motion } from "framer-motion";
import { LeftPanel } from "@/components/classroom/LeftPanel";
import { RightPanel } from "@/components/classroom/RightPanel";
import { useFocusMode } from "@/hooks/useFocusMode";
import type { RecordedMove } from "@/types/chess";
import type { Student } from "@/types/classroom";

type MainWorkspaceProps = {
  lessonInstruction: string;
  students: Student[];
  topLearners: Student[];
  onAskDoubt: () => void;
  onSquareSelect: (square: string) => void;
  gameFen: string;
  orientation: "white" | "black";
  selectedSquare: string | null;
  legalMoveTargets: string[];
  currentTurn: "w" | "b";
  isCheck: boolean;
  isCheckmate: boolean;
  checkSquare: string | null;
  handlePieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  lastMoveHighlight: { from: string; to: string } | null;
  moveHistory: RecordedMove[];
  currentMoveIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  onNavigateMove: (moveIndex: number) => void;
  onUndo: () => void;
  onRedo: () => void;
};

export function MainWorkspace({
  lessonInstruction,
  students,
  topLearners,
  onAskDoubt,
  onSquareSelect,
  gameFen,
  orientation,
  selectedSquare,
  legalMoveTargets,
  currentTurn,
  isCheck,
  isCheckmate,
  checkSquare,
  handlePieceDrop,
  lastMoveHighlight,
  moveHistory,
  currentMoveIndex,
  canUndo,
  canRedo,
  onNavigateMove,
  onUndo,
  onRedo,
}: MainWorkspaceProps) {
  const currentStudent = students.find((s) => s.id === "aryan") || students[0] || { name: "Vihaan" };
  const focusMode = useFocusMode();

  // Grid layout changes based on focus mode
  const gridColumns = focusMode.isActive ? '1fr' : '46% 54%';
  const leftPanelVisible = !focusMode.shouldHideBlackboardPanel;
  const rightPanelVisible = !focusMode.shouldHideBoardPanel;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        gridTemplateColumns: gridColumns,
        gap: '4px',
        padding: '10px',
        boxSizing: 'border-box',
        transition: 'grid-template-columns 0.3s ease-in-out',
      }}
    >
      {/* LEFT PANEL: Blackboard/Chat - Hidden in focus mode */}
      {leftPanelVisible && (
        <motion.div
          initial={focusMode.animationPhase === "enter" ? { opacity: 1, x: 0 } : undefined}
          animate={focusMode.shouldHideBlackboardPanel ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          style={{ height: '100%', overflow: 'hidden' }}
        >
          <LeftPanel
            students={students}
            topLearners={topLearners}
            onAskDoubt={onAskDoubt}
            moveHistory={moveHistory}
            currentMoveIndex={currentMoveIndex}
            canUndo={canUndo}
            canRedo={canRedo}
            onNavigateMove={onNavigateMove}
            onUndo={onUndo}
            onRedo={onRedo}
          />
        </motion.div>
      )}

      {/* RIGHT PANEL: Board + Question/Tutor - Expands in focus mode */}
      {rightPanelVisible && (
        <motion.div
          initial={focusMode.animationPhase === "enter" ? { opacity: 1, x: 0 } : undefined}
          animate={focusMode.shouldHideBoardPanel ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          style={{
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            paddingLeft: focusMode.isActive ? '0' : '12px',
            transition: 'padding-left 0.3s ease-in-out',
          }}
        >
          <RightPanel
            studentName={currentStudent.name}
            taskText={lessonInstruction}
            selectedSquare={selectedSquare}
            legalMoveTargets={legalMoveTargets}
            orientation={orientation}
            currentTurn={currentTurn}
            isCheck={isCheck}
            isCheckmate={isCheckmate}
            checkSquare={checkSquare}
            onSquareSelect={onSquareSelect}
            gameFen={gameFen}
            handlePieceDrop={handlePieceDrop}
            lastMoveHighlight={lastMoveHighlight}
          />
        </motion.div>
      )}
    </div>
  );
}
