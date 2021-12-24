import { assertEquals } from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { Cursor, Endian, f64, u16LenArr, u32LenArr, u8LenArr } from "../mod.ts";

const f64ArrData = [
  { val: [], enc: [], l_u8: [0], l_u16: [0, 0], l_u32: [0, 0, 0, 0] },
  {
    val: [0.5342],
    enc: [63, 225, 24, 42, 153, 48, 190, 14],
    l_u8: [1],
    l_u16: [0, 1],
    l_u32: [0, 0, 0, 1],
  },
  {
    val: [634562675.2457345, 4294967295.62345, 7346526.52346],
    enc: [
      65, 194, 233, 84, 57, 159, 116, 58, 65, 239, 255, 255, 255, 243, 243, 77,
      65, 92, 6, 87, 161, 128, 94, 95,
    ],
    l_u8: [3],
    l_u16: [0, 3],
    l_u32: [0, 0, 0, 3],
  },
];

Deno.test("u8 length array of f64", () => {
  f64ArrData.forEach(async ({ val, enc, l_u8 }) => {
    const data = await u8LenArr(f64()).encode(val);
    assertEquals(data, new Uint8Array([...l_u8, ...enc]));
    const cursor = new Cursor(0);
    assertEquals(await u8LenArr(f64()).decode(data, cursor), val);
    assertEquals(cursor.index, data.length);
  });
});

Deno.test("u16 length array of f64", () => {
  f64ArrData.forEach(async ({ val, enc, l_u16 }) => {
    const data = await u16LenArr(f64()).encode(val);
    assertEquals(data, new Uint8Array([...l_u16, ...enc]));
    const cursor = new Cursor(0);
    assertEquals(await u16LenArr(f64()).decode(data, cursor), val);
    assertEquals(cursor.index, data.length);
  });
});

Deno.test("u32 length array of f64", () => {
  f64ArrData.forEach(async ({ val, enc, l_u32 }) => {
    const data = await u32LenArr(f64()).encode(val);
    assertEquals(data, new Uint8Array([...l_u32, ...enc]));
    const cursor = new Cursor(0);
    assertEquals(await u32LenArr(f64()).decode(data, cursor), val);
    assertEquals(cursor.index, data.length);
  });
});

Deno.test("little endian u16 length array of f64", () => {
  f64ArrData.forEach(async ({ val, enc, l_u16 }) => {
    const data = await u16LenArr(f64(), Endian.Little).encode(val);
    assertEquals(data, new Uint8Array([...l_u16.reverse(), ...enc]));
    const cursor = new Cursor(0);
    assertEquals(
      await u16LenArr(f64(), Endian.Little).decode(data, cursor),
      val
    );
    assertEquals(cursor.index, data.length);
  });
});

Deno.test("little endian u32 length array of f64", () => {
  f64ArrData.forEach(async ({ val, enc, l_u32 }) => {
    const data = await u32LenArr(f64(), Endian.Little).encode(val);
    assertEquals(data, new Uint8Array([...l_u32.reverse(), ...enc]));
    const cursor = new Cursor(0);
    assertEquals(
      await u32LenArr(f64(), Endian.Little).decode(data, cursor),
      val
    );
    assertEquals(cursor.index, data.length);
  });
});
