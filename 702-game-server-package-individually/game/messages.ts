export interface ClientMatch {
  type: "match";
}
export interface ServerStart {
  type: "start";
  id: string;
}

export type MoveDirection = "left" | "right" | "up" | "down";

export interface ClientMove {
  type: "move";
  dir: MoveDirection;
}
export interface ServerUpdate {
  type: "update";
  world: unknown;
}
export interface ServerEnd {
  type: "end";
  win: boolean;
}

export type ClientAllMessage = ClientMatch | ClientMove;
export type ClientGameMessage = ClientMove;
export type ServerMessage = ServerStart | ServerUpdate | ServerEnd;
