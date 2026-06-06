import type { TranscriptMessage } from "@/types/transcript";

export interface TranscriptRepository {
  listMessages(sessionId: string): Promise<TranscriptMessage[]>;
  addMessage(sessionId: string, message: TranscriptMessage): Promise<TranscriptMessage>;
}

export class InMemoryTranscriptRepository implements TranscriptRepository {
  private messagesBySession = new Map<string, TranscriptMessage[]>();

  async listMessages(sessionId: string) {
    return this.messagesBySession.get(sessionId) ?? [];
  }

  async addMessage(sessionId: string, message: TranscriptMessage) {
    const messages = this.messagesBySession.get(sessionId) ?? [];
    this.messagesBySession.set(sessionId, [...messages, message]);
    return message;
  }
}
