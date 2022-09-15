import { World } from "./messages";

export const worldWidth = 20;
export const worldHeight = 20;

export type Tile = "" | "apple" | "me" | "enemy";
export type Board = Tile[][];

export function emptyBoard(): Tile[][] {
  return Array.from({ length: worldHeight }, (_) => Array(worldWidth).fill(""));
}

export function translateWorldToBoard(world: World, myId: string): Board {
  const board = emptyBoard();
  for (const [userId, snake] of Object.entries(world.snakes)) {
    snake.forEach(
      (pos) => (board[pos.y][pos.x] = userId === myId ? "me" : "enemy")
    );
  }
  if (world.apple !== null) {
    board[world.apple.y][world.apple.x] = "apple";
  }
  return board;
}
