import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { arr, Cursor, u16, u32, u8 } from "../mod.ts";

Deno.test("array decimal length", async () => {
  await assertRejects(
    async () => {
      await arr(Math.PI, u8).encode([3, 1, 4]);
    },
    undefined,
    "Array length must be a positive integer"
  );
});

Deno.test("array negative length", async () => {
  await assertRejects(
    async () => {
      await arr(-4, u8).encode([]);
    },
    undefined,
    "Array length must be a positive integer"
  );
});

Deno.test("array of u8", async () => {
  const testArrays = [[], [0], [0, 6, 255, 54]];
  for (let i = 0; i < testArrays.length; i++) {
    const dataArr = testArrays[i];
    await assertRejects(
      async () => {
        await arr(dataArr.length + 1, u8).encode(dataArr);
      },
      undefined,
      "Data length doesn't match the array length"
    );
    const data = await arr(dataArr.length, u8).encode(dataArr);
    assertEquals(data.length, 1 * dataArr.length);
    await assertRejects(
      async () => {
        await arr(dataArr.length + 1, u8).decode(data);
      },
      undefined,
      "Offset is outside the bounds of the DataView"
    );
    const cursor = new Cursor(0);
    assertEquals(await arr(dataArr.length, u8).decode(data, cursor), dataArr);
    assertEquals(cursor.index, data.length);
  }
});

Deno.test("array of u16", async () => {
  const testArrays = [[], [0], [543, 234, 65535, 44362, 0]];
  for (let i = 0; i < testArrays.length; i++) {
    const dataArr = testArrays[i];
    await assertRejects(
      async () => {
        await arr(dataArr.length + 1, u16()).encode(dataArr);
      },
      undefined,
      "Data length doesn't match the array length"
    );
    const data = await arr(dataArr.length, u16()).encode(dataArr);
    assertEquals(data.length, 2 * dataArr.length);
    await assertRejects(
      async () => {
        await arr(dataArr.length + 1, u16()).decode(data);
      },
      undefined,
      "Offset is outside the bounds of the DataView"
    );
    const cursor = new Cursor(0);
    assertEquals(
      await arr(dataArr.length, u16()).decode(data, cursor),
      dataArr
    );
    assertEquals(cursor.index, data.length);
  }
});

Deno.test("array of u32", async () => {
  const testArrays = [[], [0], [634562675, 4294967295, 7346526]];
  for (let i = 0; i < testArrays.length; i++) {
    const dataArr = testArrays[i];
    await assertRejects(
      async () => {
        await arr(dataArr.length + 1, u32()).encode(dataArr);
      },
      undefined,
      "Data length doesn't match the array length"
    );
    const data = await arr(dataArr.length, u32()).encode(dataArr);
    assertEquals(data.length, 4 * dataArr.length);
    await assertRejects(
      async () => {
        await arr(dataArr.length + 1, u32()).decode(data);
      },
      undefined,
      "Offset is outside the bounds of the DataView"
    );
    const cursor = new Cursor(0);
    assertEquals(
      await arr(dataArr.length, u32()).decode(data, cursor),
      dataArr
    );
    assertEquals(cursor.index, data.length);
  }
});
