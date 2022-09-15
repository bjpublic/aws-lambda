import { Board, emptyBoard, translateWorldToBoard } from "./models";
import { MoveDirection, ServerMessage } from "./messages";

import BoardView from "./components/BoardView";
import Help from "./components/Help";
import React from "react";
import Result from "./components/Result";
import Stick from "./components/Stick";
import { openConnection } from "./connection";

export default function App() {
  const [start, setStart] = React.useState<boolean>(false);
  const [board, setBoard] = React.useState<Board>(emptyBoard());
  const [win, setWin] = React.useState<boolean | null>(null);

  // 서버에서 도착한 메시지로 상태를 갱신한다.
  const onServerMessage = React.useCallback(
    (context: { myId: string }, message: ServerMessage) => {
      console.info(message);
      switch (message.type) {
        case "start":
          setStart(true);
          context.myId = message.id;
          break;
        case "update":
          setBoard(translateWorldToBoard(message.world, context.myId));
          break;
        case "end":
          setWin(message.win);
          break;
      }
    },
    []
  );

  // 웹 소켓 연결을 유지한다.
  const ws = React.useRef<WebSocket>();
  React.useEffect(() => {
    if (ws.current === undefined) {
      ws.current = openConnection({ myId: "" }, onServerMessage);
    }
  }, [onServerMessage]);

  // 방향을 전환했을 때 서버로 ClientMove 메시지를 전달한다.
  const onMove = React.useCallback(
    function (dir: MoveDirection) {
      if (!ws.current) {
        return;
      }
      if (ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "move", dir }));
      }
    },
    [ws]
  );

  return !start ? (
    <div>Waiting</div>
  ) : (
    <>
      <Result win={win} />
      <BoardView board={board} />
      <Help />
      <Stick onMove={onMove} />
    </>
  );
}
