import { doMatch } from "../game/match";
import { useRedis } from "../support/redis";

export const handleMatch = async () => {
  await useRedis((redis) => doMatch(redis, Date.now() + 890 * 1000));
};
