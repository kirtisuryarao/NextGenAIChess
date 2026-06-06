"use client";

/**
 * useFocusModeInteraction Hook
 * 
 * Handles MCQ interactions during focus mode and integrates with lesson validation.
 * Processes student answers and triggers appropriate state transitions.
 */

import { useCallback } from "react";
import { useLessonStore } from "@/store/lessonStore";
import type { LessonInteractionInput } from "@/lib/lesson-engine/validationEngine";
import { processLessonInteraction } from "@/lib/lesson-engine/validationEngine";
import { speakLessonText } from "@/lib/speech/voiceAssistant";
import type { LessonStep } from "@/types/lesson";

export function useFocusModeInteraction() {
  const currentStep = useLessonStore((state) => state.currentStep);
  const isVoiceEnabled = useLessonStore((state) => state.isVoiceEnabled);
  const addTranscriptMessage = useLessonStore((state) => state.addTranscriptMessage);
  const setWaitingForInteraction = useLessonStore((state) => state.setWaitingForInteraction);
  const setExpectedInteraction = useLessonStore((state) => state.setExpectedInteraction);
  const setLastValidationResult = useLessonStore((state) => state.setLastValidationResult);
  const setLessonStage = useLessonStore((state) => state.setLessonStage);
  const setValidationFeedback = useLessonStore((state) => state.setValidationFeedback);
  const nextStep = useLessonStore((state) => state.nextStep);

  const handleMCQAnswer = useCallback(
    (selectedOption: string) => {
      if (!currentStep) return;

      const input: LessonInteractionInput = {
        type: "multiple-choice",
        response: selectedOption,
      };

      processLessonInteraction({
        step: currentStep,
        input,
        actions: {
          addTranscriptMessage,
          setWaitingForInteraction,
          setExpectedInteraction,
          setLastValidationResult,
          setLessonStage,
          setValidationFeedback,
          nextStep,
          speakText: (text: string) => {
            if (!isVoiceEnabled) {
              return Promise.resolve(false);
            }
            return speakLessonText(text);
          },
        },
        resumeDelay: 1300,
      });
    },
    [
      currentStep,
      isVoiceEnabled,
      addTranscriptMessage,
      setWaitingForInteraction,
      setExpectedInteraction,
      setLastValidationResult,
      setLessonStage,
      setValidationFeedback,
      nextStep,
    ]
  );

  return { handleMCQAnswer };
}
