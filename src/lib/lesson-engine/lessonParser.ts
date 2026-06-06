import type { Lesson } from "@/types/lesson";
import { validateLesson } from "@/lib/lesson-engine/validation";

export function parseLesson(lessonData: unknown): Lesson {
  return validateLesson(lessonData);
}
