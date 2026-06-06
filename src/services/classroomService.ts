import type { Student } from "@/types/classroom";

export function formatTimer(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function bumpStudentProgress(students: Student[], studentId: string, delta: number) {
  return students.map((student) => {
    if (student.id !== studentId) {
      return student;
    }

    return {
      ...student,
      progress: Math.min(100, student.progress + delta),
    };
  });
}

export function setSpeakingStudent(students: Student[], studentId: string) {
  return students.map((student) => ({
    ...student,
    speaking: student.id === studentId,
    active: student.id === studentId ? true : student.active,
  }));
}

