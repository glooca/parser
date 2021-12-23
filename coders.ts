import { Coder, Cursor } from "./coder.ts";
import { asyncMergeUint8Arrays, mergeUint8Arrays } from "./utils.ts";

export enum Endian {
  Little,
  Big,
}

const defaultEndian = Endian.Big;

export function pad(byteLength: number): Coder<void> {
  return {
    decode(_, cursor = new Cursor()) {
      cursor.index += byteLength;
      return Promise.resolve();
    },
    encode() {
      return Promise.resolve(new Uint8Array(byteLength));
    },
  };
}

export function raw(byteLength: number): Coder<Uint8Array> {
  return {
    decode(data, cursor = new Cursor()) {
      return Promise.resolve(
        data.slice(cursor.index, (cursor.index += byteLength))
      );
    },
    encode(data) {
      if (data.byteLength != byteLength) {
        throw new Error(
          `Failed to store ${data} in ${byteLength} byte${
            byteLength !== 1 ? "s" : ""
          }`
        );
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

export const u8 = numCoder(NumType.u8);
export const u16 = numCoder(NumType.u16);
export const u32 = numCoder(NumType.u32);

export const i8 = numCoder(NumType.i8);
export const i16 = numCoder(NumType.i16);
export const i32 = numCoder(NumType.i32);

export const f32 = numCoder(NumType.f32);
export const f64 = numCoder(NumType.f64);

export function arr<T>(length: number, coder: Coder<T>): Coder<T[]> {
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
        throw new Error(
          `Failed to store ${data.length} elements into an array of length ${length}`
        );
      }
      const encodedValues = data.map((value) => coder.encode(value));
      return asyncMergeUint8Arrays(...encodedValues);
    },
  };
}

function nLenArrCoder<T>(length: Coder<number>, coder: Coder<T>): Coder<T[]> {
  return {
    async decode(data, cursor = new Cursor()) {
      const strLen = await length.decode(data, cursor);
      const retArr: Promise<T>[] = [];
      for (let i = 0; i < strLen; i++) {
        retArr.push(coder.decode(data, cursor));
      }
      return Promise.all(retArr);
    },
    encode(data) {
      return asyncMergeUint8Arrays(
        length.encode(data.length),
        ...data.map((val) => coder.encode(val))
      );
    },
  };
}

export const u8LenArr = <T>(coder: Coder<T>, endian = defaultEndian) =>
  nLenArrCoder(u8(endian), coder);
export const u16LenArr = <T>(coder: Coder<T>, endian = defaultEndian) =>
  nLenArrCoder(u16(endian), coder);
export const u32LenArr = <T>(coder: Coder<T>, endian = defaultEndian) =>
  nLenArrCoder(u32(endian), coder);

export const bool: Coder<boolean> = {
  async decode(data, cursor = new Cursor()) {
    const num = await u8().decode(data, cursor);
    if (num != 0 && num != 1)
      throw new Error(`Failed to read value ${num} as boolean`);
    return num == 1;
  },
  encode(data) {
    return u8().encode(data ? 1 : 0);
  },
};

export function str(byteLength: number): Coder<string> {
  return {
    decode(data, cursor = new Cursor()) {
      return Promise.resolve(
        new TextDecoder().decode(
          data.slice(cursor.index, (cursor.index += byteLength))
        )
      );
    },
    encode(data) {
      const encoded = new TextEncoder().encode(data);
      if (encoded.byteLength != byteLength) {
        throw new Error(
          `Failed to store text "${data}" in ${byteLength} byte${
            byteLength !== 1 ? "s" : ""
          }`
        );
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

export const u8LenStr = (endian = defaultEndian) => nLenStrCoder(u8(endian));
export const u16LenStr = (endian = defaultEndian) => nLenStrCoder(u16(endian));
export const u32LenStr = (endian = defaultEndian) => nLenStrCoder(u32(endian));

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