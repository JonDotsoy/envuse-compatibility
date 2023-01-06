import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { describe, it } from "vitest";
import { inspect } from "node:util";
import { parseTap13 } from "./tap13.mjs";

describe("TAP Parser", () => {
  it("case 1", async () => {
    const payloadSample1 = createReadStream(
      new URL("__samples__/sample1.tap", import.meta.url),
      "utf-8"
    );

    console.log(
      inspect(await parseTap13(payloadSample1), {
        depth: Infinity,
        colors: true,
      })
    );
  });
});
