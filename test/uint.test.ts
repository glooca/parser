import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { u8, u16, u32, Endian, Cursor } from "../mod.ts";

const uint16Data = [
  { val: 0, enc: [0, 0] },
  { val: 2814, enc: [10, 254] },
  { val: 8514, enc: [33, 66] },
  { val: 14645, enc: [57, 53] },
  { val: 27340, enc: [106, 204] },
  { val: 50265, enc: [196, 89] },
  { val: 65535, enc: [255, 255] },
];

const uint32Data = [
  { val: 0, enc: [0, 0, 0, 0] },
  { val: 8514, enc: [0, 0, 33, 66] },
  { val: 969383172, enc: [57, 199, 157, 4] },
  { val: 2041658187, enc: [121, 177, 59, 75] },
  { val: 2850914495, enc: [169, 237, 128, 191] },
  { val: 3818272726, enc: [227, 150, 55, 214] },
  { val: 4294967295, enc: [255, 255, 255, 255] },
];

Deno.test("uint 8", () => {
  [0, 13, 53, 152, 189, 242, 255].forEach(async (val) => {
    const encoded = await u8.encode(val);
    assertEquals(encoded, new Uint8Array([val]));
    const cursor = new Cursor();
    const decoded = await u8.decode(encoded, cursor);
    assertEquals(decoded, val);
    assertEquals(cursor.index, 1);
  });
});

Deno.test("uint 16", () => {
  uint16Data.forEach(async ({ val, enc }) => {
    const encoded = await u16().encode(val);
    assertEquals(encoded, new Uint8Array(enc));
    const cursor = new Cursor();
    const decoded = await u16().decode(encoded, cursor);
    assertEquals(decoded, val);
    assertEquals(cursor.index, 2);
  });
});

Deno.test("uint 32", () => {
  uint32Data.forEach(async ({ val, enc }) => {
    const encoded = await u32().encode(val);
    assertEquals(encoded, new Uint8Array(enc));
    const cursor = new Cursor();
    const decoded = await u32().decode(encoded, cursor);
    assertEquals(decoded, val);
    assertEquals(cursor.index, 4);
  });
});

Deno.test("uint 32 data too short", async () => {
  await assertRejects(
    async () => {
      await u32().decode(new Uint8Array([0, 0, 255]));
    },
    undefined,
    "Offset is outside the bounds of the DataView"
  );
});

Deno.test("uint 16 little endian", () => {
  uint16Data.forEach(async ({ val, enc }) => {
    const encoded = await u16(Endian.Little).encode(val);
    assertEquals(encoded, new Uint8Array(enc.reverse()));
    const cursor = new Cursor();
    const decoded = await u16(Endian.Little).decode(encoded, cursor);
    assertEquals(decoded, val);
    assertEquals(cursor.index, 2);
  });
});

Deno.test("uint 32 little endian", () => {
  uint32Data.forEach(async ({ val, enc }) => {
    const encoded = await u32(Endian.Little).encode(val);
    assertEquals(encoded, new Uint8Array(enc.reverse()));
    const cursor = new Cursor();
    const decoded = await u32(Endian.Little).decode(encoded, cursor);
    assertEquals(decoded, val);
    assertEquals(cursor.index, 4);
  });
});
