import { Coder, Cursor, Decoder, Encoder } from "./coder.ts";
import { asyncMergeUint8Arrays } from "./utils.ts";

export type CoderGenerator<T, Y> = (instance: Partial<T>) => Coder<Y>;
type CoderInstance<T, Y> = Coder<Y> | CoderGenerator<T, Y>;

type RegisterCoder<T> = <J extends keyof T>(
  coder:
    | CoderInstance<T, T[J]>
    | CoderInstance<T, void>
    | ((instance: Partial<T>) => void),
  name?: J
) => void;
export type CodingFormat<T> = (register: RegisterCoder<T>) => void;

type CoderList<T> = [
  keyof T | undefined,
  CoderInstance<T, T[keyof T] | void> | ((instance: Partial<T>) => void)
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
        | Coder<void | T[keyof T]>
        | CoderGenerator<T, void | T[keyof T]>
        | ((instance: Partial<T>) => void),
    ]);
  });
  return coders;
}

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

export function coderFactory<T>(format: CodingFormat<T>): Coder<T> {
  const coders = parseCoderList(format);
  return {
    decode: decoderFactory(coders),
    encode: encoderFactory(coders),
  };
}

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
