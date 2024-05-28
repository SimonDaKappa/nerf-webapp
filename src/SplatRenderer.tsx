import { useCallback, useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { fragmentShaderSource, vertexShaderSource } from './SplatShaders';
// import SortWorker from './SortWorker';

/* 
3 Float32 for Position (x, y, z) 
3 Float32 for Scale    (x', y', z')
4 Uint8   for Color    (r, g, b, alpha)
4 Uint8   for Quat     (a, b, c, d)
*/
const rowLength = 3 * 4 + 3 * 4 + 4 + 4;

function logLoadedSplat(splatBuffer: Uint8Array): void {
  const length = splatBuffer.byteLength;
  if (length % rowLength !== 0) {
    console.error('Invalid splat file');
    return;
  } else {
    console.log('Splat file loaded, # splats = %d', length / rowLength);
  }
}

async function fetchSplatFile(url: string): Promise<Response> {
  try {
    const splatReq = await fetch(url, { method: 'GET' });
    if (
      splatReq.status !== 200 ||
      splatReq.body == null ||
      splatReq.headers == null ||
      splatReq.headers.get('content-length') == null
    ) {
      throw new Error(splatReq.status + ' Unable to load ' + splatReq.url);
    }
    return splatReq;
  } catch (error) {
    throw new Error('Error fetching splat file: ' + error);
  }
}

async function loadSplatFile(url: string): Promise<Uint8Array> {
  // Fetch the splat file and convert it to an array buffer
  const splatResponse = await fetchSplatFile(url);
  const reader = splatResponse.body!.getReader();
  let splatData = new Uint8Array(
    parseInt(splatResponse.headers.get('content-length')!)
  );
  let bytesRead = 0;

  console.log('Splat Data Size: %d', splatData.byteLength);
  while (bytesRead < splatData.byteLength) {
    const { done, value } = await reader.read();
    if (done || value === undefined) break;
    console.log('Row Length: %d', rowLength);
    splatData.set(value, bytesRead);
    bytesRead += value.length;
    // TODO: Add incremental message posting to sort worker
  }

  logLoadedSplat(splatData);
  return splatData;
}

function FocalLength(
  width: number,
  height: number,
  fov: number,
  aspect: number,
  damper: number
): THREE.Vector2 {
  const fovRadian = THREE.MathUtils.degToRad(fov);
  const fovXRadian = 2 * Math.atan(Math.tan(fovRadian / 2) * aspect);
  const fy = (height * damper) / (2 * Math.tan(fovRadian / 2));
  const fx = (width * damper) / (2 * Math.tan(fovXRadian / 2));
  return new THREE.Vector2(fx, fy);
}

function SplatRenderer(props: { url: string; upload: boolean }) {
  const url = props.url;
  let upload = props.upload;
  console.log('URL: %s', url);

  const meshRef = useRef<THREE.Mesh>(null!);
  // Create new worker
  const [worker] = useState(() => new Worker("./SortWorker.ts"));

  // Create screen listener
  const {
    size: { width, height },
    camera: { fov, aspect },
    viewport: { damper },
  } = useThree() as any;

  // Init uniforms for shaders
  const [screenUniforms] = useState({
    viewport: {
      value: new THREE.Vector2(width * damper, height * damper),
    },
    focal: {
      value: FocalLength(width, height, fov, aspect, damper),
    },
  });

  // Update uniforms for shaders when damper/screen changes
  useEffect(() => {
    screenUniforms.focal.value = FocalLength(
      width,
      height,
      fov,
      aspect,
      damper
    );
    screenUniforms.viewport.value = new THREE.Vector2(
      width * damper,
      height * damper
    );
  });

  // Init buffers for shaders
  const [buffers, setBuffers] = useState({
    index: new Uint16Array([0, 1, 2, 2, 3, 0]),
    position: new Float32Array([1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 1, 0]),
    color: new Float32Array([1, 0, 1, 1, 1, 1, 0, 1]),
    quat: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1]),
    scale: new Float32Array([1, 1, 1, 2, 0.5, 0.5]),
    center: new Float32Array([0, 0, 0, 2, 0, 0]),
  });

  // Load Splat File: User uploads new scene, load new splat file and send scene to worker
  useEffect(() => {
    let upload = props.upload;
    if (upload) {
      const loadSplatData = async () => {
        const splatBuffer = await loadSplatFile(url);
        upload = false;
        worker.postMessage({
          buffer: splatBuffer.buffer,
          numVertex: Math.floor(splatBuffer.length / rowLength),
        });
      };
      loadSplatData();
    }
  });

  // Post message (current view) to Sort Worker. Sort occurs on view change.
  useFrame((state, _delta, _frame) => {
    const mesh = meshRef.current;
    if (mesh == null) {
      return;
    }

    const camera = state.camera;
    const viewProj = new THREE.Matrix4()
      .multiply(camera.projectionMatrix)
      .multiply(camera.matrixWorldInverse)
      .multiply(mesh.matrixWorld);
    worker.postMessage({
      view: viewProj.elements,
      numVertex: buffers.center.length / 3,
    });
  });

  // Handle messages from Sort Worker: Update Buffers
  useEffect(() => {
    worker.onmessage = (e: {
      data: { quat: any; scale: any; center: any; color: any };
    }) => {
      const { quat, scale, center, color } = e.data;
      setBuffers((buffers) => ({ ...buffers, center, scale, color, quat }));
    };
    // Cleanup
    return () => {
      worker.onmessage = null;
    };
  });

  // Attach attribute updates to buffer changes
  const update = useCallback(
    (self: THREE.InstancedBufferAttribute | THREE.BufferAttribute) => {
      self.needsUpdate = true;
    },
    []
  );

  const instanceCount = Math.min(buffers.center.length / 3, 100000);

  console.log('SplatRenderer Fin');
  return (
    <mesh ref={meshRef} renderOrder={10} rotation={[Math.PI, 0, 0]}>
      <instancedBufferGeometry
        key={instanceCount}
        instanceCount={instanceCount}
      >
        <bufferAttribute
          attach="index"
          onUpdate={update}
          array={buffers.index}
          itemSize={1}
          count={6}
        />
        <bufferAttribute
          attach="attributes-position"
          onUpdate={update}
          array={buffers.position}
          itemSize={3}
          count={4}
        />
        <instancedBufferAttribute
          attach="attributes-color"
          onUpdate={update}
          array={buffers.color}
          itemSize={4}
          count={instanceCount}
        />
        <instancedBufferAttribute
          attach="attributes-quat"
          onUpdate={update}
          array={buffers.quat}
          itemSize={4}
          count={instanceCount}
        />
        <instancedBufferAttribute
          attach="attributes-scale"
          onUpdate={update}
          array={buffers.scale}
          itemSize={3}
          count={instanceCount}
        />
        <instancedBufferAttribute
          attach="attributes-center"
          onUpdate={update}
          array={buffers.center}
          itemSize={3}
          count={instanceCount}
        />
      </instancedBufferGeometry>
      <rawShaderMaterial
        uniforms={screenUniforms}
        fragmentShader={fragmentShaderSource}
        vertexShader={vertexShaderSource}
        depthTest={true}
        depthWrite={false}
        transparent={true}
      />
    </mesh>
  );
}

export default SplatRenderer;
