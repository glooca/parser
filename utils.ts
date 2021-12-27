/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

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
