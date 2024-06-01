// Taken from https://stackoverflow.com/a/46720474

function radixSortUint32(input: Uint32Array) {
  const arrayConstr = input.length < 1 << 16 ? Uint16Array : Uint32Array;
  const numberOfBins = 256 * 4;
  let count = new arrayConstr(numberOfBins);

  let output = new Uint32Array(input.length);

  // count all bytes in one pass
  for (let i = 0; i < input.length; i++) {
    let val = input[i];
    count[val & 0xff]++;
    count[((val >> 8) & 0xff) + 256]++;
    count[((val >> 16) & 0xff) + 512]++;
    count[((val >> 24) & 0xff) + 768]++;
  }

  // create summed array
  for (let j = 0; j < 4; j++) {
    let t = 0,
      sum = 0,
      offset = j * 256;
    for (let i = 0; i < 256; i++) {
      t = count[i + offset];
      count[i + offset] = sum;
      sum += t;
    }
  }

  for (let i = 0; i < input.length; i++) {
    let val = input[i];
    output[count[val & 0xff]++] = val;
  }
  for (let i = 0; i < input.length; i++) {
    let val = output[i];
    input[count[((val >> 8) & 0xff) + 256]++] = val;
  }
  for (let i = 0; i < input.length; i++) {
    let val = input[i];
    output[count[((val >> 16) & 0xff) + 512]++] = val;
  }
  for (let i = 0; i < input.length; i++) {
    let val = output[i];
    input[count[((val >> 24) & 0xff) + 768]++] = val;
  }

  return input;
}

function radixSortBigUint64(input: BigUint64Array) {
  const arrayConstr = input.length < 1 << 16 ? Uint16Array : Uint32Array;
  const numberOfBins = 256 * 8;
  let count = new arrayConstr(numberOfBins);
  let output = new BigUint64Array(input.length);

  // count all bytes in one pass
  for (let i = 0; i < input.length; i++) {
    let val = input[i];
    count[Number(val & 0xffn)]++;
    count[Number((val >> 8n) & 0xffn) + 256]++;
    count[Number((val >> 16n) & 0xffn) + 512]++;
    count[Number((val >> 24n) & 0xffn) + 768]++;
    count[Number((val >> 32n) & 0xffn) + 1024]++;
    count[Number((val >> 40n) & 0xffn) + 1280]++;
    count[Number((val >> 48n) & 0xffn) + 1536]++;
    count[Number((val >> 56n) & 0xffn) + 1792]++;
  }

  // create summed array
  for (let j = 0; j < 8; j++) {
    let t = 0,
      sum = 0,
      offset = j * 256;
    for (let i = 0; i < 256; i++) {
      t = count[i + offset];
      count[i + offset] = sum;
      sum += t;
    }
  }

  for (let i = 0; i < input.length; i++) {
    let val = input[i];
    output[count[Number(val & 0xffn)]++] = val;
  }

  for (let i = 0; i < input.length; i++) {
    let val = output[i];
    input[count[Number((val >> 8n) & 0xffn) + 256]++] = val;
  }

  for (let i = 0; i < input.length; i++) {
    let val = input[i];
    output[count[Number((val >> 16n) & 0xffn) + 512]++] = val;
  }

  for (let i = 0; i < input.length; i++) {
    let val = output[i];
    input[count[Number((val >> 24n) & 0xffn) + 768]++] = val;
  }

  for (let i = 0; i < input.length; i++) {
    let val = input[i];
    output[count[Number((val >> 32n) & 0xffn) + 1024]++] = val;
  }

  for (let i = 0; i < input.length; i++) {
    let val = output[i];
    input[count[Number((val >> 40n) & 0xffn) + 1280]++] = val;
  }

  for (let i = 0; i < input.length; i++) {
    let val = input[i];
    output[count[Number((val >> 48n) & 0xffn) + 1536]++] = val;
  }

  for (let i = 0; i < input.length; i++) {
    let val = output[i];
    input[count[Number((val >> 56n) & 0xffn) + 1792]++] = val;
  }

  return input;
}

