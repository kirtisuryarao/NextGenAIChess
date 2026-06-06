"use client";

import { useLessonEngine } from "@/hooks/useLessonEngine";

type LessonRendererProps = {
  lessonData?: unknown;
};

export function LessonRenderer({ lessonData }: LessonRendererProps) {
  useLessonEngine(lessonData);

  return null;
}
