import {
  asyncMergeUint8Arrays,
  bytesFrom,
  mergeUint8Arrays,
  numberFrom,
} from "./utils.ts";

export class Cursor {
  index: number;
  constructor(index?: number) {
    this.index = index ?? 0;
  }
}

export interface Coder<T> {
  decode(data: Uint8Array, cursor?: Cursor): Promise<T>;
  encode(data: T): Promise<Uint8Array>;
}

type CoderGenerator<T, Y> = (instance: Partial<T>) => Coder<Y>;
export function coderFactory<T, K extends keyof T>(
  format: (
    register: <J extends K>(
      coder: Coder<T[J] | void> | CoderGenerator<T, T[J] | void>,
      // coder: Coder<T[K] | void> | CoderGenerator<T, T[K] | void>,
      name?: J
    ) => void
  ) => void
): Coder<T> {
  const coders: [
    K | undefined,
    Coder<T[K] | void> | CoderGenerator<T, T[K] | void>
  ][] = [];
  format((coder, name) => {
    coders.push([name, coder]);
  });
  return {
    async decode(data, cursor = new Cursor()) {
      const retVal: Partial<T> = {};
      for (let i = 0; i < coders.length; i++) {
        let [name, coder] = coders[i];
        if (typeof coder === "function") coder = coder(retVal as T);
        const decodedData = await coder.decode(data, cursor);
        if (name) retVal[name] = decodedData ?? undefined;
      }
      return retVal as T;
    },
    encode(data) {
      return asyncMergeUint8Arrays(
        ...coders.map(([name, coder]) => {
          if (typeof coder === "function") coder = coder(data);
          return coder.encode(name ? data[name] : undefined);
        })
      );
    },
  };
}

export function typedCoderFactory<T, K extends keyof T>(
  // deno-lint-ignore no-explicit-any
  type: new (...args: any) => T,
  format: (
    register: <J extends keyof T>(
      coder: Coder<T[J] | void> | CoderGenerator<T, T[J] | void>,
      name?: J
    ) => void
  ) => void
): Coder<T> {
  const coder: Coder<T> = coderFactory(format);
  return {
    async decode(data, cursor = new Cursor()) {
      const obj = Object.create(type.prototype);
      const val = await coder.decode(data, cursor);
      Object.assign(obj, val);
      return obj;
    },
    async encode(data) {
      return await coder.encode(data);
    },
  };
}

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
        console.warn(
          new Error(
            `Failed to store ${data} in ${byteLength} byte${
              byteLength > 1 ? "s" : ""
            }`
          )
        );
        if (data.byteLength > byteLength) {
          data = new Uint8Array(data.slice(0, byteLength));
        } else {
          data = new Uint8Array(byteLength).map((_, index) =>
            byteLength < data.byteLength ? data[index] : 0
          );
        }
      }
      return Promise.resolve(data);
    },
  };
}

function numCoder(byteLength: number): Coder<number> {
  return {
    async decode(data, cursor = new Cursor()) {
      return numberFrom(await raw(byteLength).decode(data, cursor));
    },
    encode(data) {
      return raw(byteLength).encode(bytesFrom(data, byteLength));
    },
  };
}

export const u8 = numCoder(1);
export const u16 = numCoder(2);
export const u32 = numCoder(4);

export function arr<T>(
  length: number,
  coder: Coder<T>,
  defaultVal?: T
): Coder<T[]> {
  return {
    async decode(data, cursor = new Cursor()) {
      const retVal: T[] = [];
      for (let i = 0; i < length; i++) {
        retVal.push(await coder.decode(data, cursor));
      }
      return retVal;
    },
    encode(data) {
      let encodedValues = data.map((value) => coder.encode(value));
      if (encodedValues.length != length) {
        console.warn(
          new Error(
            `Failed to store ${encodedValues.length} elements into an array of length ${length}`
          )
        );
        if (encodedValues.length > length) {
          encodedValues = encodedValues.slice(0, length);
        } else if (defaultVal != null) {
          while (encodedValues.length < length) {
            encodedValues.push(coder.encode(defaultVal));
          }
        } else {
          console.warn(
            new Error(
              `Failed to create an array of ${coder.constructor.name} with length ${length}`
            )
          );
        }
      }
      return asyncMergeUint8Arrays(...encodedValues);
    },
  };
}

export const bool: Coder<boolean> = {
  async decode(data, cursor = new Cursor()) {
    const num = await u8.decode(data, cursor);
    if (num != 0 && num != 1)
      console.warn(new Error(`Failed to read value ${num} as boolean`));
    return num == 1;
  },
  encode(data) {
    return u8.encode(data ? 1 : 0);
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
      let encoded = new TextEncoder().encode(data);
      if (encoded.byteLength != byteLength) {
        console.warn(
          new Error(
            `Failed to store text "${data}" in ${byteLength} byte${
              byteLength > 1 ? "s" : ""
            }`
          )
        );
        if (encoded.byteLength > byteLength) {
          encoded = new Uint8Array(encoded.slice(0, byteLength));
        } else {
          encoded = new Uint8Array(byteLength).map((_, index) =>
            byteLength < encoded.byteLength ? encoded[index] : 0x00
          );
        }
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

export const u8LenStr = nLenStrCoder(u8);
export const u16LenStr = nLenStrCoder(u16);
export const u32LenStr = nLenStrCoder(u32);

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
