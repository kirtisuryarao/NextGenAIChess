"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import { formatTimer, bumpStudentProgress, setSpeakingStudent } from "@/services/classroomService";
import { MockClassroomSocket } from "@/socket/mockClassroomSocket";
import { useLessonStore } from "@/store/lessonStore";
import { students as initialStudents, type Student } from "@/types/classroom";
import type { TeacherStatus } from "@/types/lesson";

type RecordedMove = {
  color: "w" | "b";
  from: string;
  to: string;
  piece: string;
  san: string;
  flags: string;
  captured?: string;
  promotion?: string;
};

type ChessTurn = "w" | "b";

function replayGame(moveHistory: RecordedMove[], moveCount: number) {
  const game = new Chess();

  for (let index = 0; index < moveCount; index += 1) {
    const move = moveHistory[index];
    if (!move) {
      break;
    }

    game.move({
      from: move.from as never,
      to: move.to as never,
      promotion: move.promotion as never,
    });
  }

  return game;
}

function toRecordedMove(move: RecordedMove) {
  return {
    color: move.color,
    from: move.from,
    to: move.to,
    piece: move.piece,
    san: move.san,
    flags: move.flags,
    captured: move.captured,
    promotion: move.promotion,
  } satisfies RecordedMove;
}

function getCheckSquareFromFen(fen: string, turn: ChessTurn) {
  const board = fen.split(" ")[0];
  const kingSymbol = turn === "w" ? "K" : "k";
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

  const rows = board.split("/");
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    let fileIndex = 0;
    for (const character of rows[rowIndex] ?? "") {
      const emptySquares = Number(character);
      if (Number.isInteger(emptySquares)) {
        fileIndex += emptySquares;
        continue;
      }

      if (character === kingSymbol) {
        return `${files[fileIndex]}${8 - rowIndex}`;
      }

      fileIndex += 1;
    }
  }

  return null;
}

const SESSION_DURATION_SECONDS = 42 * 60 + 15;
const EMPTY_BOARD_FEN = "8/8/8/8/8/8/8/8 w - - 0 1";

function formatLessonStatus(status: TeacherStatus, isWaitingForInteraction: boolean, isLessonCompleted: boolean) {
  if (isLessonCompleted) {
    return "Lesson Complete";
  }

  if (isWaitingForInteraction) {
    return "Listening";
  }

  switch (status) {
    case "celebrating":
      return "Celebrating";
    case "explaining":
      return "Explaining";
    case "teaching":
      return "Live Teaching";
    case "waiting":
      return "Listening";
    case "idle":
    default:
      return "Ready";
  }
}

function getLessonInstruction({
  currentStep,
  currentDialogue,
  isLessonCompleted,
}: {
  currentStep: ReturnType<typeof useLessonStore.getState>["currentStep"];
  currentDialogue: string | null;
  isLessonCompleted: boolean;
}) {
  if (isLessonCompleted) {
    return "Lesson complete.";
  }

  if (currentStep?.message) {
    return currentStep.message;
  }

  if (currentDialogue) {
    return currentDialogue;
  }

  return "Coco is preparing the lesson.";
}

