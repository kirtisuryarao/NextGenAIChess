"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useChessGame } from "@/features/chess/useChessGame";
import { useLessonSession } from "@/features/lesson";
import { useStudentSession } from "@/features/students";
import { useTutorSession } from "@/features/tutor";

const SESSION_DURATION_SECONDS = 42 * 60 + 15;

function formatTimer(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Composes domain-specific hooks into the classroom shell state.
 * This hook is intentionally narrow: it does not own lesson or transcript logic.
 */
export function useClassroomSession() {
  const [remainingSeconds, setRemainingSeconds] = useState(SESSION_DURATION_SECONDS);
  const chessGame = useChessGame();
  const lessonSession = useLessonSession();
  const { students, topLearners } = useStudentSession();
  const tutorSession = useTutorSession();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const timerText = useMemo(() => formatTimer(remainingSeconds), [remainingSeconds]);

  const { handleAskDoubt } = tutorSession;

  return {
    timerText,
    students,
    topLearners,
    handleAskDoubt,
    ...lessonSession,
    ...chessGame,
    handlePieceDrop: chessGame.attemptMove,
  };
}
