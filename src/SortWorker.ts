/* eslint-disable no-restricted-globals */
/// <reference lib="WebWorker" />
const ctx: Worker = self as any;

type viewProjectionMatrix = number[];
let viewProj: viewProjectionMatrix;
let buffer: ArrayBuffer;
let numVertex: number = 0;
let numSplat: number = 0;

const rowLength: number = 3 * 4 + 3 * 4 + 4 + 4;
let depthBuffer: BigInt64Array = new BigInt64Array(numVertex); // Unpacking float32 to ints for radix sort
let lastProj: viewProjectionMatrix = [];

const depthSort = (view: viewProjectionMatrix) => {
  viewProj = view;
  if (!buffer) {
    console.log('Buffer not loaded yet');
    return;
  }

  numVertex = buffer.byteLength / rowLength;
  /* Data is stored in the buffer as follows:
   * 3 Float32 for Position (x, y, z)
   * 3 Float32 for Scale (x, y, z)
   * 4 Uint8 for Color (r, g, b, alpha)
   * 4 Uint8 for Quat (a, b, c, d)
   *
   * We need to unpack the buffer into a depth buffer for radix sort
   * Using the view projection matrix, we can sort the splats based off of their depth
   */

  // Accessing the buffer based on types
  const fBuffer = new Float32Array(buffer);
  const uBuffer = new Uint8Array(buffer);

  // To store sorted data
  const center = new Float32Array(numVertex * 3);
  const scale = new Float32Array(numVertex * 3);
  const color = new Float32Array(numVertex * 4);
  const quat = new Float32Array(numVertex * 4);

  // If the depth buffer is not the same size as the number of
  // vertices, resize it (and indexBuffers)
  if (depthBuffer.length !== numVertex) {
    depthBuffer = new BigInt64Array(numVertex);
    const indexBuffer = new Uint32Array(depthBuffer.buffer);
    for (let i = 0; i < numVertex; i++) {
      indexBuffer[2 * i] = i;
    }
  }
  // Depth buffer correct, check angle between lastProj and viewProj
  else {
    let viewDifference =
      lastProj[2] * viewProj[2] +
      lastProj[6] * viewProj[6] +
      lastProj[10] * viewProj[10];
    if (Math.abs(viewDifference - 1) < 0.01)
      // Very small angle change, assume nonimportant change in depthBuffer
      return;
  }

  const projectedDepthBuffer = new Float32Array(depthBuffer.buffer);
  const indexBuffer = new Uint32Array(depthBuffer.buffer);

  // Iterate over each splat and compute the projected depth
  for (let i = 0; i < numVertex; i++) {
    let splatIdx = indexBuffer[2 * i];
    projectedDepthBuffer[2 * i + 1] =
      10000 -
      (viewProj[2] * fBuffer[8 * splatIdx + 0] +
        viewProj[6] * fBuffer[8 * splatIdx + 1] +
        viewProj[10] * fBuffer[8 * splatIdx + 2]);
  }

  // Update old view to current view
  lastProj = viewProj;

  // Sort the depth buffer
  depthBuffer.sort();
  // TODO: Use radix sort to sort the depth buffer
  // radixSortBigInt64(depthBuffer);

  // Reorder the splats based on the sorted depth buffer
  for (let i = 0; i < numVertex; i++) {
    let splatIdx = indexBuffer[2 * i];
    // Update Position
    center[3 * i + 0] = fBuffer[8 * splatIdx + 0];
    center[3 * i + 1] = fBuffer[8 * splatIdx + 1];
    center[3 * i + 2] = fBuffer[8 * splatIdx + 2];

    // Update Scale
    scale[3 * i + 0] = fBuffer[8 * splatIdx + 3 + 0];
    scale[3 * i + 1] = fBuffer[8 * splatIdx + 3 + 1];
    scale[3 * i + 2] = fBuffer[8 * splatIdx + 3 + 2];

    // Update Color (and normalize to [0, 1] range)
    color[4 * i + 0] = uBuffer[32 * splatIdx + 24 + 0] / 255;
    color[4 * i + 1] = uBuffer[32 * splatIdx + 24 + 1] / 255;
    color[4 * i + 2] = uBuffer[32 * splatIdx + 24 + 2] / 255;
    color[4 * i + 3] = uBuffer[32 * splatIdx + 24 + 3] / 255;

    // Update Rotations (and normalize to [-1, 1] range)
    quat[4 * i + 0] = (uBuffer[32 * splatIdx + 28 + 0] - 128) / 128;
    quat[4 * i + 1] = (uBuffer[32 * splatIdx + 28 + 1] - 128) / 128;
    quat[4 * i + 2] = (uBuffer[32 * splatIdx + 28 + 2] - 128) / 128;
    quat[4 * i + 3] = (uBuffer[32 * splatIdx + 28 + 3] - 128) / 128;
  }

  ctx.postMessage({ center, scale, color, quat, viewProj }, [
    center.buffer,
    scale.buffer,
    color.buffer,
    quat.buffer,
  ]);
  console.log('Sort complete');
};

// Runs the sort as long as view is changing
let sortRunning: boolean = false;
const sortRunner = () => {
  if (!sortRunning) {
    sortRunning = true;
    const inputViewProj = viewProj;
    depthSort(inputViewProj);
    setTimeout(() => {
      sortRunning = false;
      if (inputViewProj !== viewProj) sortRunner();
    }, 0);
  }
};

ctx.onmessage = (e) => {
  /* Currently 2 Types of messages to handle
   * 1. Receive new splat data buffer (new scene)
   * 2. Receive updated camera pose (new frame)
   */
  if (e.data.buffer) {
    // Update Scence
    buffer = e.data.buffer;
    numVertex = e.data.numVertex;
    console.log('Received new buffer');
  } else if (e.data.view) {
    // Change view
    viewProj = e.data.view;
    numVertex = e.data.numVertex;
    console.log('Received new view');
    sortRunner();
  }
};

export default ctx;