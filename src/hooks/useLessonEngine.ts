"use client";

/**
 * The lesson engine hook orchestrates lesson playback, speech, and
 * learner interactions. It is intentionally isolated from UI composition
 * and only coordinates side effects for lesson progression.
 */
import { useEffect, useMemo } from "react";
import day1BoardCoordinates from "@/data/lessons/day1-board-coordinates.json";
import { executeLessonStep } from "@/lib/lesson-engine/stepExecutor";
import { parseLesson } from "@/lib/lesson-engine/lessonParser";
import { cancelLessonSpeech, speakLessonText } from "@/lib/speech/voiceAssistant";
import {
  buildExpectedInteraction,
  isInteractionStep,
  processInteractionTimeout,
} from "@/lib/lesson-engine/validationEngine";
import { useLessonStore } from "@/store/lessonStore";
import type { JsonValue, Lesson, LessonStep } from "@/types/lesson";

export function useLessonEngine(lessonData: JsonValue = day1BoardCoordinates) {
  const currentLesson = useLessonStore((state) => state.currentLesson);
  const currentStep = useLessonStore((state) => state.currentStep);
  const currentStepIndex = useLessonStore((state) => state.currentStepIndex);
  const isLessonCompleted = useLessonStore((state) => state.isLessonCompleted);
  const highlightedSquares = useLessonStore((state) => state.highlightedSquares);
  const activeArrows = useLessonStore((state) => state.activeArrows);
  const overlayMessage = useLessonStore((state) => state.overlayMessage);
  const teacherStatus = useLessonStore((state) => state.teacherStatus);
  const currentDialogue = useLessonStore((state) => state.currentDialogue);
  const isTyping = useLessonStore((state) => state.isTyping);
  const currentSpeaker = useLessonStore((state) => state.currentSpeaker);
  const isVoiceEnabled = useLessonStore((state) => state.isVoiceEnabled);
  const isLessonRunning = useLessonStore((state) => state.isLessonRunning);
  const isWaitingForInteraction = useLessonStore((state) => state.isWaitingForInteraction);
  const timelineQueue = useLessonStore((state) => state.timelineQueue);
  const currentTimelineStep = useLessonStore((state) => state.currentTimelineStep);
  const loadLesson = useLessonStore((state) => state.loadLesson);
  const nextStep = useLessonStore((state) => state.nextStep);
  const setOverlayMessage = useLessonStore((state) => state.setOverlayMessage);
  const setCurrentDialogue = useLessonStore((state) => state.setCurrentDialogue);
  const setCurrentSpeaker = useLessonStore((state) => state.setCurrentSpeaker);
  const setTeacherStatus = useLessonStore((state) => state.setTeacherStatus);
  const addTranscriptMessage = useLessonStore((state) => state.addTranscriptMessage);
  const setHighlightedSquares = useLessonStore((state) => state.setHighlightedSquares);
  const setArrows = useLessonStore((state) => state.setArrows);
  const setWaitingForInteraction = useLessonStore((state) => state.setWaitingForInteraction);
  const setExpectedInteraction = useLessonStore((state) => state.setExpectedInteraction);
  const setLastValidationResult = useLessonStore((state) => state.setLastValidationResult);
  const setLessonStage = useLessonStore((state) => state.setLessonStage);
  const setValidationFeedback = useLessonStore((state) => state.setValidationFeedback);

  const lesson = useMemo(() => parseLesson(lessonData), [lessonData]);

  useEffect(() => {
    loadLesson(lesson);
  }, [lesson, loadLesson]);

  useEffect(() => {
    executeLessonStep(currentStep, {
      setOverlayMessage,
      setCurrentDialogue,
      setCurrentSpeaker,
      setTeacherStatus,
      addTranscriptMessage,
      setHighlightedSquares,
      setArrows,
    });
  }, [
    addTranscriptMessage,
    currentStep,
    setArrows,
    setCurrentDialogue,
    setCurrentSpeaker,
    setHighlightedSquares,
    setOverlayMessage,
    setTeacherStatus,
  ]);

  useEffect(() => {
    if (!isVoiceEnabled) {
      cancelLessonSpeech();
    }
  }, [isVoiceEnabled]);

  useEffect(() => {
    let cancelled = false;

    const runSpeech = async () => {
      if (!currentStep || isLessonCompleted) {
        cancelLessonSpeech();
        return;
      }

      if (!currentStep.message || !isVoiceEnabled) {
        return;
      }

      const shouldAdvanceAfterSpeech = !isInteractionStep(currentStep);
      const spoken = await speakLessonText(currentStep.message);

      if (cancelled || !spoken) {
        return;
      }

      if (shouldAdvanceAfterSpeech) {
        nextStep();
      }
    };

    void runSpeech();

    return () => {
      cancelled = true;
      cancelLessonSpeech();
    };
  }, [currentStep?.id, currentStep?.message, currentStep?.type, isLessonCompleted, isVoiceEnabled, nextStep]);

  useEffect(() => {
    if (!currentStep || isLessonCompleted) {
      return;
    }

    const waitsForStudent = isInteractionStep(currentStep);
    setLessonStage(
      waitsForStudent && currentStep.focusMode ? "QUESTION" : "TEACHING"
    );
    setWaitingForInteraction(waitsForStudent);
    setExpectedInteraction(waitsForStudent ? buildExpectedInteraction(currentStep) : null);

    if (waitsForStudent) {
      if (!currentStep.timeoutDuration) {
        return;
      }

      const timeout = window.setTimeout(() => {
        processInteractionTimeout({
          step: currentStep,
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
        });
      }, currentStep.timeoutDuration);

      return () => window.clearTimeout(timeout);
    }

    if (isLessonCompleted) {
      return;
    }

    const voiceSupported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    if (isVoiceEnabled && voiceSupported && currentStep.message) {
      return;
    }

    const duration = getStepDuration(currentStep);
    const timer = window.setTimeout(() => {
      nextStep();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [
    addTranscriptMessage,
    currentStep,
    isLessonCompleted,
    nextStep,
    setExpectedInteraction,
    setLastValidationResult,
    setValidationFeedback,
    setWaitingForInteraction,
    setLessonStage,
  ]);

  useEffect(() => {
    if (!currentStep || !currentStep.focusMode || !isInteractionStep(currentStep)) {
      return;
    }

    if (isWaitingForInteraction) {
      setLessonStage("WAITING_FOR_ANSWER");
    }
  }, [currentStep, isWaitingForInteraction, setLessonStage]);

  return {
    lesson: currentLesson ?? (lesson as Lesson),
    currentStep,
    currentStepIndex,
    isLessonCompleted,
    highlightedSquares,
    activeArrows,
    overlayMessage,
    teacherStatus,
    currentDialogue,
    isTyping,
    currentSpeaker,
    isLessonRunning,
    isWaitingForInteraction,
    timelineQueue,
    currentTimelineStep,
    nextStep,
  };
}

function getStepDuration(step: LessonStep) {
  if (typeof step.duration === "number") {
    return step.duration;
  }

  if (typeof step.delay === "number") {
    return step.delay;
  }

  if (step.type === "pause") {
    return 1400;
  }

  if (step.type === "highlight" || step.type === "arrow" || step.type === "board-demo") {
    return 2200;
  }

  const messageLength = step.message?.length ?? 0;
  return Math.min(Math.max(messageLength * 38, 1800), 5200);
}
