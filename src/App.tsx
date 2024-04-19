import { Environment, Gltf, OrbitControls, PerformanceMonitor, StatsGl } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import './App.css';
import { Box } from './Box';
import { Leva, useControls } from 'leva';

/**
 * Overall App Planning
 * 1. Create a React3Fiber canvas
 * 2. Impose Cubes on the canvas
 * 3. Create a camera
 *
 *
 *
 *
 */

function App() {
  return (
    <>
      <Canvas className="h-full w-full bg-black" gl={{antialias:false}}>
        <OrbitControls />
        <ambientLight intensity={1} color="white" />
        <Box position={[-1, 0, 0]} />
        <Box position={[1, 0, 0]} />
      </Canvas>
    </>
  );
}

export default App;
