import { Picture } from "./models";
import dataJson from "./data.json";

const source = dataJson as { [id: string]: Omit<Picture, "id"> };
export const pictures: Picture[] = Object.entries(source).map(
  ([id, remain]) => ({ ...remain, id })
);
export const pictureMap: { [id: string]: Picture } = pictures.reduce(
  (map, picture) => Object.assign(map, { [picture.id]: picture }),
  {}
);
