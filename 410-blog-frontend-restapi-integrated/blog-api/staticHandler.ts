import * as fs from "fs";
import * as path from "path";

import { APIGatewayProxyHandler } from "aws-lambda";
import { contentType } from "mime-types";

const textTypes = [".css", ".html", ".js", ".json", ".map", ".svg", ".txt"];

export const serveStatic: APIGatewayProxyHandler = async (event) => {
  const requestPath = path.join(
    "pages",
    event.path !== "/" ? event.path : "index.html"
  );
  const resourcePath = fs.existsSync(requestPath)
    ? requestPath
    : "pages/index.html";
  const isBase64Encoded = !textTypes.some((ext) => resourcePath.endsWith(ext));
  const body = fs
    .readFileSync(resourcePath)
    .toString(isBase64Encoded ? "base64" : "utf-8");
  return {
    statusCode: 200,
    headers: {
      "Content-Type":
        contentType(path.basename(resourcePath)) || "application/octet-stream",
      "Cache-Control": resourcePath.endsWith(".html")
        ? "no-cache"
        : "public, max-age=31536000",
    },
    body,
    isBase64Encoded,
  };
};
