import type { LessonStep, TeacherStatus } from "@/types/lesson";
import type { TranscriptMessage } from "@/types/transcript";

export type LessonExecutionHandlers = {
  setOverlayMessage: (message: string | null) => void;
  setCurrentDialogue: (message: string | null) => void;
  setCurrentSpeaker: (speaker: string) => void;
  setTeacherStatus: (status: TeacherStatus) => void;
  addTranscriptMessage: (
    message: Omit<TranscriptMessage, "id" | "timestamp"> & Partial<Pick<TranscriptMessage, "id" | "timestamp">>
  ) => void;
  setHighlightedSquares: (squares: string[]) => void;
  setArrows: (arrows: NonNullable<LessonStep["arrows"]>) => void;
};

function getTeacherStatusForStep(step: LessonStep): TeacherStatus {
  switch (step.type) {
    case "click-square":
    case "wait-response":
    case "multiple-choice":
    case "text-response":
      return "waiting";

    case "move-piece":
    case "arrow":
    case "board-demo":
      return "explaining";

    case "celebration":
      return "celebrating";

    case "highlight":
    case "ai-dialogue":
    case "reaction":
    case "system-event":
      return "teaching";

    default:
      return "idle";
  }
}

export function executeLessonStep(step: LessonStep | null | undefined, handlers: LessonExecutionHandlers) {
  handlers.setOverlayMessage(step?.message ?? null);
  handlers.setCurrentDialogue(step?.message ?? null);
  handlers.setCurrentSpeaker(step?.speaker ?? "Coco");
  handlers.setTeacherStatus(step ? getTeacherStatusForStep(step) : "idle");
  handlers.setHighlightedSquares([]);
  handlers.setArrows([]);

  if (!step) {
    return;
  }

  if (step.message) {
    handlers.addTranscriptMessage({
      id: `lesson-step-${step.id}`,
      type: step.type === "celebration" ? "success" : step.type === "system-event" ? "system" : "ai",
      sender: step.speaker ?? (step.type === "system-event" ? "Classroom" : "Coco"),
      message: step.message,
    });
  }

  switch (step.type) {
    case "ai-dialogue":
    case "pause":
    case "wait-response":
    case "multiple-choice":
    case "text-response":
    case "reaction":
    case "system-event":
    case "celebration":
      break;

    case "highlight":
      handlers.setHighlightedSquares(step.highlightSquares ?? []);
      break;

    case "click-square":
      handlers.setHighlightedSquares(step.targetSquare ? [step.targetSquare] : []);
      break;

    case "move-piece":
      handlers.setHighlightedSquares([step.from, step.to].filter(Boolean) as string[]);
      handlers.setArrows(step.from && step.to ? [{ from: step.from, to: step.to, color: "#22c55e" }] : []);
      break;

    case "arrow":
    case "board-demo":
      handlers.setArrows(step.arrows ?? []);
      handlers.setHighlightedSquares(step.highlightSquares ?? []);
      break;

    default:
      break;
  }
}
