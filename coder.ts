/**
 * # Usage
 * ```ts
 * const encoded = await myCoder.encode(myData);
 * const decoded = await myCoder.decode(encoded, new Cursor());
 * ```
 */
export class Cursor {
  index: number;
  constructor(index?: number) {
    this.index = index ?? 0;
  }
}

export type Decoder<T> = (data: Uint8Array, cursor?: Cursor) => Promise<T>;
export type Encoder<T> = (data: T) => Promise<Uint8Array>;

/**
 * Describes the methods required for decoding and encoding
 * # Usage
 * ```ts
 * const myData: MyData = ...;
 * const myCoder: Coder<MyData> = ...;
 * const encoded = await myCoder.encode(myData);
 * const decoded = await myCoder.decode(encoded);
 * // assertEqual(myData, decoded);
 * ```
 */
export interface Coder<T> {
  decode: Decoder<T>;
  encode: Encoder<T>;
}
