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
  const lessonState = useLessonStore((state) => ({
    currentLesson: state.currentLesson,
    currentStep: state.currentStep,
    currentStepIndex: state.currentStepIndex,
    isLessonCompleted: state.isLessonCompleted,
    teacherStatus: state.teacherStatus,
    currentDialogue: state.currentDialogue,
    isWaitingForInteraction: state.isWaitingForInteraction,
    nextStep: state.nextStep,
    addTranscriptMessage: state.addTranscriptMessage,
  }));

  const lessonTitle = lessonState.currentLesson?.title ?? "Loading Lesson";

  const progressPercent = useMemo(() => {
    const totalSteps = lessonState.currentLesson?.steps.length ?? 0;
    if (totalSteps === 0) {
      return 0;
    }

    if (lessonState.isLessonCompleted) {
      return 100;
    }

    return Math.round(((lessonState.currentStepIndex + 1) / totalSteps) * 100);
  }, [lessonState.currentLesson?.steps.length, lessonState.currentStepIndex, lessonState.isLessonCompleted]);

  const lessonInstruction = useMemo(
    () => getLessonInstruction(lessonState.currentStep, lessonState.currentDialogue, lessonState.isLessonCompleted),
    [lessonState.currentDialogue, lessonState.currentStep, lessonState.isLessonCompleted]
  );

  const tutorStatusLabel = useMemo(
    () => (lessonState.isLessonCompleted ? "Lesson Complete" : statusLabels[lessonState.teacherStatus] ?? "Ready"),
    [lessonState.isLessonCompleted, lessonState.teacherStatus]
  );

  return {
    ...lessonState,
    lessonTitle,
    lessonInstruction,
    tutorStatusLabel,
    progressPercent,
  };
}
