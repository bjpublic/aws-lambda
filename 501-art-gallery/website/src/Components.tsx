import { Link, useLocation } from "react-router-dom";
import {
  acceptTraceIdCookie,
  fetchLike,
  fetchRecommendation,
  markAsLike,
} from "./server";

import { Picture } from "./models";
import React from "react";
import { pictureMap } from "./data";

const storageKey = "cookie-agree";
function getCookieAgree(): string | null {
  return localStorage.getItem(storageKey);
}
function updateCookieAgree(agree: boolean) {
  localStorage.setItem(storageKey, `${agree}`);
}

export function CookieAgreement() {
  const [display, setDisplay] = React.useState<boolean>(
    getCookieAgree() === null
  );

  React.useEffect(() => {
    if (getCookieAgree() === "true") {
      acceptTraceIdCookie().catch((error) => console.error(error));
    }
  }, []);
  const accept = React.useCallback(() => {
    setDisplay(false);
    updateCookieAgree(true);
    acceptTraceIdCookie().catch((error) => console.error(error));
  }, []);
  const deny = React.useCallback(() => {
    setDisplay(false);
    updateCookieAgree(false);
  }, []);

  if (!display) {
    return <></>;
  }
  return (
    <div className="CookieAgreement">
      <span>
        개인 맞춤 데이터 제공을 위해 쿠기를 사용하고 있습니다. 쿠키 사용에
        동의하시겠습니까?
      </span>{" "}
      <button onClick={accept}>수락</button>
      <button onClick={deny}>거절</button>
    </div>
  );
}

export function PictureList({ pictures }: { pictures: Picture[] }) {
  return (
    <section className="PictureList">
      {pictures.map((picture) => (
        <Link
          to={`/picture/${picture.id}`}
          key={`${picture.title}-${picture.author}`}
        >
          <PictureListItem picture={picture} />
        </Link>
      ))}
    </section>
  );
}

export function PictureListItem({ picture }: { picture: Picture }) {
  return (
    <>
      <PictureImage picture={picture} />
      <br />
      <span>
        {picture.author}, &lt;{picture.title}&gt;, {picture.year}.
      </span>
    </>
  );
}

export function PictureImage({ picture }: { picture: Picture }) {
  return <img src={`/images/${picture.id}.jpg`} alt={picture.title} />;
}

interface PictureDetailProps {
  picture: Picture;
  onBack: () => void;
  onList: () => void;
}

export function PictureDetail({ picture, onBack, onList }: PictureDetailProps) {
  const [like, setLike] = React.useState<number | null>(null);

  React.useEffect(() => {
    setLike(null);
    fetchLike(picture.id)
      .then(setLike)
      .catch(() => setLike(null));
  }, [picture.id]);

  const onLike = React.useCallback(() => {
    markAsLike(picture.id).then((maybe) =>
      maybe !== null ? setLike(maybe) : alert("지금은 할 수 없습니다.")
    );
  }, [picture.id]);

  return (
    <>
      <section className="PictureDetail">
        <PictureImage picture={picture} />
        <h1>{picture.title}</h1>
        <dl>
          <dt>작가</dt>
          <dd>{picture.author}</dd>
          <dt>제작년도</dt>
          <dd>{picture.year}</dd>
          <dt>해설</dt>
          <dd>{picture.description}</dd>
          <dt>좋아요</dt>
          <dd>{like ?? "..."}</dd>
        </dl>
      </section>
      <div className="Buttons">
        <button onClick={onBack}>뒤로 가기</button>
        <button onClick={onList}>목록</button>
        <button onClick={onLike}>좋아요</button>
      </div>
    </>
  );
}

export function Recommendation({ id }: { id: string }) {
  const [recommend, setRecommend] = React.useState<Picture[] | null>(null);
  React.useEffect(() => {
    setRecommend(null);
    fetchRecommendation(id).then((ids) =>
      setRecommend(ids.map((id) => pictureMap[id]))
    );
  }, [id]);
  return (
    <section className="Recommendation">
      <h2>Recommendation</h2>
      {recommend ? (
        recommend.length > 0 ? (
          <PictureList pictures={recommend} />
        ) : (
          <div>아직 추천할 항목이 없습니다.</div>
        )
      ) : (
        <div>불러오는 중...</div>
      )}
    </section>
  );
}

export function ThanksTo() {
  return (
    <section className="ThanksTo">
      Data from{" "}
      <a href="https://thisartworkdoesnotexist.com/">thisartworkdoesnotexist</a>{" "}
      and <a href="https://github.com/joke2k/faker/">joke2k/faker</a>
    </section>
  );
}

export function ScrollToTop() {
  const location = useLocation();
  React.useLayoutEffect(() => {
    document.documentElement.scrollTo(0, 0);
  }, [location.pathname]);
  return null;
}
