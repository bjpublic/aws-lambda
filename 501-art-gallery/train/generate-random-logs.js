const fs = require("fs");
const os = require("os");
const path = require("path");

// 작품 ID를 미리 가져옴.
const ids = Object.keys(
  JSON.parse(fs.readFileSync("../website/src/data.json", "utf-8"))
);

function rand(max, min = 0) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// 100개의 로그 데이터 파일 생성.
Array.from({ length: 100 }).forEach((_, logIndex) => {
  // 하나의 로그 데이터 파일은 50,000~100,000개의 로그 행을 갖는다.
  const data = Array.from({ length: rand(100000, 50000) }, () =>
    // 하나의 로그 행은 5~15개의 작품 ID를 갖는다.
    Array.from({ length: rand(15, 5) }, () => ids[rand(ids.length)]).join(" ")
  ).join("\n");

  // 학습 파일은 "main.py"에서 읽는 "/tmp"에 저장한다.
  const logFile = path.join(os.tmpdir(), `event.2022-00-${logIndex + 1}.log`);
  fs.writeFileSync(logFile, data + "\n", "utf-8");
  console.info({ logFile }, "Generated");
});
