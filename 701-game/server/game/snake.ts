import { worldHeight, worldWidth } from "./models";

import { MoveDirection } from "./messages";
import timer from "./timer";

interface Vec2 {
  x: number;
  y: number;
}

function vec2Equals(v1: Vec2, v2: Vec2): boolean {
  return v1.x === v2.x && v1.y === v2.y;
}

function vec2Plus(v1: Vec2, v2: Vec2): Vec2 {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

const zeroVec2: Vec2 = { x: 0, y: 0 };
const dirVec: { [Dir in MoveDirection]: Vec2 } = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
};

type Snake = Vec2[];

interface PlayerMapOf<T> {
  [playerId: string]: T;
}

interface World {
  snakes: PlayerMapOf<Snake>;
  apple: Vec2 | null;
  dead: string[];
}

export default function snake(playerIds: string[], gameSeconds: number) {
  const world: World = { snakes: {}, apple: null, dead: [] };
  const dirs: PlayerMapOf<Vec2> = {};

  function snakes() {
    return Object.values(world.snakes);
  }

  function isApple(target: Vec2): boolean {
    return world.apple !== null && vec2Equals(world.apple, target);
  }

  function isSnake(target: Vec2): boolean {
    return snakes().some((snake) =>
      snake.some((pos) => vec2Equals(pos, target))
    );
  }

  function isBlank(target: Vec2): boolean {
    return !isApple(target) && !isSnake(target);
  }

  function isOutOfBound({ x, y }: Vec2): boolean {
    return x < 0 || y < 0 || x >= worldWidth || y >= worldHeight;
  }

  function isFull(): boolean {
    const count = snakes().reduce((sum, snake) => sum + snake.length, 0);
    return count === worldHeight * worldWidth;
  }

  function randomVec2(): Vec2 | null {
    for (let i = 0; i < 10; +i) {
      const x = Math.floor(Math.random() * worldWidth);
      const y = Math.floor(Math.random() * worldHeight);
      if (isBlank({ x, y })) return { x, y };
    }
    for (let y = 0; y < worldHeight; ++y) {
      for (let x = 0; x < worldWidth; ++x) {
        if (isBlank({ x, y })) return { x, y };
      }
    }
    return null;
  }

  // 접속자 게임 정보 초기화
  playerIds.forEach((playerId) => {
    world.snakes[playerId] = [randomVec2()!];
    dirs[playerId] = zeroVec2;
  });

  function updateSnake(playerId: string, snake: Snake): boolean {
    if (world.dead.includes(playerId)) {
      return false;
    }
    const dir = dirs[playerId];
    if (vec2Equals(dir, zeroVec2)) {
      return false;
    }
    const head = vec2Plus(snake[0], dir);
    if (isApple(head)) {
      snake.unshift(head);
      world.apple = null;
    } else if (isSnake(head) || isOutOfBound(head)) {
      world.dead.push(playerId);
    } else {
      snake.unshift(head);
      snake.pop();
    }
    return true;
  }

  function updateSnakes(): boolean {
    let updated = false;
    for (const [playerId, snake] of Object.entries(world.snakes)) {
      updated = updateSnake(playerId, snake) || updated;
    }
    return updated;
  }

  const spawnTimer = timer(1000);
  const moveTimer = timer(200);
  function update(): boolean {
    let updated = false;
    if (spawnTimer() && world.apple === null) {
      updated = true;
      world.apple = randomVec2();
    }
    if (moveTimer()) {
      updated = updateSnakes() || updated;
    }
    return updated;
  }

  function move(playerId: string, dir: MoveDirection) {
    if (world.dead.includes(playerId)) {
      return;
    }
    const snake: Snake = world.snakes[playerId];
    const newDir: Vec2 = dirVec[dir];
    if (snake.length === 1) {
      dirs[playerId] = newDir;
    } else {
      const head = snake[0];
      const second = snake[1];
      if (!vec2Equals(second, vec2Plus(head, newDir))) {
        dirs[playerId] = newDir;
      }
    }
  }

  function leave(playerId: string) {
    if (!world.dead.includes(playerId)) {
      world.dead.push(playerId);
    }
  }

  const startMillis = Date.now();
  function isEnd(): boolean {
    const timeout = Date.now() - startMillis >= gameSeconds * 1000;
    const oneWinner = playerIds.length - world.dead.length === 1;
    return timeout || oneWinner || isFull();
  }

  function getWinnerId(): string {
    const winner = playerIds.find((playerId) => !world.dead.includes(playerId));
    if (winner) {
      return winner;
    }
    const sorted = Object.entries(world.snakes)
      .map(([playerId, snake]) => ({ id: playerId, score: snake.length }))
      .sort((player1, player2) => player2.score - player1.score);
    if (sorted[0].score !== sorted[1].score) {
      return sorted[0].id;
    }
    return "draw";
  }

  function getWorld() {
    return world;
  }

  return { update, move, leave, isEnd, getWinnerId, getWorld };
}
