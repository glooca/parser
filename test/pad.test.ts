import { assertEquals } from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { Cursor, pad } from "../mod.ts";

Deno.test("padding", async () => {
  const length = 5;
  const data = await pad(length).encode();
  assertEquals(data.length, length);
  const cursor = new Cursor(0);
  await pad(length).decode(data, cursor);
  assertEquals(cursor.index, length);
});
