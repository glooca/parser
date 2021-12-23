import { assertEquals } from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { asyncMergeUint8Arrays, mergeUint8Arrays } from "../mod.ts";

// const numbers = [
//   [0, [0]],
//   [255, [255]],
//   [256, [0, 1]],
//   [2048, [0, 8]],
//   [65535, [255, 255]],
//   [156346, [186, 98, 2]],
//   [23374016, [192, 168, 100, 1]],
//   [4294967295, [255, 255, 255, 255]],
// ] as [number, number[]][];

// Deno.test("number from bytes", () => {
//   numbers.forEach(([expected, byteValues]) => {
//     const bytes = new Uint8Array(byteValues);
//     const value = numberFrom(bytes);
//     assertEquals(value, expected);
//   });
// });

// Deno.test("bytes from number", () => {
//   numbers.forEach(([number, expected]) => {
//     const bytes = [...bytesFrom(number, expected.length)];
//     assertEquals(bytes, expected);
//   });
// });

Deno.test("merge uint8Arrays", () => {
  const aCont = [53, 143, 43];
  const arrA = new Uint8Array(aCont);
  const bCont = [255, 0];
  const arrB = new Uint8Array(bCont);
  const arrAB = new Uint8Array([...aCont, ...bCont]);
  assertEquals(mergeUint8Arrays(arrA, arrB), arrAB);

  const cCont = [42, 12];
  const arrC = new Uint8Array(cCont);

  const a: [Uint8Array, number[]] = [arrA, aCont];
  const b: [Uint8Array, number[]] = [arrB, bCont];
  const c: [Uint8Array, number[]] = [arrC, cCont];

  const complexData = [a, b, c, b, c, c, a];
  const arrComplex = new Uint8Array(complexData.flatMap((d) => d[1]));
  assertEquals(mergeUint8Arrays(...complexData.map((d) => d[0])), arrComplex);
});

Deno.test("async merge uint8Arrays", async () => {
  const aCont = [53, 143, 43];
  const arrA = Promise.resolve(new Uint8Array(aCont));
  const bCont = [255, 0];
  const arrB = Promise.resolve(new Uint8Array(bCont));
  const arrAB = new Uint8Array([...aCont, ...bCont]);
  assertEquals(await asyncMergeUint8Arrays(arrA, arrB), arrAB);

  const cCont = [42, 12];
  const arrC = Promise.resolve(new Uint8Array(cCont));

  const a: [Promise<Uint8Array>, number[]] = [arrA, aCont];
  const b: [Promise<Uint8Array>, number[]] = [arrB, bCont];
  const c: [Promise<Uint8Array>, number[]] = [arrC, cCont];

  const complexData = [a, b, c, b, c, c, a];
  const arrComplex = new Uint8Array(complexData.flatMap((d) => d[1]));
  assertEquals(
    await asyncMergeUint8Arrays(...complexData.map((d) => d[0])),
    arrComplex
  );
});
