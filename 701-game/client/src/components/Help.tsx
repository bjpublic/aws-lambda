import React from "react";

function Help() {
  return (
    <span className="Help">
      <i className="Me" /> 녹색: 나 / <i className="Enemy" /> 파란색: 적 /{" "}
      <i className="Apple" /> 빨간색: 사과
    </span>
  );
}

export default React.memo(Help);
