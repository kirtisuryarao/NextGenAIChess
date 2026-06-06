"use client";

/**
 * Central lesson world state for classroom execution.
 * Zustand keeps lesson progress, transcript, and interaction state
 * in a single reactive store so UI hooks can remain lightweight.
 */
import { create } from "zustand";
import type {
  ExpectedInteraction,
  Lesson,
  LessonInteractionType,
  LessonStage,
  LessonStep,
  TeacherStatus,
  ValidationResult,
} from "@/types/lesson";
import type { TranscriptMessage, TranscriptMessageInput } from "@/types/transcript";

type LessonState = {
  currentLesson: Lesson | null;
  currentStepIndex: number;
  currentStep: LessonStep | null;
  isLessonCompleted: boolean;
  highlightedSquares: string[];
  activeArrows: NonNullable<LessonStep["arrows"]>;
  overlayMessage: string | null;
  teacherStatus: TeacherStatus;
  currentDialogue: string | null;
  isTyping: boolean;
  currentSpeaker: string;
  isVoiceEnabled: boolean;
  lessonStage: LessonStage;
  transcriptMessages: TranscriptMessage[];
  isLessonRunning: boolean;
  isWaitingForInteraction: boolean;
  expectedInteraction: ExpectedInteraction | null;
  currentInteractionType: LessonInteractionType | null;
  lastValidationResult: ValidationResult;
  validationFeedback: { squares: string[]; status: "success" | "failure"; nonce: number } | null;
  timelineQueue: LessonStep[];
  currentTimelineStep: LessonStep | null;
  loadLesson: (lesson: Lesson) => void;
  nextStep: () => void;
  setOverlayMessage: (message: string | null) => void;
  setTeacherStatus: (status: TeacherStatus) => void;
  setCurrentDialogue: (message: string | null) => void;
  setIsTyping: (isTyping: boolean) => void;
  setCurrentSpeaker: (speaker: string) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setLessonRunning: (isRunning: boolean) => void;
  setWaitingForInteraction: (isWaiting: boolean) => void;
  setExpectedInteraction: (interaction: ExpectedInteraction | null) => void;
  setLastValidationResult: (result: ValidationResult) => void;
  setLessonStage: (stage: LessonStage) => void;
  setValidationFeedback: (feedback: { squares: string[]; status: "success" | "failure"; nonce: number } | null) => void;
  addTranscriptMessage: (message: TranscriptMessageInput) => void;
  clearTranscript: () => void;
  removeMessage: (id: string) => void;
  setHighlightedSquares: (squares: string[]) => void;
  setArrows: (arrows: NonNullable<LessonStep["arrows"]>) => void;
  completeLesson: () => void;
};

function resolveStep(lesson: Lesson | null, index: number) {
  return lesson?.steps[index] ?? null;
}

