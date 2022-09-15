import { GameQueueMessage, GameStart } from "./models";
import { subscribeFromGameQueue, useRedis } from "../support/redis";

import Player from "./player";
import { ServerMessage } from "./messages";
import { gameSeconds } from "./constants";
import sleep from "../support/sleep";
import snake from "./snake";

export default async function loop({ gameId, connectionIds }: GameStart) {
  console.info({ gameId, connectionIds }, "loop");
  const players: Player[] = connectionIds.map(
    (connectionId) => new Player(connectionId)
  );
  function broadcast(newMessage: (player: Player) => ServerMessage) {
    return Promise.all(
      players.map((player) => player.send(newMessage(player)))
    );
  }
  await useRedis(async (redis) => {
    try {
      const q: GameQueueMessage[] = [];
      await subscribeFromGameQueue(redis, gameId, q);
      try {
        await broadcast((player) => ({ type: "start", id: player.id }));
        const winner = await runGame(q, players);
        await broadcast((player) => ({
          type: "end",
          win: player.id === winner,
        }));
      } finally {
        await Promise.all(players.map((player) => player.disconnect()));
      }
    } catch (error) {
      console.error({ error }, "Main error");
    }
  });
}

async function runGame(
  q: GameQueueMessage[],
  players: Player[]
): Promise<string> {
  const s = snake(
    players.map((player) => player.id),
    gameSeconds
  );

  function broadcastWorld() {
    return Promise.all(
      players.map((player) =>
        player.send({ type: "update", world: s.getWorld() })
      )
    );
  }

  // Queue에 메시지를 가져와서 처리한다.
  function processMessage() {
    const message = q.shift();
    if (message === undefined) {
      return;
    }
    const player = players.find(
      (player) => player.connectionId === message.connectionId
    )!;
    console.info(
      { message, id: player.id, connectionId: player.connectionId },
      "processMessage"
    );
    switch (message.type) {
      case "disconnect":
        player.sendable = false;
        s.leave(player.id);
        break;
      case "move":
        s.move(player.id, message.dir);
        break;
      default:
        // 그 외의 메시지는 모두 버린다.
        break;
    }
  }

  await broadcastWorld();
  while (!s.isEnd()) {
    // 다른 비동기 작업이 실행될 수 있도록 여유를 준다.
    await sleep(0);

    // Queue에 메시지를 가져와서 처리한다.
    processMessage();

    if (s.update()) {
      await broadcastWorld();
    }
  }
  return s.getWinnerId();
}
