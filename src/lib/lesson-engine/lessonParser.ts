import type { JsonValue, Lesson } from "@/types/lesson";
import { validateLesson } from "@/lib/lesson-engine/validation";

export function parseLesson(lessonData: JsonValue): Lesson {
  return validateLesson(lessonData);
}
