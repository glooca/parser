import { assertEquals } from "https://deno.land/std@0.118.0/testing/asserts.ts";
import {
  Coder,
  coderFactory,
  Cursor,
  nullTermStr,
  pad,
  typedCoderFactory,
  u16,
  u16LenStr,
  u32,
} from "../parser.ts";

Deno.test("coder factory interface", async () => {
  interface TestItem {
    myProp: number;
    stringData: string;
  }
  const testItemCoder: Coder<TestItem> = coderFactory((r) => {
    r(u32, "myProp");
    r(pad(2));
    r(nullTermStr, "stringData");
  });

  const testStr = "Hello, World!";
  const testStrByteLength = new TextEncoder().encode(testStr).length;
  const testData: TestItem = {
    myProp: 1234,
    stringData: testStr,
  };

  const data = await testItemCoder.encode(testData);
  assertEquals(data.length, 4 /* u32 */ + 2 /* pad */ + testStrByteLength + 1);
  const cursor = new Cursor(0);
  assertEquals(await testItemCoder.decode(data, cursor), testData);
  assertEquals(cursor.index, data.length);
});

Deno.test("coder factory any", async () => {
  // deno-lint-ignore no-explicit-any
  const testItemCoder: Coder<any> = coderFactory((r) => {
    r(u32, "myProp");
    r(pad(2));
    r(nullTermStr, "stringData");
  });

  const testStr = "Hello, World!";
  const testStrByteLength = new TextEncoder().encode(testStr).length;
  const testData = {
    myProp: 1234,
    stringData: testStr,
  };

  const data = await testItemCoder.encode(testData);
  assertEquals(data.length, 4 /* u32 */ + 2 /* pad */ + testStrByteLength + 1);
  const cursor = new Cursor(0);
  assertEquals(await testItemCoder.decode(data, cursor), testData);
  assertEquals(cursor.index, data.length);
});

Deno.test("coder factory class", async () => {
  class TestClass {
    classProp: number;
    stringData: string;
    constructor(classProp = 423, stringData = "") {
      this.classProp = classProp;
      this.stringData = stringData;
    }
  }
  const testClassCoder = typedCoderFactory(TestClass, (r) => {
    r(u16, "classProp");
    r(pad(3));
    r(u16LenStr, "stringData");
  });

  const testStr = "Hello, World!";
  const testStrByteLength = new TextEncoder().encode(testStr).length;
  const testData = new TestClass(1234, testStr);

  const data = await testClassCoder.encode(testData);
  assertEquals(data.length, 2 /* u32 */ + 3 /* pad */ + 2 + testStrByteLength);
  const cursor = new Cursor(0);
  assertEquals(await testClassCoder.decode(data, cursor), testData);
  assertEquals(cursor.index, data.length);
});
