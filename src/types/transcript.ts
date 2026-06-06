export type TranscriptMessageType = "ai" | "student" | "system" | "success" | "error";

export interface TranscriptMessage {
  id: string;
  type: TranscriptMessageType;
  sender: string;
  message: string;
  timestamp: number;
}

export type TranscriptMessageInput = Omit<TranscriptMessage, "id" | "timestamp"> &
  Partial<Pick<TranscriptMessage, "id" | "timestamp">>;
