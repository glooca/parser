/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Coder, Cursor, Decoder, Encoder } from "./coder.ts";
import { asyncMergeUint8Arrays } from "./utils.ts";

export type CoderGenerator<T, Y> =
  | Coder<Y>
  | ((instance: Partial<T>) => Coder<Y> | void);

/**
 * Describes the binary layout
 *
 * # Usage
 *
 * ```ts
 * interface MyInterface {
 *   someProp: number;
 *   anotherProp: string;
 * }
 * const myInterfaceCodingFormat: CodingFormat<MyInterface> = (r) => {
 *   r(u32(), "someProp");
 *   r(pad(2));
 *   r(nullTermStr, "anotherProp");
 * };
 * ```
 */
export type CodingFormat<T> = (
  register: <J extends keyof T>(
    coder: CoderGenerator<T, T[J]> | CoderGenerator<T, void>,
    name?: J
  ) => void
) => void;

type CoderList<T> = [
  keyof T | undefined,
  CoderGenerator<T, T[keyof T] | void> | ((instance: Partial<T>) => void)
][];

function parseCoderList<T>(
  format: CodingFormat<T> | CoderList<T>
): CoderList<T> {
  if (typeof format !== "function") return format;
  const coders: CoderList<T> = [];
  format((coder, name) => {
    coders.push([
      name,
      coder as
        | CoderGenerator<T, void | T[keyof T]>
        | ((instance: Partial<T>) => void),
    ]);
  });
  return coders;
}

/**
 * Creates a `Decoder` for a given `CodingFormat`
 *
 * # Usage
 *
 * ```ts
 * const myCoder: Coder<MyInterface> = {
 *   decode: decoderFactory(myInterfaceCodingFormat),
 *   encode: encoderFactory(myInterfaceCodingFormat),
 * };
 * ```
 */
export function decoderFactory<T>(
  data: CodingFormat<T> | CoderList<T>
): Decoder<T> {
  const coders = parseCoderList(data);
  return async function (data, cursor = new Cursor()) {
    const retVal: Partial<T> = {};
    for (let i = 0; i < coders.length; i++) {
      let [name, coder] = coders[i];
      if (typeof coder === "function") {
        const res = coder(retVal);
        if (res == null) continue;
        coder = res;
      }
      const decodedData = await coder.decode(data, cursor);
      if (name) retVal[name] = decodedData ?? undefined;
    }
    return retVal as T;
  };
}

/**
 * Creates a `Decoder` for a given `CodingFormat`
 *
 * Assigns the decoded value to a new object with type `type`
 *
 * # Usage
 *
 * ```ts
 * const myClassCodingFormat: CodingFormat<MyClass> = (r) => {
 *   r(nullTermStr, "param");
 * };
 * class MyClass implements Coder<MyClass> {
 *   param = "Hello, World!";
 *   decode = typedDecoderFactory(MyClass, myClassCodingFormat);
 *   encode = encoderFactory(myClassCodingFormat);
 * }
 * ```
 */
export function typedDecoderFactory<T>(
  // deno-lint-ignore no-explicit-any
  type: new (...args: any) => T,
  data: CodingFormat<T> | CoderList<T>
): Decoder<T> {
  const decoder = decoderFactory(data);
  return async function (data, cursor = new Cursor()) {
    const obj = Object.create(type.prototype);
    const val = await decoder(data, cursor);
    Object.assign(obj, val);
    return obj;
  };
}

/**
 * Creates an `Encoder` for a given `CodingFormat`
 *
 * # Usage
 *
 * ```ts
 * const myCoder: Coder<MyInterface> = {
 *   decode: decoderFactory(myInterfaceCodingFormat),
 *   encode: encoderFactory(myInterfaceCodingFormat),
 * };
 * ```
 */
export function encoderFactory<T>(
  data: CodingFormat<T> | CoderList<T>
): Encoder<T> {
  const coders = parseCoderList(data);
  return function (data: T) {
    return asyncMergeUint8Arrays(
      ...coders.map(([name, coder]) => {
        if (typeof coder === "function") {
          const res = coder(data);
          if (res == null) return Promise.resolve(new Uint8Array());
          coder = res;
        }
        return coder.encode(name ? data[name] : undefined);
      })
    );
  };
}

/**
 * Creates a `Coder` for a given `CodingFormat`
 *
 * # Usage
 *
 * ```ts
 * const myCoder = coderFactory(myInterfaceCodingFormat);
 * ```
 */
export function coderFactory<T>(format: CodingFormat<T>): Coder<T> {
  const coders = parseCoderList(format);
  return {
    decode: decoderFactory(coders),
    encode: encoderFactory(coders),
  };
}

/**
 * Creates a `Coder` for a given `CodingFormat`
 * Assigns the decoded value to a new object with type `type`
 *
 * See `typedDecoderFactory` if you want to implement `Coder` for a class
 *
 * # Usage
 *
 * ```ts
 * const myCoder = typedCoderFactory(myClassCodingFormat);
 * ```
 */
export function typedCoderFactory<T>(
  // deno-lint-ignore no-explicit-any
  type: new (...args: any) => T,
  format: CodingFormat<T>
): Coder<T> {
  const coders = parseCoderList(format);
  return {
    decode: typedDecoderFactory(type, coders),
    encode: encoderFactory(coders),
  };
}
