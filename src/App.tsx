/* File: App.tsx */
import {
  //Environment,
  //Gltf,
  OrbitControls,
  FlyControls,
  //PerformanceMonitor,
  StatsGl,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import './App.css';
// import { Leva, useControls } from 'leva';
import SplatRenderer from './SplatRenderer';
import { Box } from './Box';

function App() {
  const splatScale = 5 as number;
  const splatPos = [12.1 + 0, 19.3, -1.0] as [number, number, number];
  const splatRot = [-0.516, 0.15, 0.1] as [number, number, number];
  return (
    <>
      <Canvas
        className="h-screen w-screen bg-black"
        gl={{ antialias: false }}
        style={{ background: 'black', width: '100%', height: '100%' }}
      >
        <StatsGl />
        {/* <OrbitControls  /> */}
        <FlyControls movementSpeed={10} rollSpeed={0.5} />
        <group
          position={splatPos}
          rotation={splatRot}
          scale={[splatScale, splatScale, splatScale]}
        >
          <SplatRenderer
            // url={'http://127.0.0.1:8000/splat10.splat'}
            // url={'http://127.0.01:8000/splat1000.splat'}
            url={'http://127.0.01:8000/splat100000.splat'}
            upload={true}
          />
        </group>

        <ambientLight intensity={10} color="white" />
      </Canvas>
    </>
  );
}

export default App;
