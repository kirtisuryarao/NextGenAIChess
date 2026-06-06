import type {
  ExpectedInteraction,
  LessonInteractionType,
  LessonStep,
  ValidationResult,
} from "@/types/lesson";
import type { TranscriptMessage } from "@/types/transcript";

export type LessonInteractionInput =
  | { type: "click-square"; square: string }
  | { type: "move-piece"; from: string; to: string; isLegalMove: boolean }
  | { type: "wait-response" | "multiple-choice" | "text-response"; response: string };

type ValidationEngineActions = {
  addTranscriptMessage: (
    message: Omit<TranscriptMessage, "id" | "timestamp"> & Partial<Pick<TranscriptMessage, "id" | "timestamp">>
  ) => void;
  setWaitingForInteraction: (isWaiting: boolean) => void;
  setExpectedInteraction: (interaction: ExpectedInteraction | null) => void;
  setLastValidationResult: (result: ValidationResult) => void;
  setLessonStage: (stage: "TEACHING" | "QUESTION" | "WAITING_FOR_ANSWER" | "FEEDBACK") => void;
  setValidationFeedback: (feedback: { squares: string[]; status: "success" | "failure"; nonce: number } | null) => void;
  nextStep: () => void;
  speakText?: (text: string) => Promise<boolean> | void;
};

export function isInteractionStep(step: LessonStep | null | undefined): step is LessonStep & { type: LessonInteractionType } {
  return (
    step?.type === "click-square" ||
    step?.type === "move-piece" ||
    step?.type === "wait-response" ||
    step?.type === "multiple-choice" ||
    step?.type === "text-response"
  );
}

export function buildExpectedInteraction(step: LessonStep): ExpectedInteraction | null {
  if (!isInteractionStep(step)) {
    return null;
  }

  return {
    stepId: step.id,
    type: step.type,
    targetSquare: step.targetSquare,
    expectedMove: step.expectedMove,
    expectedResponses: step.expectedResponses,
    options: step.options,
    timeoutDuration: step.timeoutDuration,
    continueIfTimeout: step.continueIfTimeout,
  };
}

export function processLessonInteraction({
  step,
  input,
  actions,
  resumeDelay = 1300,
}: {
  step: LessonStep | null | undefined;
  input: LessonInteractionInput;
  actions: ValidationEngineActions;
  resumeDelay?: number;
}) {
  if (!isInteractionStep(step) || input.type !== step.type) {
    return false;
  }

  const result = validateInteraction(step, input);
  actions.setLastValidationResult(result);

  if (input.type === "wait-response" || input.type === "multiple-choice" || input.type === "text-response") {
    actions.addTranscriptMessage({
      type: "student",
      sender: "Vihaan",
      message: input.response,
    });
  }

  if (input.type === "click-square") {
    actions.addTranscriptMessage({
      type: "student",
      sender: "Vihaan",
      message: `Clicked ${input.square.toUpperCase()}`,
    });
  }

  if (input.type === "move-piece") {
    actions.addTranscriptMessage({
      type: "student",
      sender: "Vihaan",
      message: `Moved ${input.from.toUpperCase()} to ${input.to.toUpperCase()}`,
    });
  }

  if (result.status === "success") {
    const spokenMessage = result.message ?? "Excellent. That is correct.";
    actions.addTranscriptMessage({
      type: "success",
      sender: step.speaker ?? "Coco",
      message: spokenMessage,
    });
    if (actions.speakText) {
      void actions.speakText(spokenMessage);
    }
    actions.setLessonStage("FEEDBACK");
    actions.setWaitingForInteraction(false);
    actions.setExpectedInteraction(null);
    actions.setValidationFeedback({
      squares: getFeedbackSquares(step, input),
      status: "success",
      nonce: Date.now(),
    });
    window.setTimeout(() => actions.setValidationFeedback(null), 1050);
    window.setTimeout(() => actions.nextStep(), resumeDelay);
    return true;
  }

  const failureMessage = result.message ?? "Almost. Try again.";
  actions.addTranscriptMessage({
    type: "error",
    sender: step.speaker ?? "Coco",
    message: failureMessage,
  });
  if (actions.speakText) {
    void actions.speakText(failureMessage);
  }
  if (step.hint && result.status === "failure") {
    actions.addTranscriptMessage({
      type: "system",
      sender: "Coco",
      message: step.hint,
    });
  }
  actions.setLessonStage("FEEDBACK");
  actions.setValidationFeedback({
    squares: getFeedbackSquares(step, input),
    status: "failure",
    nonce: Date.now(),
  });
  window.setTimeout(() => actions.setValidationFeedback(null), 1050);
  return false;
}

