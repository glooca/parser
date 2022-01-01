/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Coder, Cursor } from "./coder.ts";
import { asyncMergeUint8Arrays, mergeUint8Arrays } from "./utils.ts";

export enum Endian {
  Little,
  Big,
}

const defaultEndian = Endian.Big;

function assertBytelength(byteLength: number) {
  if (byteLength < 0 || byteLength % 1 != 0)
    throw new Error("Bytelength must be a positive integer");
}
function assertCursorInDataOrAtEnd(cursor: Cursor, data: Uint8Array) {
  if (cursor.index < 0 || cursor.index > data.byteLength)
    throw new Error("Cursor index outside the data range");
}

/**
 * When encoding advances cursor `byteLength` bytes, when decoding returns a null byte array with `byteLength`
 */
export function pad(byteLength: number): Coder<void> {
  assertBytelength(byteLength);
  return {
    decode(data, cursor = new Cursor()) {
      cursor.index += byteLength;
      assertCursorInDataOrAtEnd(cursor, data);
      return Promise.resolve();
    },
    encode() {
      return Promise.resolve(new Uint8Array(byteLength));
    },
  };
}

/**
 * Reads `byteLength` bytes into a `Uint8Array`
 */
export function raw(byteLength: number): Coder<Uint8Array> {
  assertBytelength(byteLength);
  return {
    decode(data, cursor = new Cursor()) {
      const slice = data.slice(cursor.index, (cursor.index += byteLength));
      assertCursorInDataOrAtEnd(cursor, data);
      return Promise.resolve(slice);
    },
    encode(data) {
      if (data.byteLength != byteLength) {
        throw new Error("Data bytelength doesn't match the raw bytelength");
      }
      return Promise.resolve(data);
    },
  };
}

enum NumType {
  u8,
  u16,
  u32,
  i8,
  i16,
  i32,
  f32,
  f64,
}
const numData = {
  [NumType.u8]: {
    len: 1,
    get: (dv: DataView) => dv.getUint8.bind(dv),
    set: (dv: DataView) => dv.setUint8.bind(dv),
  },
  [NumType.u16]: {
    len: 2,
    get: (dv: DataView) => dv.getUint16.bind(dv),
    set: (dv: DataView) => dv.setUint16.bind(dv),
  },
  [NumType.u32]: {
    len: 4,
    get: (dv: DataView) => dv.getUint32.bind(dv),
    set: (dv: DataView) => dv.setUint32.bind(dv),
  },
  [NumType.i8]: {
    len: 1,
    get: (dv: DataView) => dv.getInt8.bind(dv),
    set: (dv: DataView) => dv.setInt8.bind(dv),
  },
  [NumType.i16]: {
    len: 2,
    get: (dv: DataView) => dv.getInt16.bind(dv),
    set: (dv: DataView) => dv.setInt16.bind(dv),
  },
  [NumType.i32]: {
    len: 4,
    get: (dv: DataView) => dv.getInt32.bind(dv),
    set: (dv: DataView) => dv.setInt32.bind(dv),
  },
  [NumType.f32]: {
    len: 4,
    get: (dv: DataView) => dv.getFloat32.bind(dv),
    set: (dv: DataView) => dv.setFloat32.bind(dv),
  },
  [NumType.f64]: {
    len: 8,
    get: (dv: DataView) => dv.getFloat64.bind(dv),
    set: (dv: DataView) => dv.setFloat64.bind(dv),
  },
};
function numCoder(numType: NumType) {
  return (endian = defaultEndian): Coder<number> => {
    return {
      decode(data, cursor = new Cursor()) {
        const { len, get } = numData[numType];
        const dv = new DataView(data.buffer);
        const num = get(dv)(cursor.index, endian === Endian.Little);
        cursor.index += len;
        return Promise.resolve(num);
      },
      encode(data) {
        const { len, set } = numData[numType];
        const dv = new DataView(new Uint8Array(len).buffer);
        set(dv)(0, data, endian === Endian.Little);
        return Promise.resolve(new Uint8Array(dv.buffer));
      },
    };
  };
}

/**
 * Reads a byte as an unsigned 8 bit integer
 */
export const u8: Coder<number> = numCoder(NumType.u8)();
/**
 * Reads 2 bytes as an unsigned 16 bit integer
 */
export const u16: (endian?: Endian) => Coder<number> = numCoder(NumType.u16);
/**
 * Reads 4 bytes as an unsigned 32 bit integer
 */
export const u32: (endian?: Endian) => Coder<number> = numCoder(NumType.u32);

/**
 * Reads a byte as a signed 8 bit integer
 */
export const i8: Coder<number> = numCoder(NumType.i8)();
/**
 * Reads 2 bytes as a signed 16 bit integer
 */
export const i16: (endian?: Endian) => Coder<number> = numCoder(NumType.i16);
/**
 * Reads 4 bytes as a signed 32 bit integer
 */
export const i32: (endian?: Endian) => Coder<number> = numCoder(NumType.i32);

/**
 * Reads 4 bytes as a 32 bit floating point number
 */
