"use client";

import { useMemo } from "react";
import { useLessonStore } from "@/store/lessonStore";
import type { Lesson, LessonStep, TeacherStatus } from "@/types/lesson";
import type { TranscriptMessageInput } from "@/types/transcript";

export interface LessonSession {
  lessonTitle: string;
  lessonInstruction: string;
  tutorStatusLabel: string;
  progressPercent: number;
  currentLesson: Lesson | null;
  currentStep: LessonStep | null;
  currentStepIndex: number;
  isLessonCompleted: boolean;
  teacherStatus: TeacherStatus;
  currentDialogue: string | null;
  isWaitingForInteraction: boolean;
  nextStep: () => void;
  addTranscriptMessage: (message: TranscriptMessageInput) => void;
}

const statusLabels: Record<TeacherStatus, string> = {
  idle: "Ready",
  teaching: "Live Teaching",
  waiting: "Listening",
  celebrating: "Celebrating",
  explaining: "Explaining",
};

function getLessonInstruction(currentStep: LessonStep | null, currentDialogue: string | null, isLessonCompleted: boolean) {
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

/**
 * Provides lesson view state and derived labels for the classroom shell.
 * This hook keeps lesson domain concerns separate from student and board state.
 */
export function useLessonSession(): LessonSession {
  const currentLesson = useLessonStore((state) => state.currentLesson);
  const currentStep = useLessonStore((state) => state.currentStep);
  const currentStepIndex = useLessonStore((state) => state.currentStepIndex);
  const isLessonCompleted = useLessonStore((state) => state.isLessonCompleted);
  const teacherStatus = useLessonStore((state) => state.teacherStatus);
  const currentDialogue = useLessonStore((state) => state.currentDialogue);
  const isWaitingForInteraction = useLessonStore((state) => state.isWaitingForInteraction);
  const nextStep = useLessonStore((state) => state.nextStep);
  const addTranscriptMessage = useLessonStore((state) => state.addTranscriptMessage);

  const lessonTitle = currentLesson?.title ?? "Loading Lesson";

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

  const lessonInstruction = useMemo(
    () => getLessonInstruction(currentStep, currentDialogue, isLessonCompleted),
    [currentDialogue, currentStep, isLessonCompleted]
  );

  const tutorStatusLabel = useMemo(
    () => (isLessonCompleted ? "Lesson Complete" : statusLabels[teacherStatus] ?? "Ready"),
    [isLessonCompleted, teacherStatus]
  );

  return {
    currentLesson,
    currentStep,
    currentStepIndex,
    isLessonCompleted,
    teacherStatus,
    currentDialogue,
    isWaitingForInteraction,
    nextStep,
    addTranscriptMessage,
    lessonTitle,
    lessonInstruction,
    tutorStatusLabel,
    progressPercent,
  };
}
