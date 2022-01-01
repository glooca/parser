import { assertEquals } from "https://deno.land/std@0.118.0/testing/asserts.ts";
import {
  coderFactory,
  Cursor,
  nullTermStr,
  u16,
  u16LenStr,
  u32,
} from "../mod.ts";

Deno.test("coder factory generator", async () => {
  interface TestItem {
    version: number;
    data: TestItemData;
  }
  let callbackVersionInfo: number | undefined;
  const testItemCoder = coderFactory<TestItem>((r) => {
    r(u16(), "version");
    r((header) => {
      callbackVersionInfo = header.version;
    });
    r((item) => testItemDataCoder(item.version!), "data");
  });

  interface TestItemData {
    myProp: number;
    versionDependentData: string;
  }
  function testItemDataCoder(version: number) {
    return coderFactory<TestItemData>((r) => {
      r(u32(), "myProp");
      if (version > 3) {
        r(nullTermStr, "versionDependentData");
      } else {
        r(u16LenStr(), "versionDependentData");
      }
    });
  }

  const testStr = "Hello, World!";
  const testStrBytes = new TextEncoder().encode(testStr);

  const testDataList: { testData: TestItem; expectedBytes: number[] }[] = [
    {
      testData: {
        version: 4,
        data: {
          myProp: 1234,
          versionDependentData: testStr,
        },
      },
      expectedBytes: [
        ...[0, 4] /* u16 */,
        ...[0, 0, 4, 210] /* u32 */,
        ...[...testStrBytes, 0 /* null byte */],
      ],
    },
    {
      testData: {
        version: 2,
        data: {
          myProp: 342,
          versionDependentData: testStr,
        },
      },
      expectedBytes: [
        ...[0, 2] /* u16 */,
        ...[0, 0, 1, 86] /* u32 */,
        ...[...[0, testStrBytes.byteLength] /* u16 len */, ...testStrBytes],
      ],
    },
  ];

  for (let i = 0; i < testDataList.length; i++) {
    const { testData, expectedBytes } = testDataList[i];
    const data = await testItemCoder.encode(testData);
    assertEquals(callbackVersionInfo, testData.version);
    callbackVersionInfo = undefined;
    assertEquals(data, new Uint8Array(expectedBytes));
    const cursor = new Cursor(0);
    assertEquals(await testItemCoder.decode(data, cursor), testData);
    assertEquals(callbackVersionInfo, testData.version);
    assertEquals(cursor.index, data.length);
  }
});
