export type ChessMoveRecord = {
  color: "w" | "b";
  from: string;
  to: string;
  piece: string;
  san: string;
  flags: string;
  captured?: string;
  promotion?: string;
};
