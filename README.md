# Binary parser [![Deno](https://github.com/glooca/parser/actions/workflows/deno.yml/badge.svg?branch=main)](https://github.com/glooca/parser/actions/workflows/deno.yml) [![Coverage](https://img.shields.io/codecov/c/github/glooca/parser?logo=codecov)](https://app.codecov.io/gh/glooca/parser)

A simple parser for easily creating both encoding and decoding for a given data type

This project has no dependencies and should work in any typescript environment although it was developed mainly for deno

## Running tests

```bash
deno test
```

# :tada: Getting started

Import what you need from `mod.ts`

## :pencil: Docs

Hosted at deno.land https://doc.deno.land/https://deno.land/x/binary_parser@1.0.0/mod.ts

## :pencil2: Example

```ts
import {
  coderFactory,
  nullTermStr,
  pad,
  u32,
} from "https://deno.land/x/binary_parser@1.0.0/mod.ts";

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

// assertEqual(myData, decoded);
```
