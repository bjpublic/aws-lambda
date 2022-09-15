import { GameStart } from "../game/models";
import loop from "../game/loop";

export const handleGame = async (start: GameStart) => {
  await loop(start);
};
