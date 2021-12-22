import { assertEquals } from "https://deno.land/std@0.118.0/testing/asserts.ts";
import {
  coderFactory,
  Cursor,
  decoderFactory,
  encoderFactory,
  nullTermStr,
  pad,
  typedCoderFactory,
  typedDecoderFactory,
  u16,
  u16LenStr,
  u32,
} from "../parser.ts";

Deno.test("decoder factory", async () => {
  interface TestItem {
    myProp: number;
    stringData: string;
  }
  const testItemDecoder = decoderFactory<TestItem>((r) => {
    r(u32(), "myProp");
    r(pad(2));
    r(nullTermStr, "stringData");
  });
  const data = new Uint8Array([
    ...[32, 123, 54, 0], // myProp
    ...[0, 0], // pad
    ...[84, 101, 115, 116, 0], // nullTemrStr
  ]);
  const decoded = await testItemDecoder(data);
  assertEquals(decoded, {
    myProp: 544945664,
    stringData: "Test",
  });
});

Deno.test("typed decoder factory", async () => {
  class TestItem {
    myProp: number;
    stringData: string;
    constructor(myProp: number, stringData: string) {
      this.myProp = myProp;
      this.stringData = stringData;
    }
  }
  const testItemDecoder = typedDecoderFactory(TestItem, (r) => {
    r(u32(), "myProp");
    r(pad(2));
    r(nullTermStr, "stringData");
  });
  const data = new Uint8Array([
    ...[32, 123, 54, 0], // myProp
    ...[0, 0], // pad
    ...[84, 101, 115, 116, 0], // nullTemrStr
  ]);
  const decoded = await testItemDecoder(data);
  assertEquals(decoded, new TestItem(544945664, "Test"));
});

Deno.test("encoder factory", async () => {
  interface TestItem {
    myProp: number;
    stringData: string;
  }
  const testItemEncoder = encoderFactory<TestItem>((r) => {
    r(u32(), "myProp");
    r(pad(2));
    r(nullTermStr, "stringData");
  });
  const data = {
    myProp: 544945664,
    stringData: "Test",
  };
  const encoded = await testItemEncoder(data);
  assertEquals(
    encoded,
    new Uint8Array([
      ...[32, 123, 54, 0], // myProp
      ...[0, 0], // pad
      ...[84, 101, 115, 116, 0], // nullTemrStr
    ])
  );
});

Deno.test("coder factory interface", async () => {
  interface TestItem {
    myProp: number;
    stringData: string;
  }
  const testItemCoder = coderFactory<TestItem>((r) => {
    r(u32(), "myProp");
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
  const testItemCoder = coderFactory<any>((r) => {
    r(u32(), "myProp");
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
    r(u16(), "classProp");
    r(pad(3));
    r(u16LenStr(), "stringData");
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
