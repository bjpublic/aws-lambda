import { Board, Tile } from "../models";

import React from "react";

function BoardTileView({ tile }: { tile: Tile }) {
  switch (tile) {
    case "apple":
      return <td className="Apple" />;
    case "me":
      return <td className="Me" />;
    case "enemy":
      return <td className="Enemy" />;
    default:
      return <td />;
  }
}

const MemoizeBoardTitleView = React.memo(BoardTileView);

function BoardRowView({ row }: { row: Tile[] }) {
  return (
    <tr>
      {row.map((tile, index) => (
        <MemoizeBoardTitleView key={`t${index}`} tile={tile} />
      ))}
    </tr>
  );
}

const MemoizeBoardRowView = React.memo(BoardRowView, (prev, next) =>
  prev.row.every((old, index) => old === next.row[index])
);

export default function BoardView({ board }: { board: Board }) {
  return (
    <table className="BoardView" cellPadding={0} cellSpacing={0}>
      <tbody>
        {board.map((row, index) => (
          <MemoizeBoardRowView key={`r${index}`} row={row} />
        ))}
      </tbody>
    </table>
  );
}
