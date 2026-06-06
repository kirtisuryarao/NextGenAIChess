"use client";

/**
 * useFocusMode Hook
 * 
 * Manages the Focus Mode UI state and transitions based on lesson steps.
 * - When focusMode=true on a step: Hide panels, expand tutor/question panels, open MCQ dropdown
 * - On student answer: Auto-close MCQ, show feedback, restore layout
 * - Coordinates with lesson store to manage classroom state (TEACHING, QUESTION, WAITING_FOR_ANSWER, FEEDBACK)
 */

import { useEffect, useState } from "react";
import { useLessonStore } from "@/store/lessonStore";
import type { LessonStep, LessonStage } from "@/types/lesson";

export interface FocusModeState {
  isActive: boolean;
  shouldHideBoardPanel: boolean;
  shouldHideBlackboardPanel: boolean;
  shouldExpandTutorPanel: boolean;
  shouldExpandQuestionPanel: boolean;
  isMCQDropdownOpen: boolean;
  isShowingFeedback: boolean;
  feedbackType: "success" | "failure" | null;
  feedbackMessage: string;
  animationPhase: "enter" | "active" | "exit" | "normal";
}

const INITIAL_STATE: FocusModeState = {
  isActive: false,
  shouldHideBoardPanel: false,
  shouldHideBlackboardPanel: false,
  shouldExpandTutorPanel: false,
  shouldExpandQuestionPanel: false,
  isMCQDropdownOpen: false,
  isShowingFeedback: false,
  feedbackType: null,
  feedbackMessage: "",
  animationPhase: "normal",
};

export function useFocusMode() {
  const [focusState, setFocusState] = useState<FocusModeState>(INITIAL_STATE);
  
  const currentStep = useLessonStore((state) => state.currentStep);
  const lessonStage = useLessonStore((state) => state.lessonStage);
  const isWaitingForInteraction = useLessonStore((state) => state.isWaitingForInteraction);
  const lastValidationResult = useLessonStore((state) => state.lastValidationResult);
  const setLessonStage = useLessonStore((state) => state.setLessonStage);

  // Manage focus mode activation based on current step
  useEffect(() => {
    if (!currentStep) {
      setFocusState(INITIAL_STATE);
      return;
    }

    const isFocusModeStep = currentStep.focusMode === true;

    if (isFocusModeStep) {
      setFocusState((prev) => ({
        ...prev,
        isActive: true,
        shouldHideBoardPanel: true,
        shouldHideBlackboardPanel: true,
        shouldExpandTutorPanel: true,
        shouldExpandQuestionPanel: true,
        animationPhase: "enter",
      }));

      // After animation completes (300ms), open MCQ dropdown
      const mcqTimer = window.setTimeout(() => {
        setFocusState((prev) => ({
          ...prev,
          isMCQDropdownOpen: true,
          animationPhase: "active",
        }));
      }, 300);

      // Update lesson stage to QUESTION
      setLessonStage("QUESTION");

      return () => window.clearTimeout(mcqTimer);
    } else {
      // Not a focus mode step - restore normal layout
      setFocusState(INITIAL_STATE);
      if (lessonStage !== "FEEDBACK") {
        setLessonStage("TEACHING");
      }
    }
  }, [currentStep?.id, currentStep?.focusMode, lessonStage, setLessonStage]);

  // Handle student interaction - auto-close MCQ and show feedback
  useEffect(() => {
    if (!focusState.isActive) {
      return;
    }

    if (isWaitingForInteraction) {
      // Student is answering - update stage to WAITING_FOR_ANSWER
      setLessonStage("WAITING_FOR_ANSWER");
      return;
    }

    // Student has answered - show feedback
    if (lastValidationResult.status === "success" || lastValidationResult.status === "failure") {
      const feedbackType = lastValidationResult.status === "success" ? "success" : "failure";
      const feedbackMessage =
        feedbackType === "success"
          ? currentStep?.successMessage || "Excellent! That's correct."
          : currentStep?.failureMessage || "Not quite. Try again.";

      setFocusState((prev) => ({
        ...prev,
        isMCQDropdownOpen: false,
        isShowingFeedback: true,
        feedbackType,
        feedbackMessage,
        animationPhase: "active",
      }));

      // Update lesson stage to FEEDBACK
      setLessonStage("FEEDBACK");

      // Auto-restore layout after feedback (2 seconds)
      const restoreTimer = window.setTimeout(() => {
        setFocusState((prev) => ({
          ...prev,
          animationPhase: "exit",
        }));

        // Complete exit animation (200ms) then restore
        const exitTimer = window.setTimeout(() => {
          setFocusState(INITIAL_STATE);
          setLessonStage("TEACHING");
        }, 200);

        return () => window.clearTimeout(exitTimer);
      }, 2000);

      return () => window.clearTimeout(restoreTimer);
    }
  }, [
    focusState.isActive,
    isWaitingForInteraction,
    lastValidationResult.status,
    currentStep?.successMessage,
    currentStep?.failureMessage,
    setLessonStage,
  ]);

  // Function to manually close MCQ (called when student selects an answer)
  const closeMCQDropdown = () => {
    setFocusState((prev) => ({
      ...prev,
      isMCQDropdownOpen: false,
    }));
  };

  // Function to restore normal layout (called after feedback)
  const restoreNormalLayout = () => {
    setFocusState(INITIAL_STATE);
    setLessonStage("TEACHING");
  };

  return {
    ...focusState,
    closeMCQDropdown,
    restoreNormalLayout,
  };
}
