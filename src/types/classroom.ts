import type { RecordedMove } from "@/types/chess";
import type { Lesson } from "@/types/lesson";
import type { TranscriptMessage } from "@/types/transcript";

export interface Student {
  id: string;
  name: string;
  avatarUrl: string;
  progress: number;
  active?: boolean;
  speaking?: boolean;
}

export interface ClassroomSession {
  id: string;
  lessonId: Lesson["id"];
  title: string;
  startedAt: number;
  endedAt?: number;
  students: Student[];
  transcriptMessages: TranscriptMessage[];
  moveHistory: RecordedMove[];
  currentMoveIndex: number;
  status: "idle" | "active" | "completed";
}
