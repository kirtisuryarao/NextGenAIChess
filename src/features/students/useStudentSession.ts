"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MockClassroomSocket } from "@/socket/mockClassroomSocket";
import { bumpStudentProgress, setSpeakingStudent } from "@/services/classroomService";
import { MockStudentRepository } from "@/repositories/StudentRepository";
import { mockStudents } from "@/features/mock-data";
import type { Student } from "@/types/classroom";

export interface StudentSessionState {
  students: Student[];
  topLearners: Student[];
}

/**
 * Encapsulates student roster state and live classroom activity.
 * This hook isolates student-specific behavior from the broader classroom session.
 */
export function useStudentSession(initialStudents: Student[] = mockStudents) {
  const [students, setStudents] = useState<Student[]>(initialStudents);

  useEffect(() => {
    const repository = new MockStudentRepository();
    let isMounted = true;

    repository.listStudents().then((loadedStudents) => {
      if (isMounted) {
        setStudents(loadedStudents);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const socketRef = useRef<MockClassroomSocket | null>(null);

  useEffect(() => {
    const socket = new MockClassroomSocket();
    socketRef.current = socket;

    const unsubscribe = socket.subscribe((event) => {
      if (event.type === "student-progress") {
        setStudents((previous) => bumpStudentProgress(previous, event.studentId, event.delta));
        return;
      }

      if (event.type === "student-speaking") {
        setStudents((previous) => setSpeakingStudent(previous, event.studentId));
      }
    });

    socket.start(initialStudents);

    return () => {
      unsubscribe();
      socket.stop();
      socketRef.current = null;
    };
  }, [initialStudents]);

  const topLearners = useMemo(
    () => [...students].sort((a, b) => b.progress - a.progress).slice(0, 3),
    [students]
  );

  return {
    students,
    topLearners,
  };
}
