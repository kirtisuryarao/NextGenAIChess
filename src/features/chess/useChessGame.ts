"use client";

import { useCallback, useMemo, useState } from "react";
import { Chess, SQUARES, type Color, type PieceSymbol } from "chess.js";
import type { ChessMove, ChessSquare, PromotionPiece, RecordedMove } from "@/types/chess";

type PlayerColor = "white" | "black";

export type ChessMoveHighlight = {
  from: ChessSquare;
  to: ChessSquare;
};

export type UseChessGameReturn = {
  currentFen: string;
  gameFen: string;
  orientation: PlayerColor;
  activePlayer: PlayerColor;
  currentTurn: Color;
  currentPgn: string;
  isCheck: boolean;
  isCheckmate: boolean;
  checkSquare: ChessSquare | null;
  selectedSquare: ChessSquare | null;
  legalMoveTargets: ChessSquare[];
  moveHistory: RecordedMove[];
  currentMoveIndex: number;
  lastMoveHighlight: ChessMoveHighlight | null;
  moveCount: number;
  moveIndexLabel: string;
  canUndo: boolean;
  canRedo: boolean;
  replayGame: (moveCount?: number) => Chess;
  attemptMove: (sourceSquare: string, targetSquare: string) => boolean;
  handleSquareSelect: (square: string) => void;
  navigateToMoveIndex: (targetIndex: number) => void;
  undoMove: () => void;
  redoMove: () => void;
};

const SQUARE_SET: ReadonlySet<string> = new Set(SQUARES);

function isChessSquare(square: string): square is ChessSquare {
  return SQUARE_SET.has(square);
}

function replayMoves(moveHistory: RecordedMove[], moveCount: number) {
  const game = new Chess();

  for (let index = 0; index < moveCount; index += 1) {
    const move = moveHistory[index];
    if (!move) {
      break;
    }

    game.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    });
  }

  return game;
}

function isPromotionPiece(piece: PieceSymbol | undefined): piece is PromotionPiece {
  return piece === "b" || piece === "n" || piece === "q" || piece === "r";
}

function toRecordedMove(move: ChessMove): RecordedMove {
  return {
    color: move.color,
    from: move.from,
    to: move.to,
    piece: move.piece,
    san: move.san,
    flags: move.flags,
    captured: move.captured,
    promotion: isPromotionPiece(move.promotion) ? move.promotion : undefined,
  };
}

function getCheckSquareFromFen(fen: string, turn: Color): ChessSquare | null {
  const board = fen.split(" ")[0];
  const kingSymbol = turn === "w" ? "K" : "k";
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

  const rows = board.split("/");
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    let fileIndex = 0;
    for (const character of rows[rowIndex] ?? "") {
      const emptySquares = Number(character);
      if (Number.isInteger(emptySquares)) {
        fileIndex += emptySquares;
        continue;
      }

      const square = `${files[fileIndex]}${8 - rowIndex}`;
      if (character === kingSymbol && isChessSquare(square)) {
        return square;
      }

      fileIndex += 1;
    }
  }

  return null;
}

function getPromotionPiece(
  sourcePiece: { type: PieceSymbol; color: Color },
  targetSquare: ChessSquare
): PromotionPiece | undefined {
  const isPromotion =
    sourcePiece.type === "p" &&
    ((sourcePiece.color === "w" && targetSquare.endsWith("8")) ||
      (sourcePiece.color === "b" && targetSquare.endsWith("1")));

  return isPromotion ? "q" : undefined;
}

/**
 * Owns all chess-domain state and commands: legal move discovery, move replay,
 * history navigation, selection highlights, FEN/PGN generation, and check status.
 */
