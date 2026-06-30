import { useEffect, useState } from 'react';
import { Chessboard } from 'react-chessboard';

type BoardArrow = {
  startSquare: string;
  endSquare: string;
  color: string;
};

type ChessBoardPanelProps = {
  fen: string;
  boardOrientation: 'white' | 'black';
  arrows: BoardArrow[];
  onPieceDrop: (args: {
    sourceSquare: string;
    targetSquare: string | null;
  }) => boolean;
};

/**
 * Responsive chessboard with engine suggestion arrows and manual move entry.
 */
export function ChessBoardPanel({
  fen,
  boardOrientation,
  arrows,
  onPieceDrop,
}: ChessBoardPanelProps) {
  const [boardWidth, setBoardWidth] = useState(320);

  useEffect(() => {
    const updateWidth = () => {
      const horizontalPadding = 32;
      const maxWidth = 520;
      const nextWidth = Math.min(
        window.innerWidth - horizontalPadding,
        maxWidth,
      );
      setBoardWidth(Math.max(280, nextWidth));
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <div className="board-panel">
      <Chessboard
        options={{
          position: fen,
          boardOrientation,
          arrows,
          allowDrawingArrows: false,
          clearArrowsOnPositionChange: false,
          boardStyle: {
            width: boardWidth,
            maxWidth: '100%',
            borderRadius: '8px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
          },
          darkSquareStyle: { backgroundColor: '#769656' },
          lightSquareStyle: { backgroundColor: '#eeeed2' },
          onPieceDrop: ({ sourceSquare, targetSquare }) =>
            onPieceDrop({ sourceSquare, targetSquare }),
        }}
      />
    </div>
  );
}
