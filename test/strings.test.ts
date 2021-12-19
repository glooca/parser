import { assertEquals } from "https://deno.land/std@0.118.0/testing/asserts.ts";
import {
  Coder,
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
  const data = await str(testStrByteLength).encode(testStr);
  assertEquals(data.length, testStrByteLength);
  const cursor = new Cursor(0);
  assertEquals(await str(testStrByteLength).decode(data, cursor), testStr);
  assertEquals(cursor.index, data.length);
});

(
  [
    ["u8", u8, 1, u8LenStr],
    ["u16", u16, 2, u16LenStr],
    ["u32", u32, 4, u32LenStr],
  ] as [string, Coder<number>, number, Coder<string>][]
).forEach(([size, lenCoder, numberByteLength, nLenStr]) => {
  Deno.test(`${size} length string`, async () => {
    const data = await nLenStr.encode(testStr);
    assertEquals(data.length, numberByteLength + testStrByteLength);
    assertEquals(await lenCoder.decode(data), testStrByteLength);
    const cursor = new Cursor(0);
    assertEquals(await nLenStr.decode(data, cursor), testStr);
    assertEquals(cursor.index, data.length);
  });
});

Deno.test("null terminated string", async () => {
  const data = await nullTermStr.encode(testStr);
  assertEquals(data[data.length - 1], 0x00);
  assertEquals(data.length, testStrByteLength + 1);
  const cursor = new Cursor(0);
  assertEquals(await nullTermStr.decode(data, cursor), testStr);
  assertEquals(cursor.index, data.length);
});