export const f32: (endian?: Endian) => Coder<number> = numCoder(NumType.f32);
/**
 * Reads 8 bytes as a 64 bit floating point number
 */
export const f64: (endian?: Endian) => Coder<number> = numCoder(NumType.f64);

/**
 * Reads `length` amount of elements with the specified `coder` as an array
 *
 * When encoding `throws` if the data doesn't contain `length` elements
 */
export function arr<T>(length: number, coder: Coder<T>): Coder<T[]> {
  if (length < 0 || length % 1 != 0)
    throw new Error("Array length must be a positive integer");
  return {
    async decode(data, cursor = new Cursor()) {
      const retVal: T[] = [];
      for (let i = 0; i < length; i++) {
        retVal.push(await coder.decode(data, cursor));
      }
      return retVal;
    },
    encode(data) {
      if (data.length != length) {
        throw new Error("Data length doesn't match the array length");
      }
      const encodedValues = data.map((value) => coder.encode(value));
      return asyncMergeUint8Arrays(...encodedValues);
    },
  };
}

function nLenArrCoder<T>(length: Coder<number>, coder: Coder<T>): Coder<T[]> {
  return {
    async decode(data, cursor = new Cursor()) {
      const arrLen = await length.decode(data, cursor);
      return arr(arrLen, coder).decode(data, cursor);
    },
    encode(data) {
      return asyncMergeUint8Arrays(
        length.encode(data.length),
        arr(data.length, coder).encode(data)
      );
    },
  };
}

/**
 * Reads a `u8`, then reads its number of specified coders as an array
 */
export const u8LenArr: <T>(coder: Coder<T>) => Coder<T[]> = (coder) =>
  nLenArrCoder(u8, coder);
/**
 * Reads a `u16`, then reads its number of specified coders as an array
 */
export const u16LenArr: <T>(coder: Coder<T>, endian?: Endian) => Coder<T[]> = (
  coder,
  endian = defaultEndian
) => nLenArrCoder(u16(endian), coder);
/**
 * Reads a `u32`, then reads its number of specified coders as an array
 */
export const u32LenArr: <T>(coder: Coder<T>, endian?: Endian) => Coder<T[]> = (
  coder,
  endian = defaultEndian
) => nLenArrCoder(u32(endian), coder);

/**
 * Reads a byte as a boolean value 0x00 being false and 0x01 being true
 */
export const bool: Coder<boolean> = {
  async decode(data, cursor = new Cursor()) {
    const num = await u8.decode(data, cursor);
    if (num != 0 && num != 1)
      throw new Error(`Failed to read value ${num} as boolean`);
    return num == 1;
  },
  encode(data) {
    return u8.encode(data ? 1 : 0);
  },
};

/**
 * Reads a fixed `byteLength` string
 *
 * When encoding `throws` if the `byteLength` doesn't match the data
 */
export function str(byteLength: number): Coder<string> {
  assertBytelength(byteLength);
  return {
    decode(data, cursor = new Cursor()) {
      const str = new TextDecoder().decode(
        data.slice(cursor.index, (cursor.index += byteLength))
      );
      assertCursorInDataOrAtEnd(cursor, data);
      return Promise.resolve(str);
    },
    encode(data) {
      const encoded = new TextEncoder().encode(data);
      if (encoded.byteLength != byteLength) {
        throw new Error("Data bytelength doesn't match the str bytelength");
      }
      return Promise.resolve(encoded);
    },
  };
}

function nLenStrCoder(length: Coder<number>): Coder<string> {
  return {
    async decode(data, cursor = new Cursor()) {
      const strLen = await length.decode(data, cursor);
      return str(strLen).decode(data, cursor);
    },
    async encode(data) {
      const encoded = new TextEncoder().encode(data);
      return mergeUint8Arrays(await length.encode(encoded.length), encoded);
    },
  };
}

/**
 * Reads a `u8`, then reads its number of bytes as a string
 */
export const u8LenStr: Coder<string> = nLenStrCoder(u8);
/**
 * Reads a `u16`, then reads its number of bytes as a string
 */
export const u16LenStr: (endian?: Endian) => Coder<string> = (
  endian = defaultEndian
) => nLenStrCoder(u16(endian));
/**
 * Reads a `u32`, then reads its number of bytes as a string
 */
export const u32LenStr: (endian?: Endian) => Coder<string> = (
  endian = defaultEndian
) => nLenStrCoder(u32(endian));

/**
 * Reads bytes until a null byte or the end of the data is reached as string
 */
export const nullTermStr: Coder<string> = {
  decode(data, cursor = new Cursor(0)) {
    let nullIndex = cursor.index;
    while (nullIndex + 1 < data.length && data[nullIndex] != 0x00) {
      nullIndex++;
    }
    const val = str(nullIndex - cursor.index).decode(data, cursor);
    pad(1).decode(data, cursor); // Null byte
    return val;
  },
  encode(data) {
    return Promise.resolve(
      mergeUint8Arrays(new TextEncoder().encode(data), new Uint8Array([0x00]))
    );
  },
};
