import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { f32, f64 } from "../parser.ts";

Deno.test("float 32", async () => {
  const encoded = await f32().encode(Math.PI);
  const decoded = await f32().decode(encoded);
  assert(Math.abs(decoded - Math.PI) < 0.0000001); // Math.PI is 64 bit float so some precision is lost
});

Deno.test("float 64", async () => {
  const encoded = await f64().encode(Math.PI);
  const decoded = await f64().decode(encoded);
  assertEquals(decoded, Math.PI);
});
