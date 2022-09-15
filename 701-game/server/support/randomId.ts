import * as crypto from "crypto";

export default function randomId() {
  return crypto.randomBytes(12).toString("hex");
}
