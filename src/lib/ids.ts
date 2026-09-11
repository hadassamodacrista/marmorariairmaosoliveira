import { randomUUID } from "crypto";

export function newId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

export function newToken(): string {
  return randomUUID().replace(/-/g, "");
}
