# Binary parser [![Deno](https://github.com/glooca/parser/actions/workflows/deno.yml/badge.svg?branch=main)](https://github.com/glooca/parser/actions/workflows/deno.yml) [![Coverage](https://img.shields.io/codecov/c/github/glooca/parser?logo=codecov)](https://app.codecov.io/gh/glooca/parser)

A simple parser for easily creating both encoding and decoding for a given data type

# Getting started

Install deno

## Running tests

```bash
deno test
```

# Interfaces

## Coder

Describes the methods required for decoding and encoding

```ts
interface Coder<T> {
  decode(data: Uint8Array, cursor?: Cursor): Promise<T>;
  encode(data: T): Promise<Uint8Array>;
}
```

### Usage

```ts
const myData: MyData /* = ... */;
const myCoder: Coder<MyData> /* = ... */;
const encoded = await myCoder.encode(myData);
const decoded = await myCoder.decode(encoded);
assertEqual(myData, decoded);
```

# Classes

## Cursor

```ts
class Cursor {
  index: number;
  constructor(index?: number);
}
```

### Usage

```ts
const encoded = await myCoder.encode(myData);
const decoded = await myCoder.decode(encoded, new Cursor());
```

# Creating your own coders

Besides implementing `Coder<T>` you can create coders with the following functions

## coderFactory

Note: `name` field can only be left empty with coders of type `Coder<Void>`

Note: Any valid coder can be registered, even your own

```ts
function coderFactory<T, K extends keyof T>(
  format: (
    register: <J extends K>(
      coder: Coder<T[J] | void> | CoderGenerator<T, T[J] | void>,
      // coder: Coder<T[K] | void> | CoderGenerator<T, T[K] | void>,
      name?: J
    ) => void
  ) => void
): Coder<T>;
```

### Usage

```ts
interface MyInterface {
  someProp: number;
  anotherProp: string;
}
const myCoder: Coder<MyInterface> = coderFactory((r) => {
  r(u32, "someProp");
  r(pad(2));
  r(nullTermStr, "anotherProp");
});
```

## typedCoderFactory

Note: `name` field can only be left empty with coders of type `Coder<Void>`

Note: Any valid coder can be registered, even your own

```ts
function typedCoderFactory<T, K extends keyof T>(
  type: new (...args: any) => T,
  format: (
    register: <J extends keyof T>(
      coder: Coder<T[J] | void> | CoderGenerator<T, T[J] | void>,
      name?: J
    ) => void
  ) => void
): Coder<T>;
```

### Usage

```ts
class MyClass {
  someProp: number;
  anotherProp: string;
  constructor(someProp = 0, anotherProp = "") {
    this.someProp = someProp;
    this.anotherProp = anotherProp;
  }
}
const myCoder: Coder<MyClass> = typedCoderFactory(MyClass, (r) => {
  r(u32, "someProp");
  r(pad(2));
  r(nullTermStr, "anotherProp");
});
```

# Coders

## pad

Advances the cursor `byteLength` bytes

```ts
function pad(byteLength: number): Coder<void>;
```

## raw

Reads `byteLength` bytes into a Uint8Array

```ts
function raw(byteLength: number): Coder<Uint8Array>;
```

## u8

Reads a byte as an unsigned integer

```ts
const u8: Coder<number>;
```

## u16

Reads 2 bytes as an unsigned integer

```ts
const u16: Coder<number>;
```

## u32

Reads 4 bytes as an unsigned integer

```ts
const u32: Coder<number>;
```

## arr

Reads `length` amount of elements with the specified `coder`

When encoding inserts `defaultVal` if the data doesn't contain enough elements

```ts
function arr<T>(length: number, coder: Coder<T>, defaultVal?: T): Coder<T[]>;
```

## bool

Reads a byte as a boolean value 0x00 being false and 0x01 being true

```ts
const bool: Coder<boolean>;
```

## str

Reads a fixed length string

```ts
function str(byteLength: number): Coder<string>;
```

## u8LenStr

First reads a `u8` value and then its amount of bytes as string

```ts
const u8LenStr: Coder<string>;
```

## u16LenStr

First reads a `u16` value and then its amount of bytes as string

```ts
const u16LenStr: Coder<string>;
```

## u32LenStr

First reads a `u32` value and then its amount of bytes as string

```ts
const u32LenStr: Coder<string>;
```

## nullTermStr

Reads bytes until a null byte or end of file is reached as string

```ts
const nullTermStr: Coder<string>;
```
