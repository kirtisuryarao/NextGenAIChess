/**
 * API layer placeholder for the classroom domain.
 *
 * In a production-ready architecture, this module will host the HTTP / RPC
 * adapter for classroom session state, student updates, and transcript persistence.
 */

export async function fetchClassroomSession(sessionId: string) {
  // TODO: wire to a real backend or Supabase when the data layer is ready.
  return Promise.resolve({
    id: sessionId,
    lessonId: "day1",
    title: "AI Chess Classroom",
    startedAt: Date.now(),
    status: "active",
    students: [],
    transcriptMessages: [],
    moveHistory: [],
    currentMoveIndex: 0,
  });
}
