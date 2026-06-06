"use client";

import { useClassroomSession } from "@/hooks/useClassroomSession";
import { MainWorkspace } from "@/components/classroom/MainWorkspace";
import { TopBar } from "@/components/layout/TopBar";

export function ClassroomLayout() {
  const session = useClassroomSession();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--background)',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: 'var(--on-background)',
    }}>
      {/* Navbar: exactly 6vh */}
      <div style={{ height: '6vh', flexShrink: 0 }}>
        <TopBar
          timerText={session.timerText}
          lessonTitle={session.lessonTitle}
          lessonStatusLabel={session.tutorStatusLabel}
          progressPercent={session.progressPercent}
        />
      </div>

      {/* Workspace: flexible, fills remaining space */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <MainWorkspace
          lessonInstruction={session.lessonInstruction}
          students={session.students}
          topLearners={session.topLearners}
          onAskDoubt={session.handleAskDoubt}
          onSquareSelect={session.handleSquareSelect}
          gameFen={session.gameFen}
          orientation={session.orientation}
          selectedSquare={session.selectedSquare}
          legalMoveTargets={session.legalMoveTargets}
          currentTurn={session.currentTurn}
          isCheck={session.isCheck}
          isCheckmate={session.isCheckmate}
          checkSquare={session.checkSquare}
          handlePieceDrop={session.handlePieceDrop}
          lastMoveHighlight={session.lastMoveHighlight}
          moveHistory={session.moveHistory}
          currentMoveIndex={session.currentMoveIndex}
          canUndo={session.canUndo}
          canRedo={session.canRedo}
          onNavigateMove={session.navigateToMoveIndex}
          onUndo={session.undoMove}
          onRedo={session.redoMove}
        />
      </div>
    </div>
  );
}