export const useLessonStore = create<LessonState>((set, get) => ({
  currentLesson: null,
  currentStepIndex: 0,
  currentStep: null,
  isLessonCompleted: false,
  highlightedSquares: [],
  activeArrows: [],
  overlayMessage: null,
  teacherStatus: "idle",
  currentDialogue: null,
  isTyping: false,
  currentSpeaker: "Coco",
  isVoiceEnabled: true,
  transcriptMessages: [],
  isLessonRunning: false,
  isWaitingForInteraction: false,
  expectedInteraction: null,
  currentInteractionType: null,
  lastValidationResult: { status: "idle", timestamp: 0 },
  lessonStage: "TEACHING",
  validationFeedback: null,
  timelineQueue: [],
  currentTimelineStep: null,

  loadLesson: (lesson) =>
    set({
      currentLesson: lesson,
      currentStepIndex: 0,
      currentStep: lesson.steps[0] ?? null,
      isLessonCompleted: lesson.steps.length === 0,
      highlightedSquares: [],
      activeArrows: [],
      overlayMessage: null,
      teacherStatus: lesson.steps.length === 0 ? "idle" : "teaching",
      currentDialogue: null,
      isTyping: false,
      currentSpeaker: "Coco",
      isVoiceEnabled: true,
      transcriptMessages: [],
      isLessonRunning: lesson.steps.length > 0,
      isWaitingForInteraction: false,
      expectedInteraction: null,
      currentInteractionType: null,
      lastValidationResult: { status: "idle", timestamp: 0 },
      lessonStage: "TEACHING",
      validationFeedback: null,
      timelineQueue: lesson.steps,
      currentTimelineStep: lesson.steps[0] ?? null,
    }),

  nextStep: () => {
    const { currentLesson, currentStepIndex } = get();
    if (!currentLesson) {
      return;
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= currentLesson.steps.length) {
      set({
        isLessonCompleted: true,
        highlightedSquares: [],
        activeArrows: [],
        overlayMessage: "Lesson complete.",
        currentDialogue: "Beautiful work. Lesson complete.",
        currentSpeaker: "Coco",
        teacherStatus: "celebrating",
        lessonStage: "TEACHING",
        isLessonRunning: false,
        isWaitingForInteraction: false,
        expectedInteraction: null,
        currentInteractionType: null,
        currentTimelineStep: null,
        transcriptMessages: [
          ...get().transcriptMessages,
          {
            id: `lesson-complete-${Date.now()}`,
            type: "success",
            sender: "Coco",
            message: "Beautiful work. Lesson complete.",
            timestamp: Date.now(),
          },
        ],
      });
      return;
    }

    set({
      currentStepIndex: nextIndex,
      currentStep: resolveStep(currentLesson, nextIndex),
      currentTimelineStep: resolveStep(currentLesson, nextIndex),
      isLessonCompleted: false,
      isLessonRunning: true,
      isWaitingForInteraction: false,
      expectedInteraction: null,
      currentInteractionType: null,
      lessonStage: "TEACHING",
      validationFeedback: null,
    });
  },

  setOverlayMessage: (message) => set({ overlayMessage: message }),
  setTeacherStatus: (status) => set({ teacherStatus: status }),
  setCurrentDialogue: (message) => set({ currentDialogue: message }),
  setIsTyping: (isTyping) => set({ isTyping }),
  setCurrentSpeaker: (speaker) => set({ currentSpeaker: speaker }),
  setVoiceEnabled: (enabled) => set({ isVoiceEnabled: enabled }),
  setLessonRunning: (isRunning) => set({ isLessonRunning: isRunning }),
  setWaitingForInteraction: (isWaiting) => set({ isWaitingForInteraction: isWaiting }),
  setExpectedInteraction: (interaction) =>
    set({
      expectedInteraction: interaction,
      currentInteractionType: interaction?.type ?? null,
    }),
  setLastValidationResult: (result) => set({ lastValidationResult: result }),
  setLessonStage: (stage) => set({ lessonStage: stage }),
  setValidationFeedback: (feedback) => set({ validationFeedback: feedback }),
  addTranscriptMessage: (message) =>
    set((state) => {
      if (message.id && state.transcriptMessages.some((entry) => entry.id === message.id)) {
        return state;
      }

      return {
        transcriptMessages: [
          ...state.transcriptMessages,
          {
            id: message.id ?? `transcript-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            timestamp: message.timestamp ?? Date.now(),
            type: message.type,
            sender: message.sender,
            message: message.message,
          },
        ],
      };
    }),
  clearTranscript: () => set({ transcriptMessages: [] }),
  removeMessage: (id) =>
    set((state) => ({
      transcriptMessages: state.transcriptMessages.filter((message) => message.id !== id),
    })),
  setHighlightedSquares: (squares) => set({ highlightedSquares: squares }),
  setArrows: (arrows) => set({ activeArrows: arrows }),
  completeLesson: () =>
    set({
      isLessonCompleted: true,
      teacherStatus: "celebrating",
      currentDialogue: "Lesson complete.",
      currentSpeaker: "Coco",
      isLessonRunning: false,
      isWaitingForInteraction: false,
      expectedInteraction: null,
      currentInteractionType: null,
      currentTimelineStep: null,
    }),
}));
