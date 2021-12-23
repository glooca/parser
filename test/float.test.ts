import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { Cursor, Endian, f32, f64 } from "../mod.ts";

Deno.test("float 32", async () => {
  const encoded = await f32().encode(Math.PI);
  assertEquals(encoded, new Uint8Array([64, 73, 15, 219]));
  const cursor = new Cursor();
  const decoded = await f32().decode(encoded, cursor);
  assert(Math.abs(decoded - Math.PI) < 0.0000001); // Math.PI is 64 bit float so some precision is lost
  assertEquals(cursor.index, 4);
});

Deno.test("float 64", async () => {
  const encoded = await f64().encode(Math.PI);
  assertEquals(encoded, new Uint8Array([64, 9, 33, 251, 84, 68, 45, 24]));
  const cursor = new Cursor();
  const decoded = await f64().decode(encoded, cursor);
  assertEquals(decoded, Math.PI);
  assertEquals(cursor.index, 8);
});

Deno.test("float 32 little endian", async () => {
  const encoded = await f32(Endian.Little).encode(Math.PI);
  assertEquals(encoded, new Uint8Array([219, 15, 73, 64]));
  const cursor = new Cursor();
  const decoded = await f32(Endian.Little).decode(encoded, cursor);
  assert(Math.abs(decoded - Math.PI) < 0.0000001); // Math.PI is 64 bit float so some precision is lost
  assertEquals(cursor.index, 4);
});

Deno.test("float 64 little endian", async () => {
  const encoded = await f64(Endian.Little).encode(Math.PI);
  assertEquals(encoded, new Uint8Array([24, 45, 68, 84, 251, 33, 9, 64]));
  const cursor = new Cursor();
  const decoded = await f64(Endian.Little).decode(encoded, cursor);
  assertEquals(decoded, Math.PI);
  assertEquals(cursor.index, 8);
});
