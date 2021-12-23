import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { Cursor, raw } from "../mod.ts";

Deno.test("raw data", async () => {
  const testData = new Uint8Array([43, 231, 54, 163]);
  assertRejects(async () => {
    await raw(testData.length - 1).encode(testData);
  });
  const data = await raw(testData.length).encode(testData);
  assertEquals(data.length, testData.length);
  const cursor = new Cursor(0);
  assertEquals(await raw(testData.length).decode(data, cursor), testData);
  assertEquals(cursor.index, testData.length);
});
