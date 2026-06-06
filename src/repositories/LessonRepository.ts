import day1BoardCoordinates from "@/data/lessons/day1-board-coordinates.json";
import { parseLesson } from "@/lib/lesson-engine/lessonParser";
import type { Lesson } from "@/types/lesson";

const mockLessons = [parseLesson(day1BoardCoordinates)];

export interface LessonRepository {
  listLessons(): Promise<Lesson[]>;
  getLessonById(lessonId: string): Promise<Lesson | null>;
}

export class MockLessonRepository implements LessonRepository {
  async listLessons() {
    return mockLessons;
  }

  async getLessonById(lessonId: string) {
    return mockLessons.find((lesson) => lesson.id === lessonId) ?? null;
  }
}
