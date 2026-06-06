import type { JsonObject, JsonValue, Lesson, LessonStep, LessonStepType } from "@/types/lesson";

const STEP_TYPES: LessonStepType[] = [
  "ai-dialogue",
  "pause",
  "highlight",
  "arrow",
  "wait-response",
  "multiple-choice",
  "click-square",
  "move-piece",
  "text-response",
  "reaction",
  "celebration",
  "board-demo",
  "system-event",
  "reward",
];
const DIFFICULTIES: Lesson["difficulty"][] = ["beginner", "intermediate", "advanced"];
const SQUARE_PATTERN = /^[a-h][1-8]$/;

function isRecord(value: JsonValue): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSquare(value: JsonValue | undefined): value is string {
  return typeof value === "string" && SQUARE_PATTERN.test(value);
}

function isLessonStepType(value: JsonValue | undefined): value is LessonStepType {
  return typeof value === "string" && STEP_TYPES.some((stepType) => stepType === value);
}

function isDifficulty(value: JsonValue | undefined): value is Lesson["difficulty"] {
  return typeof value === "string" && DIFFICULTIES.some((difficulty) => difficulty === value);
}

function isStringArray(value: JsonValue | undefined): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function validateArrows(value: JsonValue | undefined, stepId: string): LessonStep["arrows"] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error(`Lesson step ${stepId} has invalid arrows.`);
  }

  return value.map((arrow) => {
    if (!isRecord(arrow) || !isSquare(arrow.from) || !isSquare(arrow.to)) {
      throw new Error(`Lesson step ${stepId} has an invalid arrow.`);
    }

    return {
      from: arrow.from,
      to: arrow.to,
      ...(typeof arrow.color === "string" ? { color: arrow.color } : {}),
    };
  });
}

function validateStep(step: JsonValue, index: number): LessonStep {
  if (!isRecord(step)) {
    throw new Error(`Lesson step ${index + 1} must be an object.`);
  }

  const id = step.id;
  const type = step.type;

  if (typeof id !== "string" || id.length === 0) {
    throw new Error(`Lesson step ${index + 1} is missing an id.`);
  }

  if (!isLessonStepType(type)) {
    throw new Error(`Lesson step ${id} has an invalid type.`);
  }

  if (step.highlightSquares !== undefined) {
    if (!Array.isArray(step.highlightSquares) || !step.highlightSquares.every(isSquare)) {
      throw new Error(`Lesson step ${id} has invalid highlightSquares.`);
    }
  }

  if (step.acceptedSquares !== undefined) {
    if (!Array.isArray(step.acceptedSquares) || !step.acceptedSquares.every(isSquare)) {
      throw new Error(`Lesson step ${id} has invalid acceptedSquares.`);
    }
  }

  if (step.focusMode !== undefined && typeof step.focusMode !== "boolean") {
    throw new Error(`Lesson step ${id} has invalid focusMode.`);
  }

  if (step.targetSquare !== undefined && !isSquare(step.targetSquare)) {
    throw new Error(`Lesson step ${id} has an invalid targetSquare.`);
  }

  if (step.from !== undefined && !isSquare(step.from)) {
    throw new Error(`Lesson step ${id} has an invalid from square.`);
  }

  if (step.to !== undefined && !isSquare(step.to)) {
    throw new Error(`Lesson step ${id} has an invalid to square.`);
  }

  if (step.options !== undefined) {
    if (!isStringArray(step.options)) {
      throw new Error(`Lesson step ${id} has invalid response options.`);
    }
  }

  if (step.expectedResponses !== undefined) {
    if (!isStringArray(step.expectedResponses)) {
      throw new Error(`Lesson step ${id} has invalid expectedResponses.`);
    }
  }

  const arrows = validateArrows(step.arrows, id);

  return {
    id,
    type,
    ...(typeof step.title === "string" ? { title: step.title } : {}),
    ...(typeof step.speaker === "string" ? { speaker: step.speaker } : {}),
    ...(typeof step.message === "string" ? { message: step.message } : {}),
    ...(typeof step.duration === "number" ? { duration: step.duration } : {}),
    ...(isStringArray(step.options) ? { options: step.options } : {}),
    ...(isStringArray(step.expectedResponses) ? { expectedResponses: step.expectedResponses } : {}),
    ...(typeof step.successMessage === "string" ? { successMessage: step.successMessage } : {}),
    ...(typeof step.failureMessage === "string" ? { failureMessage: step.failureMessage } : {}),
    ...(typeof step.timeoutDuration === "number" ? { timeoutDuration: step.timeoutDuration } : {}),
    ...(typeof step.continueIfTimeout === "boolean" ? { continueIfTimeout: step.continueIfTimeout } : {}),
    ...(isStringArray(step.highlightSquares) ? { highlightSquares: step.highlightSquares } : {}),
    ...(isSquare(step.targetSquare) ? { targetSquare: step.targetSquare } : {}),
    ...(Array.isArray(step.acceptedSquares) && step.acceptedSquares.every(isSquare) ? { acceptedSquares: step.acceptedSquares } : {}),
    ...(typeof step.hint === "string" ? { hint: step.hint } : {}),
    ...(typeof step.focusMode === "boolean" ? { focusMode: step.focusMode } : {}),
    ...(isSquare(step.from) ? { from: step.from } : {}),
    ...(isSquare(step.to) ? { to: step.to } : {}),
    ...(typeof step.expectedMove === "string" ? { expectedMove: step.expectedMove } : {}),
    ...(arrows ? { arrows } : {}),
    ...(typeof step.delay === "number" ? { delay: step.delay } : {}),
  };
}

export function validateLesson(value: JsonValue): Lesson {
  if (!isRecord(value)) {
    throw new Error("Lesson must be an object.");
  }

  if (typeof value.id !== "string" || value.id.length === 0) {
    throw new Error("Lesson is missing an id.");
  }

  if (typeof value.title !== "string" || value.title.length === 0) {
    throw new Error(`Lesson ${value.id} is missing a title.`);
  }

  if (typeof value.description !== "string") {
    throw new Error(`Lesson ${value.id} is missing a description.`);
  }

  if (!isDifficulty(value.difficulty)) {
    throw new Error(`Lesson ${value.id} has an invalid difficulty.`);
  }

  if (!Array.isArray(value.steps)) {
    throw new Error(`Lesson ${value.id} must include steps.`);
  }

  return {
    id: value.id,
    title: value.title,
    description: value.description,
    difficulty: value.difficulty,
    steps: value.steps.map(validateStep),
  };
}
