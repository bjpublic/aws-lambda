import {
  PictureDetail,
  PictureList,
  Recommendation,
  ThanksTo,
} from "./Components";
import { pictureMap, pictures } from "./data";
import { useNavigate, useParams } from "react-router-dom";

import Fuse from "fuse.js";
import React from "react";

const limit = 9;
const fuse = new Fuse(pictures, {
  keys: ["title", "author", "description"],
});

export function GalleryPage() {
  const navigate = useNavigate();
  const { keyword } = useParams<{ keyword: string }>();

  const searched = keyword
    ? fuse
        .search(keyword)
        .map((each) => each.item)
        .slice(0, limit)
    : pictures.slice(0, limit);

  const doSearch = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      event.target.value
        ? navigate(`/search/${event.target.value}`)
        : navigate("/"),
    [navigate]
  );

  return (
    <div className="Page">
      <input
        className="SearchBox"
        type="text"
        defaultValue={keyword ?? ""}
        onChange={doSearch}
        placeholder="검색"
      />
      <PictureList pictures={searched} />
      <ThanksTo />
    </div>
  );
}

export function PicturePage() {
  const { id } = useParams<"id">();
  const navigate = useNavigate();
  const picture = pictureMap[id!];
  return (
    <div className="Page">
      <PictureDetail
        picture={picture}
        onBack={() => navigate(-1)}
        onList={() => navigate("/")}
      />
      <Recommendation id={id!} />
      <ThanksTo />
    </div>
  );
}
