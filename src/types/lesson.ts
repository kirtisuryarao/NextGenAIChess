export type LessonStepType =
  | "ai-dialogue"
  | "pause"
  | "highlight"
  | "arrow"
  | "wait-response"
  | "multiple-choice"
  | "click-square"
  | "move-piece"
  | "text-response"
  | "reaction"
  | "celebration"
  | "board-demo"
  | "system-event";

export type TeacherStatus = "idle" | "teaching" | "waiting" | "celebrating" | "explaining";

export type LessonInteractionType =
  | "click-square"
  | "move-piece"
  | "wait-response"
  | "multiple-choice"
  | "text-response";

export type ValidationStatus = "idle" | "success" | "failure" | "timeout";

export interface ExpectedInteraction {
  stepId: string;
  type: LessonInteractionType;
  targetSquare?: string;
  expectedMove?: string;
  expectedResponses?: string[];
  options?: string[];
  timeoutDuration?: number;
  continueIfTimeout?: boolean;
}

export interface ValidationResult {
  status: ValidationStatus;
  stepId?: string;
  message?: string;
  attemptedValue?: string;
  timestamp: number;
}

export interface LessonStep {
  id: string;
  type: LessonStepType;

  title?: string;
  speaker?: string;
  message?: string;
  duration?: number;
  options?: string[];
  expectedResponses?: string[];
  successMessage?: string;
  failureMessage?: string;
  timeoutDuration?: number;
  continueIfTimeout?: boolean;

  highlightSquares?: string[];

  targetSquare?: string;

  from?: string;
  to?: string;

  expectedMove?: string;

  arrows?: {
    from: string;
    to: string;
    color?: string;
  }[];

  delay?: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;

  difficulty: "beginner" | "intermediate" | "advanced";

  steps: LessonStep[];
}
