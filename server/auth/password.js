import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

export const hashPw = (pw) => {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(pw, salt, 64).toString("hex")}`;
};

export const checkPw = (pw, stored) => {
  const [salt, hash] = stored.split(":");
  const h = scryptSync(pw, Buffer.from(salt, "hex"), 64);
  return timingSafeEqual(h, Buffer.from(hash, "hex"));
};
