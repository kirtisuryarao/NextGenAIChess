import type { Color, Move as ChessJsMove, PieceSymbol, Square } from "chess.js";

export type ChessSquare = Square;
export type ChessMove = ChessJsMove;
export type PromotionPiece = Extract<PieceSymbol, "b" | "n" | "q" | "r">;

export type RecordedMove = {
  color: Color;
  from: ChessSquare;
  to: ChessSquare;
  piece: PieceSymbol;
  san: string;
  flags: string;
  captured?: PieceSymbol;
  promotion?: PromotionPiece;
};
