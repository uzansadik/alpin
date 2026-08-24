import { randomUUID } from "node:crypto";

import type { CreateUploadInput } from "./types";

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function createObjectKey(input: CreateUploadInput) {
  const extension = extensions[input.contentType];

  if (!extension) {
    throw new Error("Unsupported file type.");
  }

  return [input.purpose, input.ownerId, `${randomUUID()}.${extension}`].join("/");
}
