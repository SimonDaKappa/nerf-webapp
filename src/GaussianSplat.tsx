import { useCallback, useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh } from 'three';


function loadSplats(url: string): Promise<Array<any>> {
  return fetch(url)
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      const splats = [];
      const splatView = new DataView(buffer);
      let offset = 0;
      while (offset < buffer.byteLength) {
        const x = splatView.getFloat32(offset, true);
        offset += 4;
        const y = splatView.getFloat32(offset, true);
        offset += 4;
        const z = splatView.getFloat32(offset, true);
        offset += 4;
        const r = splatView.getFloat32(offset, true);
        offset += 4;
        const g = splatView.getFloat32(offset, true);
        offset += 4;
        const b = splatView.getFloat32(offset, true);
        offset += 4;
        splats.push({ x, y, z, r, g, b });
      }
      return splats;
    });
}


function SplatRenderer(url: string = 'https://antimatter15.com/splat-data/train.splat') {
  const meshRef = useRef<Mesh>(null!);

  // Load the .splat file from url, by getting the array buffer size and constructing
  // an array of splats from the buffer.


}

export default SplatRenderer;