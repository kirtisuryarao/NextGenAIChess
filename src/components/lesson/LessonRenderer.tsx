"use client";

import { useLessonEngine } from "@/hooks/useLessonEngine";
import type { JsonValue } from "@/types/lesson";

type LessonRendererProps = {
  lessonData?: JsonValue;
};

export function LessonRenderer({ lessonData }: LessonRendererProps) {
  useLessonEngine(lessonData);

  return null;
}
