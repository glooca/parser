import { assertEquals } from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { i8, i16, i32, Endian } from "../parser.ts";

Deno.test("int 8", () => {
  [-128, -115, -75, 24, 61, 114, 127].forEach(async (val) => {
    const encoded = await i8().encode(val);
    const decoded = await i8().decode(encoded);
    assertEquals(decoded, val);
  });
});

Deno.test("int 16", () => {
  [-32768, -29954, -24254, -18123, -5428, 17497, 32767].forEach(async (val) => {
    const encoded = await i16().encode(val);
    const decoded = await i16().decode(encoded);
    assertEquals(decoded, val);
  });
});

Deno.test("int 32", () => {
  [
    -2147483648, -2147475134, -1178100476, -105825461, 703430847, 1670789078,
    2147483647,
  ].forEach(async (val) => {
    const encoded = await i32().encode(val);
    const decoded = await i32().decode(encoded);
    assertEquals(decoded, val);
  });
});

Deno.test("int 8 little endian", () => {
  [-128, -115, -75, 24, 61, 114, 127].forEach(async (val) => {
    const encoded = await i8(Endian.Little).encode(val);
    const decoded = await i8(Endian.Little).decode(encoded);
    assertEquals(decoded, val);
  });
});

Deno.test("int 16 little endian", () => {
  [-32768, -29954, -24254, -18123, -5428, 17497, 32767].forEach(async (val) => {
    const encoded = await i16(Endian.Little).encode(val);
    const decoded = await i16(Endian.Little).decode(encoded);
    assertEquals(decoded, val);
  });
});

Deno.test("int 32 little endian", () => {
  [
    -2147483648, -2147475134, -1178100476, -105825461, 703430847, 1670789078,
    2147483647,
  ].forEach(async (val) => {
    const encoded = await i32(Endian.Little).encode(val);
    const decoded = await i32(Endian.Little).decode(encoded);
    assertEquals(decoded, val);
  });
});