function radixSortInt32(input: Int32Array) {
  // make use of ArrayBuffer to "reinterpret cast"
  // the Int32Array as a Uint32Array
  let uinput = input.buffer ? new Uint32Array(input.buffer) : Uint32Array.from(input);

  // adjust to positive nrs
  for (let i = 0; i < uinput.length; i++) {
    uinput[i] += 0x80000000;
  }

  // re-use radixSortUint32
  radixSortUint32(uinput);

  // adjust back to signed nrs
  for (let i = 0; i < uinput.length; i++) {
    uinput[i] -= 0x80000000;
  }

  // for plain arrays, fake in-place behaviour
  if (input.buffer === undefined) {
    for (let i = 0; i < input.length; i++) {
      input[i] = uinput[i];
    }
  }

  return input;
}

function radixSortBigInt64(input: BigInt64Array) {
  // make use of ArrayBuffer to "reinterpret cast"
  // the BigInt64Array as a BigUint64Array
  let uinput = input.buffer ? new BigUint64Array(input.buffer) : BigUint64Array.from(input);

  // adjust to positive nrs
  for (let i = 0; i < uinput.length; i++) {
    uinput[i] += 0x8000000000000000n;
  }

  // re-use radixSortBigUint64
  radixSortBigUint64(uinput);

  // adjust back to signed nrs
  for (let i = 0; i < uinput.length; i++) {
    uinput[i] -= 0x8000000000000000n;
  }

  // for plain arrays, fake in-place behaviour
  if (input.buffer === undefined) {
    for (let i = 0; i < input.length; i++) {
      input[i] = uinput[i];
    }
  }

  return input;
}

function radixSortFloat32(input: Float32Array) {
  // make use of ArrayBuffer to "reinterpret cast"
  // the Float32Array as a Uint32Array
  let uinput = input.buffer ? new Uint32Array(input.buffer) : new Uint32Array(Float32Array.from(input).buffer);

  // Similar to radixSortInt32, but uses a more complicated trick
  // See: http://stereopsis.com/radixSort.html
  for (let i = 0; i < uinput.length; i++) {
    if (uinput[i] & 0x80000000) {
      uinput[i] ^= 0xffffffff;
    } else {
      uinput[i] ^= 0x80000000;
    }
  }

  // re-use radixSortUint32
  radixSortUint32(uinput);

  // adjust back to original floating point nrs
  for (let i = 0; i < uinput.length; i++) {
    if (uinput[i] & 0x80000000) {
      uinput[i] ^= 0x80000000;
    } else {
      uinput[i] ^= 0xffffffff;
    }
  }

  if (input.buffer === undefined) {
    let floatTemp = new Float32Array(uinput.buffer);
    for (let i = 0; i < input.length; i++) {
      input[i] = floatTemp[i];
    }
  }

  return input;
}

const newRadixSortFloat32 = (arr: Float32Array) => {
  const getRadixKey = (value: number, pos: number): number => {
    const floatView = new Float32Array(1);
    const intView = new Uint32Array(floatView.buffer);
    floatView[0] = value;
    return (intView[0] >>> (pos * 8)) & 0xff;
  };

  const numElements = arr.length;
  const aux = new Float32Array(numElements);

  for (let pos = 0; pos < 4; pos++) {
    const count: number[] = new Array(256).fill(0);

    for (let i = 0; i < numElements; i++) {
      const radixKey = getRadixKey(arr[i], pos);
      count[radixKey]++;
    }

    for (let i = 1; i < 256; i++) {
      count[i] += count[i - 1];
    }

    for (let i = numElements - 1; i >= 0; i--) {
      const radixKey = getRadixKey(arr[i], pos);
      aux[--count[radixKey]] = arr[i];
    }

    arr.set(aux);
  }
};

export { newRadixSortFloat32, radixSortUint32, radixSortBigUint64, radixSortInt32, radixSortBigInt64, radixSortFloat32 };