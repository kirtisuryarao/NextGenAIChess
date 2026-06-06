import type { Lesson, LessonStep, LessonStepType } from "@/types/lesson";

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
];
const DIFFICULTIES: Lesson["difficulty"][] = ["beginner", "intermediate", "advanced"];
const SQUARE_PATTERN = /^[a-h][1-8]$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSquare(value: unknown) {
  return typeof value === "string" && SQUARE_PATTERN.test(value);
}

function validateStep(step: unknown, index: number): LessonStep {
  if (!isRecord(step)) {
    throw new Error(`Lesson step ${index + 1} must be an object.`);
  }

  if (typeof step.id !== "string" || step.id.length === 0) {
    throw new Error(`Lesson step ${index + 1} is missing an id.`);
  }

  if (typeof step.type !== "string" || !STEP_TYPES.includes(step.type as LessonStepType)) {
    throw new Error(`Lesson step ${step.id} has an invalid type.`);
  }

  if (step.highlightSquares !== undefined) {
    if (!Array.isArray(step.highlightSquares) || !step.highlightSquares.every(isSquare)) {
      throw new Error(`Lesson step ${step.id} has invalid highlightSquares.`);
    }
  }

  if (step.targetSquare !== undefined && !isSquare(step.targetSquare)) {
    throw new Error(`Lesson step ${step.id} has an invalid targetSquare.`);
  }

  if (step.from !== undefined && !isSquare(step.from)) {
    throw new Error(`Lesson step ${step.id} has an invalid from square.`);
  }

  if (step.to !== undefined && !isSquare(step.to)) {
    throw new Error(`Lesson step ${step.id} has an invalid to square.`);
  }

  if (step.arrows !== undefined) {
    if (!Array.isArray(step.arrows)) {
      throw new Error(`Lesson step ${step.id} has invalid arrows.`);
    }

    for (const arrow of step.arrows) {
      if (!isRecord(arrow) || !isSquare(arrow.from) || !isSquare(arrow.to)) {
        throw new Error(`Lesson step ${step.id} has an invalid arrow.`);
      }
    }
  }

  if (step.options !== undefined) {
    if (!Array.isArray(step.options) || !step.options.every((option) => typeof option === "string")) {
      throw new Error(`Lesson step ${step.id} has invalid response options.`);
    }
  }

  if (step.expectedResponses !== undefined) {
    if (!Array.isArray(step.expectedResponses) || !step.expectedResponses.every((response) => typeof response === "string")) {
      throw new Error(`Lesson step ${step.id} has invalid expectedResponses.`);
    }
  }

  return step as unknown as LessonStep;
}

export function validateLesson(value: unknown): Lesson {
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

  if (typeof value.difficulty !== "string" || !DIFFICULTIES.includes(value.difficulty as Lesson["difficulty"])) {
    throw new Error(`Lesson ${value.id} has an invalid difficulty.`);
  }

  if (!Array.isArray(value.steps)) {
    throw new Error(`Lesson ${value.id} must include steps.`);
  }

  return {
    id: value.id,
    title: value.title,
    description: value.description,
    difficulty: value.difficulty as Lesson["difficulty"],
    steps: value.steps.map(validateStep),
  };
}
