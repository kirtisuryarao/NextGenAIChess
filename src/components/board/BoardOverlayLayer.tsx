"use client";

import { SquareHighlights } from "@/components/board/SquareHighlights";

type BoardOverlayLayerProps = {
  highlightedSquares: string[];
  feedback?: { squares: string[]; status: "success" | "failure"; nonce: number } | null;
  orientation?: "white" | "black";
};

export function BoardOverlayLayer({ highlightedSquares, feedback, orientation = "white" }: BoardOverlayLayerProps) {
  return (
    <>
      <SquareHighlights
        highlightedSquares={highlightedSquares}
        orientation={orientation}
        color="rgba(34, 197, 94, 0.26)"
        pulse
      />
      {feedback ? (
        <SquareHighlights
          key={feedback.nonce}
          highlightedSquares={feedback.squares}
          orientation={orientation}
          color={feedback.status === "success" ? "rgba(34, 197, 94, 0.42)" : "rgba(248, 113, 113, 0.42)"}
          glowColor={feedback.status === "success" ? "rgba(34,197,94,0.9)" : "rgba(248,113,113,0.9)"}
          borderColor={feedback.status === "success" ? "rgba(187,247,208,0.95)" : "rgba(254,202,202,0.95)"}
          pulse
        />
      ) : null}
    </>
  );
}
