"use client";

type SquareHighlightsProps = {
  highlightedSquares: string[];
  color?: string;
  glowColor?: string;
  borderColor?: string;
  pulse?: boolean;
  orientation?: "white" | "black";
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

function getSquarePosition(square: string, orientation: "white" | "black") {
  const file = square[0];
  const rank = Number(square[1]);
  const fileIndex = FILES.indexOf(file);
  const rankIndex = 8 - rank;

  if (fileIndex < 0 || Number.isNaN(rankIndex)) {
    return null;
  }

  if (orientation === "black") {
    return {
      left: `${((7 - fileIndex) / 8) * 100}%`,
      top: `${((7 - rankIndex) / 8) * 100}%`,
    };
  }

  return {
    left: `${(fileIndex / 8) * 100}%`,
    top: `${(rankIndex / 8) * 100}%`,
  };
}

export function SquareHighlights({
  highlightedSquares,
  color = "rgba(34, 197, 94, 0.38)",
  glowColor = "rgba(34,197,94,0.8)",
  borderColor = "rgba(187, 247, 208, 0.9)",
  pulse = true,
  orientation = "white",
}: SquareHighlightsProps) {
  if (highlightedSquares.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-lg">
      {highlightedSquares.map((square) => {
        const position = getSquarePosition(square, orientation);
        if (!position) {
          return null;
        }

        return (
          <div
            key={square}
            className={`absolute ring-2 shadow-lg ${pulse ? "animate-pulse" : ""}`}
            style={{
              ...position,
              width: "12.5%",
              height: "12.5%",
              backgroundColor: color,
              borderColor,
              boxShadow: `inset 0 0 0 2px ${borderColor}, 0 0 20px ${glowColor}`,
            }}
          />
        );
      })}
    </div>
  );
}
