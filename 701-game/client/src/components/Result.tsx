import React from "react";

function Result({ win }: { win: boolean | null }) {
  return (
    <span className="Result">
      {win !== null ? (win ? "승리!" : "패배!") : "-"}
    </span>
  );
}

export default React.memo(Result);
