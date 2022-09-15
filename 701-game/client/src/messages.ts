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
  world: World;
}
export interface ServerEnd {
  type: "end";
  win: boolean;
}

export type ClientAllMessage = ClientMatch | ClientMove;
export type ClientGameMessage = ClientMove;
export type ServerMessage = ServerStart | ServerUpdate | ServerEnd;

interface Vec2 {
  x: number;
  y: number;
}
type Snake = Vec2[];
export interface World {
  snakes: { [userId: string]: Snake };
  apple: Vec2 | null;
  dead: string[];
}
