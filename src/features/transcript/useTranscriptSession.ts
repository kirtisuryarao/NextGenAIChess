"use client";

import { useMemo } from "react";
import { useLessonStore } from "@/store/lessonStore";
import type { TranscriptMessage, TranscriptMessageInput } from "@/types/transcript";

export interface TranscriptSession {
  transcriptMessages: TranscriptMessage[];
  latestMessage: TranscriptMessage | null;
  addTranscriptMessage: (message: TranscriptMessageInput) => void;
  clearTranscript: () => void;
  removeMessage: (id: string) => void;
}

/**
 * Encapsulates transcript state and actions. The classroom transcript is shared
 * between lesson and tutor domains, so this hook centralizes the transcript API.
 */
export function useTranscriptSession(): TranscriptSession {
  const transcriptMessages = useLessonStore((state) => state.transcriptMessages);
  const addTranscriptMessage = useLessonStore((state) => state.addTranscriptMessage);
  const clearTranscript = useLessonStore((state) => state.clearTranscript);
  const removeMessage = useLessonStore((state) => state.removeMessage);

  const latestMessage = useMemo(
    () => (transcriptMessages.length ? transcriptMessages[transcriptMessages.length - 1] : null),
    [transcriptMessages]
  );

  return {
    transcriptMessages,
    latestMessage,
    addTranscriptMessage,
    clearTranscript,
    removeMessage,
  };
}
