# Decoder

```ts
type Decoder<T> = (data: Uint8Array, cursor?: Cursor) => Promise<T>;
```

# Encoder

```ts
type Encoder<T> = (data: T) => Promise<Uint8Array>;
```

# Coder

Describes the methods required for decoding and encoding

```ts
interface Coder<T> {
  decode: Decoder<T>;
  encode: Encoder<T>;
}
```

## Usage

```ts
const myData: MyData /* = ... */;
const myCoder: Coder<MyData> /* = ... */;
const encoded = await myCoder.encode(myData);
const decoded = await myCoder.decode(encoded);
assertEqual(myData, decoded);
```

# CoderGenerator

```ts
type CoderGenerator<T, Y> = (instance: Partial<T>) => Coder<Y>;
```

# CodingFormat

```ts
type CodingFormat<T> = (register: RegisterCoder<T>) => void;
```

# RegisterCoder

```ts
type RegisterCoder<T> = <J extends keyof T>(
  coder:
    | CoderInstance<T, T[J]>
    | CoderInstance<T, void>
    | ((instance: Partial<T>) => void),
  name?: J
) => void;
```

# Endian

```ts
export enum Endian {
  Little,
  Big,
}
```

# Cursor

```ts
class Cursor {
  index: number;
  constructor(index?: number);
}
```

## Usage

```ts
const encoded = await myCoder.encode(myData);
const decoded = await myCoder.decode(encoded, new Cursor());
```
