import { mockClassroomActivityFeed } from "@/features/mock-data";
import type { Student } from "@/types/classroom";

export type SocketEvent =
  | {
      type: "student-progress";
      studentId: string;
      delta: number;
    }
  | {
      type: "student-speaking";
      studentId: string;
    }
  | {
      type: "activity";
      title: string;
      tone: "info" | "success";
    };

type Listener = (event: SocketEvent) => void;

export class MockClassroomSocket {
  private listeners = new Set<Listener>();
  private timerId: ReturnType<typeof setInterval> | null = null;

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  start(students: Student[]) {
    if (this.timerId || students.length === 0) {
      return;
    }

    this.timerId = setInterval(() => {
      const picked = students[Math.floor(Math.random() * students.length)];
      const mode = Math.random();

      if (mode < 0.45) {
        this.emit({ type: "student-progress", studentId: picked.id, delta: 1 + Math.floor(Math.random() * 4) });
        return;
      }

      if (mode < 0.8) {
        this.emit({ type: "student-speaking", studentId: picked.id });
        return;
      }

      const label = mockClassroomActivityFeed[Math.floor(Math.random() * mockClassroomActivityFeed.length)];
      this.emit({
        type: "activity",
        title: `${picked.name.split(" ")[0]} ${label}`,
        tone: Math.random() > 0.55 ? "success" : "info",
      });
    }, 4500);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private emit(event: SocketEvent) {
    this.listeners.forEach((listener) => listener(event));
  }
}
