import { assertEquals } from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { i8, i16, i32, Endian, Cursor } from "../mod.ts";

const int16Data = [
  { val: -32768, enc: [128, 0] },
  { val: -29954, enc: [138, 254] },
  { val: -24254, enc: [161, 66] },
  { val: -18123, enc: [185, 53] },
  { val: -5428, enc: [234, 204] },
  { val: 17497, enc: [68, 89] },
  { val: 32767, enc: [127, 255] },
];

const int32Data = [
  { val: -2147483648, enc: [128, 0, 0, 0] },
  { val: -2147475134, enc: [128, 0, 33, 66] },
  { val: -1178100476, enc: [185, 199, 157, 4] },
  { val: -105825461, enc: [249, 177, 59, 75] },
  { val: -1, enc: [255, 255, 255, 255] },
  { val: 0, enc: [0, 0, 0, 0] },
  { val: 703430847, enc: [41, 237, 128, 191] },
  { val: 1670789078, enc: [99, 150, 55, 214] },
  { val: 2147483647, enc: [127, 255, 255, 255] },
];

Deno.test("int 8", () => {
  [-128, -115, -75, 24, 61, 114, 127].forEach(async (val) => {
    const encoded = await i8.encode(val);
    assertEquals(encoded, new Uint8Array([val]));
    const cursor = new Cursor();
    const decoded = await i8.decode(encoded, cursor);
    assertEquals(decoded, val);
    assertEquals(cursor.index, 1);
  });
});

Deno.test("int 16", () => {
  int16Data.forEach(async ({ val, enc }) => {
    const encoded = await i16().encode(val);
    assertEquals(encoded, new Uint8Array(enc));
    const cursor = new Cursor();
    const decoded = await i16().decode(encoded, cursor);
    assertEquals(decoded, val);
    assertEquals(cursor.index, 2);
  });
});

Deno.test("int 32", () => {
  int32Data.forEach(async ({ val, enc }) => {
    const encoded = await i32().encode(val);
    assertEquals(encoded, new Uint8Array(enc));
    const cursor = new Cursor();
    const decoded = await i32().decode(encoded, cursor);
    assertEquals(decoded, val);
    assertEquals(cursor.index, 4);
  });
});

Deno.test("int 16 little endian", () => {
  int16Data.forEach(async ({ val, enc }) => {
    const encoded = await i16(Endian.Little).encode(val);
    assertEquals(encoded, new Uint8Array(enc.reverse()));
    const cursor = new Cursor();
    const decoded = await i16(Endian.Little).decode(encoded, cursor);
    assertEquals(decoded, val);
    assertEquals(cursor.index, 2);
  });
});

Deno.test("int 32 little endian", () => {
  int32Data.forEach(async ({ val, enc }) => {
    const encoded = await i32(Endian.Little).encode(val);
    assertEquals(encoded, new Uint8Array(enc.reverse()));
    const cursor = new Cursor();
    const decoded = await i32(Endian.Little).decode(encoded, cursor);
    assertEquals(decoded, val);
    assertEquals(cursor.index, 4);
  });
});
