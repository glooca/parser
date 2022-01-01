import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import {
  Cursor,
  Endian,
  f64,
  u16,
  u16LenArr,
  u32,
  u32LenArr,
  u8,
  u8LenArr,
} from "../mod.ts";

const knownF64Values = [
  { val: 0.5342, enc: [63, 225, 24, 42, 153, 48, 190, 14] },
  { val: 634562675.2457345, enc: [65, 194, 233, 84, 57, 159, 116, 58] },
  { val: 4294967295.62345, enc: [65, 239, 255, 255, 255, 243, 243, 77] },
  { val: 7346526.52346, enc: [65, 92, 6, 87, 161, 128, 94, 95] },
];

async function createData(length: number) {
  const ret: {
    val: number[];
    enc: number[];
    lU8?: number[];
    lU16?: number[];
    lU32?: number[];
  } = {
    val: [],
    enc: [],
  };
  for (let i = 0; i < length; i++) {
    const index = i % knownF64Values.length;
    ret.val.push(knownF64Values[index].val);
    ret.enc = ret.enc.concat(knownF64Values[index].enc);
  }
  if (length <= 0xff) {
    ret.lU8 = [...(await u8.encode(length))];
  }
  if (length <= 0xffff) {
    ret.lU16 = [...(await u16().encode(length))];
  }
  if (length <= 0xffffffff) {
    ret.lU32 = [...(await u32().encode(length))];
  }
  return ret;
}

const f64ArrData = [
  await createData(0),
  await createData(23),
  await createData(234),
  await createData(255),
  await createData(534),
];

Deno.test("u8 length array of f64", async () => {
  for (let i = 0; i < f64ArrData.length; i++) {
    const { val, enc, lU8 } = f64ArrData[i];
    if (lU8 == undefined) continue;
    const data = await u8LenArr(f64()).encode(val);
    assertEquals(data, new Uint8Array([...lU8, ...enc]));
    if (lU8[0] !== 255)
      await assertRejects(
        async () => {
          await u8LenArr(f64()).decode(new Uint8Array([255, ...enc]));
        },
        undefined,
        "Offset is outside the bounds of the DataView"
      );
    const cursor = new Cursor(0);
    assertEquals(await u8LenArr(f64()).decode(data, cursor), val);
    assertEquals(cursor.index, data.length);
  }
});

Deno.test("u16 length array of f64", async () => {
  for (let i = 0; i < f64ArrData.length; i++) {
    const { val, enc, lU16 } = f64ArrData[i];
    if (lU16 == undefined) continue;
    const data = await u16LenArr(f64()).encode(val);
    assertEquals(data, new Uint8Array([...lU16, ...enc]));
    const cursor = new Cursor(0);
    assertEquals(await u16LenArr(f64()).decode(data, cursor), val);
    assertEquals(cursor.index, data.length);
  }
});

Deno.test("u32 length array of f64", async () => {
  for (let i = 0; i < f64ArrData.length; i++) {
    const { val, enc, lU32 } = f64ArrData[i];
    if (lU32 == undefined) continue;
    const data = await u32LenArr(f64()).encode(val);
    assertEquals(data, new Uint8Array([...lU32, ...enc]));
    const cursor = new Cursor(0);
    assertEquals(await u32LenArr(f64()).decode(data, cursor), val);
    assertEquals(cursor.index, data.length);
  }
});

Deno.test("little endian u16 length array of f64", async () => {
  for (let i = 0; i < f64ArrData.length; i++) {
    const { val, enc, lU16 } = f64ArrData[i];
    if (lU16 == undefined) continue;
    const data = await u16LenArr(f64(), Endian.Little).encode(val);
    assertEquals(data, new Uint8Array([...lU16.reverse(), ...enc]));
    const cursor = new Cursor(0);
    assertEquals(
      await u16LenArr(f64(), Endian.Little).decode(data, cursor),
      val
    );
    assertEquals(cursor.index, data.length);
  }
});

Deno.test("little endian u32 length array of f64", async () => {
  for (let i = 0; i < f64ArrData.length; i++) {
    const { val, enc, lU32 } = f64ArrData[i];
    if (lU32 == undefined) continue;
    const data = await u32LenArr(f64(), Endian.Little).encode(val);
    assertEquals(data, new Uint8Array([...lU32.reverse(), ...enc]));
    const cursor = new Cursor(0);
    assertEquals(
      await u32LenArr(f64(), Endian.Little).decode(data, cursor),
      val
    );
    assertEquals(cursor.index, data.length);
  }
});
