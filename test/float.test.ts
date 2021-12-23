import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { Cursor, Endian, f32, f64 } from "../mod.ts";

Deno.test("float 32", async () => {
  const encoded = await f32().encode(Math.PI);
  const cursor = new Cursor();
  const decoded = await f32().decode(encoded, cursor);
  assert(Math.abs(decoded - Math.PI) < 0.0000001); // Math.PI is 64 bit float so some precision is lost
  assertEquals(cursor.index, 4);
});

Deno.test("float 64", async () => {
  const encoded = await f64().encode(Math.PI);
  const cursor = new Cursor();
  const decoded = await f64().decode(encoded, cursor);
  assertEquals(decoded, Math.PI);
  assertEquals(cursor.index, 8);
});

Deno.test("float 32 little endian", async () => {
  const encoded = await f32(Endian.Little).encode(Math.PI);
  const cursor = new Cursor();
  const decoded = await f32(Endian.Little).decode(encoded, cursor);
  assert(Math.abs(decoded - Math.PI) < 0.0000001); // Math.PI is 64 bit float so some precision is lost
  assertEquals(cursor.index, 4);
});

Deno.test("float 64 little endian", async () => {
  const encoded = await f64(Endian.Little).encode(Math.PI);
  const cursor = new Cursor();
  const decoded = await f64(Endian.Little).decode(encoded, cursor);
  assertEquals(decoded, Math.PI);
  assertEquals(cursor.index, 8);
});
