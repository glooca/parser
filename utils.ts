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
