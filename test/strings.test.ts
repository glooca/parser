import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import {
  Cursor,
  nullTermStr,
  str,
  u16,
  u16LenStr,
  u32,
  u32LenStr,
  u8,
  u8LenStr,
} from "../parser.ts";

const testStr =
  "Hello, world! " +
  "Here are some special characters: " +
  "ÅÄÖ地拖弓늄넉깽ぞむさタヨセЯИДБ";
const testStrByteLength = new TextEncoder().encode(testStr).length;

Deno.test("known byte length string", async () => {
  assertRejects(async () => {
    await str(testStrByteLength - 1).encode(testStr);
  });
  const data = await str(testStrByteLength).encode(testStr);
  assertEquals(data.length, testStrByteLength);
  const cursor = new Cursor(0);
  assertEquals(await str(testStrByteLength).decode(data, cursor), testStr);
  assertEquals(cursor.index, data.length);
});

Deno.test("u8 length string", async () => {
  const data = await u8LenStr().encode(testStr);
  assertEquals(data.length, 1 + testStrByteLength);
  assertEquals(await u8().decode(data), testStrByteLength);
  const cursor = new Cursor(0);
  assertEquals(await u8LenStr().decode(data, cursor), testStr);
  assertEquals(cursor.index, data.length);
});

Deno.test("u16 length string", async () => {
  const data = await u16LenStr().encode(testStr);
  assertEquals(data.length, 2 + testStrByteLength);
  assertEquals(await u16().decode(data), testStrByteLength);
  const cursor = new Cursor(0);
  assertEquals(await u16LenStr().decode(data, cursor), testStr);
  assertEquals(cursor.index, data.length);
});

Deno.test("u32 length string", async () => {
  const data = await u32LenStr().encode(testStr);
  assertEquals(data.length, 4 + testStrByteLength);
  assertEquals(await u32().decode(data), testStrByteLength);
  const cursor = new Cursor(0);
  assertEquals(await u32LenStr().decode(data, cursor), testStr);
  assertEquals(cursor.index, data.length);
});

Deno.test("null terminated string", async () => {
  const data = await nullTermStr.encode(testStr);
  assertEquals(data[data.length - 1], 0x00);
  assertEquals(data.length, testStrByteLength + 1);
  const cursor = new Cursor(0);
  assertEquals(await nullTermStr.decode(data, cursor), testStr);
  assertEquals(cursor.index, data.length);
});
