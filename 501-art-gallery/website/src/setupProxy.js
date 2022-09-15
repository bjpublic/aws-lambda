// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app
    .use(
      "/recommend-api",
      createProxyMiddleware({ target: "http://localhost:3001" })
    )
    .use("/api", createProxyMiddleware({ target: "http://localhost:3000" }));
};
