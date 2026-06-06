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
  const transcriptState = useLessonStore((state) => ({
    transcriptMessages: state.transcriptMessages,
    addTranscriptMessage: state.addTranscriptMessage,
    clearTranscript: state.clearTranscript,
    removeMessage: state.removeMessage,
  }));

  const latestMessage = useMemo(
    () => (transcriptState.transcriptMessages.length ? transcriptState.transcriptMessages[transcriptState.transcriptMessages.length - 1] : null),
    [transcriptState.transcriptMessages]
  );

  return {
    ...transcriptState,
    latestMessage,
  };
}