export function processInteractionTimeout({
  step,
  actions,
}: {
  step: LessonStep;
  actions: ValidationEngineActions;
}) {
  const timeoutMessage = step.continueIfTimeout
    ? "No worries. Coco will keep the class moving."
    : step.failureMessage ?? "No worries. Try when you are ready.";
  actions.setLastValidationResult({
    status: "timeout",
    stepId: step.id,
    message: timeoutMessage,
    timestamp: Date.now(),
  });
  actions.addTranscriptMessage({
    type: step.continueIfTimeout ? "system" : "error",
    sender: step.speaker ?? "Coco",
    message: timeoutMessage,
  });
  if (actions.speakText) {
    void actions.speakText(timeoutMessage);
  }

  actions.setLessonStage("FEEDBACK");
  if (step.continueIfTimeout) {
    actions.setWaitingForInteraction(false);
    actions.setExpectedInteraction(null);
    window.setTimeout(() => actions.nextStep(), 900);
  }
}

function validateInteraction(step: LessonStep, input: LessonInteractionInput): ValidationResult {
  const attemptedValue = getAttemptedValue(input);
  const successMessage = step.successMessage ?? defaultSuccessMessage(step, attemptedValue);
  const failureMessage = step.failureMessage ?? defaultFailureMessage(step);

  if (input.type === "click-square") {
    const acceptedSquares = [step.targetSquare, ...(step.acceptedSquares ?? [])].filter(Boolean);
    const isCorrect = acceptedSquares.some((square) => normalize(square) === normalize(input.square));
    return {
      status: isCorrect ? "success" : "failure",
      stepId: step.id,
      message: isCorrect ? successMessage : failureMessage,
      attemptedValue,
      timestamp: Date.now(),
    };
  }

  if (input.type === "move-piece") {
    const moveKey = `${input.from}${input.to}`;
    const isExpectedMove = normalize(moveKey) === normalize(step.expectedMove);
    const isCorrect = input.isLegalMove && isExpectedMove;
    return {
      status: isCorrect ? "success" : "failure",
      stepId: step.id,
      message: isCorrect ? successMessage : isExpectedMove ? "That move is not legal yet. Try the move Coco asked for." : failureMessage,
      attemptedValue,
      timestamp: Date.now(),
    };
  }

  const acceptedResponses = step.expectedResponses?.length ? step.expectedResponses : step.options;
  const acceptsAnyText = input.type === "text-response" || !acceptedResponses?.length || step.type === "wait-response";
  const isCorrect =
    acceptsAnyText ||
    acceptedResponses.some((response) => normalize(response) === normalize(input.response));

  return {
    status: isCorrect ? "success" : "failure",
    stepId: step.id,
    message: isCorrect ? successMessage : failureMessage,
    attemptedValue,
    timestamp: Date.now(),
  };
}

function getFeedbackSquares(step: LessonStep, input: LessonInteractionInput) {
  if (input.type === "click-square") {
    return [input.square];
  }

  if (input.type === "move-piece") {
    return [input.from, input.to];
  }

  return step.highlightSquares ?? [];
}

function getAttemptedValue(input: LessonInteractionInput) {
  if (input.type === "click-square") {
    return input.square;
  }

  if (input.type === "move-piece") {
    return `${input.from}${input.to}`;
  }

  return input.response;
}

function defaultSuccessMessage(step: LessonStep, attemptedValue: string) {
  if (step.type === "click-square") {
    return `Excellent! That is square ${attemptedValue.toUpperCase()}.`;
  }

  if (step.type === "move-piece") {
    return "Excellent. That is the move I wanted.";
  }

  return "Wonderful. Let's keep going.";
}

function defaultFailureMessage(step: LessonStep) {
  if (step.type === "click-square") {
    return `Almost! Try finding ${step.targetSquare?.toUpperCase()} again.`;
  }

  if (step.type === "move-piece") {
    return "Almost. Try the move Coco asked for.";
  }

  return "Almost. Try another answer.";
}

function normalize(value: string | undefined) {
  return value?.trim().toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
}
