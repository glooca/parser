import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import {
  Cursor,
  Endian,
  mergeUint8Arrays,
  nullTermStr,
  str,
  u16,
  u16LenStr,
  u32,
  u32LenStr,
  u8,
  u8LenStr,
} from "../mod.ts";

const testStr =
  "Hello, world! " +
  "Here are some special characters: " +
  "ÅÄÖ地拖弓늄넉깽ぞむさタヨセЯИДБ";
const testStrBytes = new TextEncoder().encode(testStr);

Deno.test("known byte length string", async () => {
  assertRejects(
    async () => {
      await str(0).encode(testStr);
    },
    Error,
    `Failed to store text "${testStr}" in 0 bytes`
  );
  assertRejects(
    async () => {
      await str(1).encode(testStr);
    },
    Error,
    `Failed to store text "${testStr}" in 1 byte`
  );
  const data = await str(testStrBytes.length).encode(testStr);
  assertEquals(data, testStrBytes);
  const cursor = new Cursor(0);
  assertEquals(await str(testStrBytes.length).decode(data, cursor), testStr);
  assertEquals(cursor.index, data.length);
});

Deno.test("u8 length string", async () => {
  const data = await u8LenStr.encode(testStr);
  assertEquals(
    data,
    mergeUint8Arrays(new Uint8Array([testStrBytes.length]), testStrBytes)
  );
  assertEquals(await u8.decode(data), testStrBytes.length);
  const cursor = new Cursor(0);
  assertEquals(await u8LenStr.decode(data, cursor), testStr);
  assertEquals(cursor.index, data.length);
});

Deno.test("u16 length string", async () => {
  const data = await u16LenStr().encode(testStr);
  assertEquals(
    data,
    mergeUint8Arrays(new Uint8Array([0, testStrBytes.length]), testStrBytes)
  );
  assertEquals(await u16().decode(data), testStrBytes.length);
  const cursor = new Cursor(0);
  assertEquals(await u16LenStr().decode(data, cursor), testStr);
  assertEquals(cursor.index, data.length);
});

Deno.test("u32 length string", async () => {
  const data = await u32LenStr().encode(testStr);
  assertEquals(
    data,
    mergeUint8Arrays(
      new Uint8Array([0, 0, 0, testStrBytes.length]),
      testStrBytes
    )
  );
  assertEquals(await u32().decode(data), testStrBytes.length);
  const cursor = new Cursor(0);
  assertEquals(await u32LenStr().decode(data, cursor), testStr);
  assertEquals(cursor.index, data.length);
});

Deno.test("little endian u16 length string", async () => {
  const data = await u16LenStr(Endian.Little).encode(testStr);
  assertEquals(
    data,
    mergeUint8Arrays(new Uint8Array([testStrBytes.length, 0]), testStrBytes)
  );
  assertEquals(await u16(Endian.Little).decode(data), testStrBytes.length);
  const cursor = new Cursor(0);
  assertEquals(await u16LenStr(Endian.Little).decode(data, cursor), testStr);
  assertEquals(cursor.index, data.length);
});

Deno.test("little endian u32 length string", async () => {
  const data = await u32LenStr(Endian.Little).encode(testStr);
  assertEquals(
    data,
    mergeUint8Arrays(
      new Uint8Array([testStrBytes.length, 0, 0, 0]),
      testStrBytes
    )
  );
  assertEquals(await u32(Endian.Little).decode(data), testStrBytes.length);
  const cursor = new Cursor(0);
  assertEquals(await u32LenStr(Endian.Little).decode(data, cursor), testStr);
  assertEquals(cursor.index, data.length);
});

Deno.test("null terminated string", async () => {
  const data = await nullTermStr.encode(testStr);
  assertEquals(data, mergeUint8Arrays(testStrBytes, new Uint8Array([0x00])));
  assertEquals(data.length, testStrBytes.length + 1);
  const cursor = new Cursor(0);
  assertEquals(await nullTermStr.decode(data, cursor), testStr);
  assertEquals(cursor.index, data.length);
});
