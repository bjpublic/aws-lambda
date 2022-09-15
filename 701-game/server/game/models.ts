import { ClientGameMessage } from "./messages";

export interface GameStart {
  gameId: string;
  connectionIds: string[];
}

interface ClientDisconnect {
  type: "disconnect";
  connectionId: string;
}

export type GameQueueMessage =
  | (ClientGameMessage & { connectionId: string })
  | ClientDisconnect;

export const worldWidth = 20;
export const worldHeight = 20;
