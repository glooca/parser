# Binary parser

A simple parser for easily creating both encoding and decoding for a given data type

This project has no dependencies and should work in any typescript environment although it was developed mainly for deno

## Running tests

```bash
deno test
```

# :tada: Getting started

Import what you need from `mod.ts`

## :pencil: Docs

- [Coder factory functions](docs/coder_factories.md)
- [Included coders](docs/included_coders.md)
- [Types](docs/types.md)

## :pencil2: Example

```ts
import { coderFactory, nullTermStr, pad, u32 } from "./mod.ts";

interface MyInterface {
  someProp: number;
  anotherProp: string;
}
const myCoder = coderFactory<MyInterface>((r) => {
  r(u32(), "someProp");
  r(pad(2));
  r(nullTermStr, "anotherProp");
});

const myData: MyInterface = { someProp: 420, anotherProp: "Hello, World!" };
const encoded: Uint8Array = await myCoder.encode(myData);
const decoded: MyInterface = await myCoder.decode(encoded);

assertEqual(myData, decoded);
```
