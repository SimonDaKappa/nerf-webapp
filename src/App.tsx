import {
  //Environment,
  //Gltf,
  OrbitControls//,
  //PerformanceMonitor,
  //StatsGl,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import './App.css';
// import { Leva, useControls } from 'leva';
import SplatRenderer from './SplatRenderer';

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
      <Canvas className="h-full w-full bg-black" gl={{ antialias: false }}>
        <SplatRenderer
          url={'http://127.0.0.1:8000/output.splat'}
          upload={true}
        />
        <OrbitControls />
        <ambientLight intensity={1} color="white" />
      </Canvas>
    </>
  );
}

export default App;