export function useClassroomSession() {
  const [remainingSeconds, setRemainingSeconds] = useState(SESSION_DURATION_SECONDS);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const currentLesson = useLessonStore((state) => state.currentLesson);
  const currentStep = useLessonStore((state) => state.currentStep);
  const currentStepIndex = useLessonStore((state) => state.currentStepIndex);
  const isLessonCompleted = useLessonStore((state) => state.isLessonCompleted);
  const teacherStatus = useLessonStore((state) => state.teacherStatus);
  const currentDialogue = useLessonStore((state) => state.currentDialogue);
  const isWaitingForInteraction = useLessonStore((state) => state.isWaitingForInteraction);
  const addTranscriptMessage = useLessonStore((state) => state.addTranscriptMessage);

  const [moveHistory, setMoveHistory] = useState<RecordedMove[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoveTargets, setLegalMoveTargets] = useState<string[]>([]);

  const currentGame = useMemo(() => replayGame(moveHistory, currentMoveIndex), [currentMoveIndex, moveHistory]);
  const currentFen = currentGame.fen();
  const currentTurn = currentGame.turn() as ChessTurn;
  const orientation = "white" as const;
  const activePlayer = currentTurn === "w" ? "white" : "black";
  const currentPgn = currentGame.pgn();
  const isCheck = currentGame.isCheck();
  const isCheckmate = currentGame.isCheckmate();
  const lastMove = currentMoveIndex > 0 ? moveHistory[currentMoveIndex - 1] ?? null : null;
  const checkSquare = isCheck ? getCheckSquareFromFen(currentFen, currentTurn) : null;

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalMoveTargets([]);
  }, []);

  const selectSquare = useCallback((square: string) => {
    const legalMoves = currentGame.moves({ square: square as never, verbose: true }) as RecordedMove[];
    setSelectedSquare(square);
    setLegalMoveTargets(legalMoves.map((move) => move.to));
  }, [currentGame]);

  const attemptMove = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      const game = replayGame(moveHistory, currentMoveIndex);
      const sourcePiece = game.get(sourceSquare as never);

      if (!sourcePiece) {
        return false;
      }

      const isPromotion =
        sourcePiece.type === "p" &&
        ((sourcePiece.color === "w" && targetSquare.endsWith("8")) ||
          (sourcePiece.color === "b" && targetSquare.endsWith("1")));
      const promotion = isPromotion ? "q" : undefined;

      const legalMoves = game.moves({ square: sourceSquare as never, verbose: true }) as RecordedMove[];
      const move = legalMoves.find(
        (legalMove) =>
          legalMove.to === targetSquare &&
          (promotion ? legalMove.promotion === promotion : !legalMove.promotion)
      );

      if (!move) {
        return false;
      }

      const nextMove = toRecordedMove(move);

      setMoveHistory((previousHistory) => [...previousHistory.slice(0, currentMoveIndex), nextMove]);
      setCurrentMoveIndex((previousIndex) => Math.min(previousIndex + 1, currentMoveIndex + 1));
      clearSelection();
      return true;
    },
    [clearSelection, currentMoveIndex, moveHistory]
  );

  const navigateToMoveIndex = useCallback((targetIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(targetIndex, moveHistory.length));
    setCurrentMoveIndex(clampedIndex);
    clearSelection();
  }, [clearSelection, moveHistory.length]);

  const undoMove = useCallback(() => {
    setCurrentMoveIndex((previousIndex) => Math.max(previousIndex - 1, 0));
    clearSelection();
  }, [clearSelection]);

  const redoMove = useCallback(() => {
    setCurrentMoveIndex((previousIndex) => Math.min(previousIndex + 1, moveHistory.length));
    clearSelection();
  }, [clearSelection, moveHistory.length]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const socket = new MockClassroomSocket();

    const unsubscribe = socket.subscribe((event) => {
      if (event.type === "student-progress") {
        setStudents((prev) => bumpStudentProgress(prev, event.studentId, event.delta));
        return;
      }

      if (event.type === "student-speaking") {
        setStudents((prev) => setSpeakingStudent(prev, event.studentId));
        return;
      }

      if (event.type === "activity") {
        return;
      }
    });

    socket.start(initialStudents);

    return () => {
      unsubscribe();
      socket.stop();
    };
  }, []);

  const timerText = useMemo(() => formatTimer(remainingSeconds), [remainingSeconds]);
  const progressPercent = useMemo(() => {
    const totalSteps = currentLesson?.steps.length ?? 0;
    if (totalSteps === 0) {
      return 0;
    }

    if (isLessonCompleted) {
      return 100;
    }

    return Math.round(((currentStepIndex + 1) / totalSteps) * 100);
  }, [currentLesson?.steps.length, currentStepIndex, isLessonCompleted]);
  const lessonTitle = currentLesson?.title ?? "Loading Lesson";
  const lessonInstruction = getLessonInstruction({ currentStep, currentDialogue, isLessonCompleted });
  const tutorStatusLabel = formatLessonStatus(teacherStatus, isWaitingForInteraction, isLessonCompleted);

  const handleAskDoubt = () => {
    addTranscriptMessage({
      type: "student",
      sender: "Vihaan",
      message: "I have a doubt, Coco.",
    });
    addTranscriptMessage({
      type: "system",
      sender: "Classroom",
      message: "Doubt raised. Coco is ready to help.",
    });
  };

  const handleSquareSelect = (square: string) => {
    const clickedPiece = currentGame.get(square as never);

    if (selectedSquare) {
      if (selectedSquare === square) {
        clearSelection();
        return;
      }

      if (attemptMove(selectedSquare, square)) {
        return;
      }
    }

    if (clickedPiece && clickedPiece.color === currentTurn) {
      selectSquare(square);
      return;
    }

    clearSelection();
  };

  const moveCount = moveHistory.length;
  const canUndo = currentMoveIndex > 0;
  const canRedo = currentMoveIndex < moveHistory.length;
  const moveIndexLabel = currentMoveIndex === 0 ? "Start" : `Move ${currentMoveIndex}`;

  const topLearners = useMemo(
    () => [...students].sort((a, b) => b.progress - a.progress).slice(0, 3),
    [students]
  );

  return {
    timerText,
    lessonTitle,
    lessonInstruction,
    tutorStatusLabel,
    progressPercent,
    students,
    topLearners,
    handleAskDoubt,
    handleSquareSelect,
    gameFen: EMPTY_BOARD_FEN,
    orientation,
    activePlayer,
    currentTurn,
    isCheck,
    isCheckmate,
    checkSquare,
    currentPgn,
    selectedSquare,
    legalMoveTargets,
    moveHistory,
    currentMoveIndex,
    lastMoveHighlight: lastMove ? { from: lastMove.from, to: lastMove.to } : null,
    moveCount,
    moveIndexLabel,
    canUndo,
    canRedo,
    navigateToMoveIndex,
    undoMove,
    redoMove,
    handlePieceDrop: attemptMove,
  };
}
