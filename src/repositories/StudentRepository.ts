import { mockStudents } from "@/features/mock-data";
import type { Student } from "@/types/classroom";

export interface StudentRepository {
  listStudents(): Promise<Student[]>;
  getStudentById(studentId: string): Promise<Student | null>;
}

export class MockStudentRepository implements StudentRepository {
  async listStudents() {
    return mockStudents;
  }

  async getStudentById(studentId: string) {
    return mockStudents.find((student) => student.id === studentId) ?? null;
  }
}
