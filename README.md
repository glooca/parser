> [!NOTE]
> This repository has been archived and is no longer maintained.

# Binary parser

[![Deno](https://github.com/glooca/parser/actions/workflows/deno.yml/badge.svg?branch=main)](https://github.com/glooca/parser/actions/workflows/deno.yml)
[![Coverage](https://img.shields.io/codecov/c/github/glooca/parser?logo=codecov)](https://app.codecov.io/gh/glooca/parser)
[![deno land](https://img.shields.io/badge/available%20on-deno.land%2Fx-white?logo=deno&labelColor=black)](https://deno.land/x/binary_parser)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/binary_parser/mod.ts)
[![license](https://img.shields.io/github/license/glooca/parser)](LICENSE)

A simple parser for easily creating both encoding and decoding for a given data type

This project has no dependencies and should work in any typescript environment although it was developed mainly for deno

## Running tests

```bash
deno test
```

# :tada: Getting started

Import what you need from `mod.ts`

## :pencil: Docs

Can be found at https://github.com/glooca/parser/wiki

There's also deno's [auto generated docs](https://doc.deno.land/https/deno.land/x/binary_parser/mod.ts)

## :pencil2: Example

```ts
import {
  coderFactory,
  nullTermStr,
  pad,
  u32,
} from "https://deno.land/x/binary_parser/mod.ts";

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
