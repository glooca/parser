export class Cursor {
  index: number;
  constructor(index?: number) {
    this.index = index ?? 0;
  }
}

export type Decoder<T> = (data: Uint8Array, cursor?: Cursor) => Promise<T>;
export type Encoder<T> = (data: T) => Promise<Uint8Array>;

export interface Coder<T> {
  decode: Decoder<T>;
  encode: Encoder<T>;
}
