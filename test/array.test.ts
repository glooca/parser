import { assertEquals } from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { arr, Coder, Cursor, u16, u32, u8 } from "../parser.ts";

const numTypes: [string, Coder<number>, number, number[][]][] = [
  ["u8", u8, 1, [[], [0], [0, 6, 255, 54]]],
  ["u16", u16, 2, [[], [0], [543, 234, 65535, 44362, 0]]],
  ["u32", u32, 4, [[], [0], [634562675, 4294967295, 7346526]]],
];

numTypes.forEach(([valueType, numberCoder, numberByteLength, testArrays]) => {
  Deno.test(`${valueType} array`, async () => {
    for (let i = 0; i < testArrays.length; i++) {
      const dataArr = testArrays[i];
      const data = await arr(dataArr.length, numberCoder).encode(dataArr);
      assertEquals(data.length, numberByteLength * dataArr.length);
      const cursor = new Cursor(0);
      assertEquals(
        await arr(dataArr.length, numberCoder).decode(data, cursor),
        dataArr
      );
      assertEquals(cursor.index, data.length);
    }
  });
});
