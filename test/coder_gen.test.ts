import { assertEquals } from "https://deno.land/std@0.118.0/testing/asserts.ts";
import {
  Coder,
  coderFactory,
  Cursor,
  nullTermStr,
  u16,
  u16LenStr,
  u32,
} from "../parser.ts";

Deno.test("interface coder factory generator", async () => {
  interface TestItem {
    version: number;
    data: TestItemData;
  }
  const testItemCoder: Coder<TestItem> = coderFactory((r) => {
    r(u16(), "version");
    r((item) => testItemDataCoder(item.version ?? 0), "data");
  });
  interface TestItemData {
    myProp: number;
    versionDependentData: string;
  }
  function testItemDataCoder(version: number): Coder<TestItemData> {
    return coderFactory((r) => {
      r(u32(), "myProp");
      if (version > 3) {
        r(nullTermStr as Coder<string>, "versionDependentData");
      } else {
        r(u16LenStr() as Coder<string>, "versionDependentData");
      }
    });
  }

  const testStr = "Hello, World!";
  const testStrByteLength = new TextEncoder().encode(testStr).length;
  const testDataList: [TestItem, number][] = [
    [
      {
        version: 4,
        data: {
          myProp: 1234,
          versionDependentData: testStr,
        },
      },
      4 /* u32 */ + 2 /* pad */ + testStrByteLength + 1 /* null byte */,
    ],
    [
      {
        version: 2,
        data: {
          myProp: 342,
          versionDependentData: testStr,
        },
      },
      4 /* u32 */ + 2 /* pad */ + 2 /* u16 len */ + testStrByteLength,
    ],
  ];

  for (let i = 0; i < testDataList.length; i++) {
    const [testData, expectedByteSize] = testDataList[i];
    const data = await testItemCoder.encode(testData);
    assertEquals(data.length, expectedByteSize);
    const cursor = new Cursor(0);
    assertEquals(await testItemCoder.decode(data, cursor), testData);
    assertEquals(cursor.index, data.length);
  }
});
