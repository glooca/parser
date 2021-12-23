import { assertEquals } from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { u8, u16, u32, Endian } from "../parser.ts";

Deno.test("uint 8", () => {
  [0, 13, 53, 152, 189, 242, 255].forEach(async (val) => {
    const encoded = await u8().encode(val);
    const decoded = await u8().decode(encoded);
    assertEquals(decoded, val);
  });
});

Deno.test("uint 16", () => {
  [0, 2814, 8514, 14645, 27340, 50265, 65535].forEach(async (val) => {
    const encoded = await u16().encode(val);
    const decoded = await u16().decode(encoded);
    assertEquals(decoded, val);
  });
});

Deno.test("uint 32", () => {
  [0, 8514, 969383172, 2041658187, 2850914495, 3818272726, 4294967295].forEach(
    async (val) => {
      const encoded = await u32().encode(val);
      const decoded = await u32().decode(encoded);
      assertEquals(decoded, val);
    }
  );
});

Deno.test("uint 8 little endian", () => {
  [0, 13, 53, 152, 189, 242, 255].forEach(async (val) => {
    const encoded = await u8(Endian.Little).encode(val);
    const decoded = await u8(Endian.Little).decode(encoded);
    assertEquals(decoded, val);
  });
});

Deno.test("uint 16 little endian", () => {
  [0, 2814, 8514, 14645, 27340, 50265, 65535].forEach(async (val) => {
    const encoded = await u16(Endian.Little).encode(val);
    const decoded = await u16(Endian.Little).decode(encoded);
    assertEquals(decoded, val);
  });
});

Deno.test("uint 32 little endian", () => {
  [0, 8514, 969383172, 2041658187, 2850914495, 3818272726, 4294967295].forEach(
    async (val) => {
      const encoded = await u32(Endian.Little).encode(val);
      const decoded = await u32(Endian.Little).decode(encoded);
      assertEquals(decoded, val);
    }
  );
});
