"use client";

import { useCallback } from "react";
import { useLessonSession } from "@/features/lesson";

export interface TutorSession {
  tutorStatusLabel: string;
  handleAskDoubt: () => void;
}

/**
 * Tutor domain hook. This isolates tutor-specific actions and labels from the
 * broader classroom shell.
 */
export function useTutorSession(): TutorSession {
  const { tutorStatusLabel, addTranscriptMessage } = useLessonSession();

  const handleAskDoubt = useCallback(() => {
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
  }, [addTranscriptMessage]);

  return {
    tutorStatusLabel,
    handleAskDoubt,
  };
}
