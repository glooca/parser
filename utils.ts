export function numberFrom(bytes: Uint8Array) {
  // if (endian == Endian.Big) bytes.reverse();
  let result = 0;
  let base = 1;
  bytes.forEach((byte) => {
    result += base * byte;
    base *= 256;
  });
  return result;
}

export function bytesFrom(value: number, bytes: number) {
  const original = value;
  const result = new Uint8Array(bytes);
  for (let idx = 0; idx < result.length; idx++) {
    result[idx] = value % 256;
    value = Math.floor(value / 256);
  }
  if (value != 0) {
    console.warn(
      new Error(
        `Failed to store the value ${original} in ${bytes} byte${
          bytes > 1 ? "s" : ""
        }`
      )
    );
  }
  // if (endian == Endian.Big) bytes.reverse();
  return result;
}

export function mergeUint8Arrays(...arrays: Uint8Array[]) {
  let length = 0;
  arrays.forEach((array) => (length += array.length));
  const mergedArray = new Uint8Array(length);
  let offset = 0;
  arrays.forEach((array) => {
    mergedArray.set(array, offset);
    offset += array.length;
  });
  return mergedArray;
}

export async function asyncMergeUint8Arrays(...arrays: Promise<Uint8Array>[]) {
  return mergeUint8Arrays(...(await Promise.all(arrays)));
}
