import { MoveDirection } from "../messages";
import React from "react";

function Stick({ onMove }: { onMove: (dir: MoveDirection) => void }) {
  React.useEffect(() => {
    function move(event: KeyboardEvent) {
      switch (event.key) {
        case "ArrowLeft":
          onMove("left");
          break;
        case "ArrowRight":
          onMove("right");
          break;
        case "ArrowUp":
          onMove("up");
          break;
        case "ArrowDown":
          onMove("down");
          break;
      }
    }
    window.addEventListener("keydown", move);
    return () => window.removeEventListener("keydown", move);
  }, [onMove]);

  function Arrow({ label, dir }: { label: string; dir: MoveDirection }) {
    return (
      <td className="Arrow" onClick={() => onMove(dir)}>
        {label}
      </td>
    );
  }

  return (
    <table className="Stick">
      <tbody>
        <tr>
          <td />
          <Arrow label="↑" dir="up" />
          <td />
        </tr>
        <tr>
          <Arrow label="←" dir="left" />
          <td />
          <Arrow label="→" dir="right" />
        </tr>
        <tr>
          <td />
          <Arrow label="↓" dir="down" />
          <td />
        </tr>
      </tbody>
    </table>
  );
}

export default React.memo(Stick);
