import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { Cursor, raw } from "../mod.ts";

Deno.test("raw decimal bytelength", async () => {
  await assertRejects(
    async () => {
      await raw(Math.PI).encode(new Uint8Array());
    },
    undefined,
    "Bytelength must be a positive integer"
  );
});

Deno.test("raw negative bytelength", async () => {
  await assertRejects(
    async () => {
      await raw(-4).encode(new Uint8Array());
    },
    undefined,
    "Bytelength must be a positive integer"
  );
});

Deno.test("raw data", async () => {
  const testData = new Uint8Array([43, 231, 54, 163]);
  await assertRejects(
    async () => {
      await raw(1).encode(testData);
    },
    Error,
    `Data bytelength doesn't match the raw bytelength`
  );
  const data = await raw(testData.length).encode(testData);
  assertEquals(data, testData);
  await assertRejects(
    async () => {
      await raw(testData.length + 1).decode(data);
    },
    undefined,
    "Cursor index outside the data range"
  );
  const cursor = new Cursor(0);
  assertEquals(await raw(testData.length).decode(data, cursor), testData);
  assertEquals(cursor.index, testData.length);
});
