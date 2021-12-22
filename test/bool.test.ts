import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { bool, Cursor } from "../parser.ts";

[true, false].forEach((boolValue) => {
  Deno.test(`boolean ${boolValue}`, async () => {
    const data = await bool.encode(boolValue);
    assertEquals(data.length, 1);
    assertEquals(data[0], boolValue ? 0x01 : 0x00);
    const cursor = new Cursor(0);
    assertEquals(await bool.decode(data, cursor), boolValue);
    assertRejects(async () => {
      await bool.decode(new Uint8Array([5]));
    });
    assertEquals(cursor.index, 1);
  });
});
