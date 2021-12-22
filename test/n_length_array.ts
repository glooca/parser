import { assertEquals } from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { Cursor, f64, u16LenArr, u32LenArr, u8LenArr } from "../parser.ts";

Deno.test("u8 length array of f64", async () => {
  const testArrays = [
    [],
    [0.5342],
    [634562675.2457345, 4294967295.62345, 7346526.52346],
  ];
  for (let i = 0; i < testArrays.length; i++) {
    const dataArr = testArrays[i];
    const data = await u8LenArr(f64()).encode(dataArr);
    assertEquals(data.length, 1 + 8 * dataArr.length);
    const cursor = new Cursor(0);
    assertEquals(await u8LenArr(f64()).decode(data, cursor), dataArr);
    assertEquals(cursor.index, data.length);
  }
});

Deno.test("u16 length array of f64", async () => {
  const testArrays = [
    [],
    [0.5342],
    [634562675.2457345, 4294967295.62345, 7346526.52346],
  ];
  for (let i = 0; i < testArrays.length; i++) {
    const dataArr = testArrays[i];
    const data = await u16LenArr(f64()).encode(dataArr);
    assertEquals(data.length, 2 + 8 * dataArr.length);
    const cursor = new Cursor(0);
    assertEquals(await u16LenArr(f64()).decode(data, cursor), dataArr);
    assertEquals(cursor.index, data.length);
  }
});

Deno.test("u32 length array of f64", async () => {
  const testArrays = [
    [],
    [0.5342],
    [634562675.2457345, 4294967295.62345, 7346526.52346],
  ];
  for (let i = 0; i < testArrays.length; i++) {
    const dataArr = testArrays[i];
    const data = await u32LenArr(f64()).encode(dataArr);
    assertEquals(data.length, 4 + 8 * dataArr.length);
    const cursor = new Cursor(0);
    assertEquals(await u32LenArr(f64()).decode(data, cursor), dataArr);
    assertEquals(cursor.index, data.length);
  }
});
