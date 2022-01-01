import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { Cursor, pad } from "../mod.ts";

Deno.test("padding decimal bytelength", async () => {
  await assertRejects(
    async () => {
      await pad(Math.PI).encode();
    },
    undefined,
    "Bytelength must be a positive integer"
  );
});

Deno.test("padding negative bytelength", async () => {
  await assertRejects(
    async () => {
      await pad(-4).encode();
    },
    undefined,
    "Bytelength must be a positive integer"
  );
});

Deno.test("padding", async () => {
  const length = 5;
  const data = await pad(length).encode();
  assertEquals(data, new Uint8Array([0, 0, 0, 0, 0]));
  await assertRejects(
    async () => {
      await pad(length + 1).decode(data);
    },
    undefined,
    "Cursor index outside the data range"
  );
  const cursor = new Cursor(0);
  await pad(length).decode(data, cursor);
  assertEquals(cursor.index, length);
});
