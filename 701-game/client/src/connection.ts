import { ServerMessage } from "./messages";

export function openConnection<C>(
  context: C,
  onMessage: (context: C, message: ServerMessage) => void
) {
  console.info("Open connection");

  const ws = new WebSocket(process.env.REACT_APP_WSS_URL!);

  ws.addEventListener("open", () => {
    console.info("Connected");
    // 연결되자마자 매칭을 요청한다.
    ws.send(JSON.stringify({ type: "match" }));
  });
  ws.addEventListener("close", () => console.info("Disconnected"));

  // 메시지가 도착했을 때 "context"를 건네줘 바깥에서 상태를 유지할 수 있도록 돕는다.
  ws.addEventListener("message", (event) =>
    onMessage(context, JSON.parse(event.data))
  );
  return ws;
}
