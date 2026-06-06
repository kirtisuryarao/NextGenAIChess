import { LeftPanel } from "@/components/classroom/LeftPanel";
import { RightPanel } from "@/components/classroom/RightPanel";
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

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: '46% 54%',
      gap: '4px',
      padding: '10px',
      boxSizing: 'border-box',
    }}>

      {/* LEFT: directly render LeftPanel so parent beige/yellow contains content */}
      <div style={{ height: '100%', overflow: 'hidden' }}>
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
      </div>

      {/* RIGHT: bare transparent section — no card, board floats on app background */}
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingLeft: '12px' }}>
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
      </div>

    </div>
  );
}