export function useChessGame(): UseChessGameReturn {
  const [moveHistory, setMoveHistory] = useState<RecordedMove[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<ChessSquare | null>(null);
  const [legalMoveTargets, setLegalMoveTargets] = useState<ChessSquare[]>([]);

  const currentGame = useMemo(() => replayMoves(moveHistory, currentMoveIndex), [currentMoveIndex, moveHistory]);
  const currentFen = currentGame.fen();
  const currentTurn = currentGame.turn();
  const currentPgn = currentGame.pgn();
  const isCheck = currentGame.isCheck();
  const isCheckmate = currentGame.isCheckmate();
  const lastMove = currentMoveIndex > 0 ? moveHistory[currentMoveIndex - 1] ?? null : null;

  const replayGame = useCallback(
    (moveCount = currentMoveIndex) => replayMoves(moveHistory, moveCount),
    [currentMoveIndex, moveHistory]
  );

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalMoveTargets([]);
  }, []);

  const selectSquare = useCallback(
    (square: ChessSquare) => {
      const legalMoves = currentGame.moves({ square, verbose: true });
      setSelectedSquare(square);
      setLegalMoveTargets(legalMoves.map((move) => move.to));
    },
    [currentGame]
  );

  const attemptMove = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!isChessSquare(sourceSquare) || !isChessSquare(targetSquare)) {
        return false;
      }

      const game = replayMoves(moveHistory, currentMoveIndex);
      const sourcePiece = game.get(sourceSquare);

      if (!sourcePiece) {
        return false;
      }

      const promotion = getPromotionPiece(sourcePiece, targetSquare);
      const legalMoves = game.moves({ square: sourceSquare, verbose: true });
      const move = legalMoves.find(
        (legalMove) =>
          legalMove.to === targetSquare &&
          (promotion ? legalMove.promotion === promotion : !legalMove.promotion)
      );

      if (!move) {
        return false;
      }

      const nextMove = toRecordedMove(move);

      setMoveHistory((previousHistory) => [...previousHistory.slice(0, currentMoveIndex), nextMove]);
      setCurrentMoveIndex((previousIndex) => Math.min(previousIndex + 1, currentMoveIndex + 1));
      clearSelection();
      return true;
    },
    [clearSelection, currentMoveIndex, moveHistory]
  );

  const handleSquareSelect = useCallback(
    (square: string) => {
      if (!isChessSquare(square)) {
        clearSelection();
        return;
      }

      const clickedPiece = currentGame.get(square);

      if (selectedSquare) {
        if (selectedSquare === square) {
          clearSelection();
          return;
        }

        if (attemptMove(selectedSquare, square)) {
          return;
        }
      }

      if (clickedPiece && clickedPiece.color === currentTurn) {
        selectSquare(square);
        return;
      }

      clearSelection();
    },
    [attemptMove, clearSelection, currentGame, currentTurn, selectedSquare, selectSquare]
  );

  const navigateToMoveIndex = useCallback(
    (targetIndex: number) => {
      const clampedIndex = Math.max(0, Math.min(targetIndex, moveHistory.length));
      setCurrentMoveIndex(clampedIndex);
      clearSelection();
    },
    [clearSelection, moveHistory.length]
  );

  const undoMove = useCallback(() => {
    setCurrentMoveIndex((previousIndex) => Math.max(previousIndex - 1, 0));
    clearSelection();
  }, [clearSelection]);

  const redoMove = useCallback(() => {
    setCurrentMoveIndex((previousIndex) => Math.min(previousIndex + 1, moveHistory.length));
    clearSelection();
  }, [clearSelection, moveHistory.length]);

  const moveCount = moveHistory.length;
  const canUndo = currentMoveIndex > 0;
  const canRedo = currentMoveIndex < moveHistory.length;

  return {
    currentFen,
    gameFen: currentFen,
    orientation: "white",
    activePlayer: currentTurn === "w" ? "white" : "black",
    currentTurn,
    currentPgn,
    isCheck,
    isCheckmate,
    checkSquare: isCheck ? getCheckSquareFromFen(currentFen, currentTurn) : null,
    selectedSquare,
    legalMoveTargets,
    moveHistory,
    currentMoveIndex,
    lastMoveHighlight: lastMove ? { from: lastMove.from, to: lastMove.to } : null,
    moveCount,
    moveIndexLabel: currentMoveIndex === 0 ? "Start" : `Move ${currentMoveIndex}`,
    canUndo,
    canRedo,
    replayGame,
    attemptMove,
    handleSquareSelect,
    navigateToMoveIndex,
    undoMove,
    redoMove,
  };
}
