/* File: App.tsx */
import { FlyControls, StatsGl } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import './App.css';
import SplatMesh from './SplatMeshGenerator';

function App() {
  return (
    <>
      <Canvas
        className="h-screen w-screen bg-black"
        gl={{ antialias: false }}
        style={{ background: 'black', width: '100%', height: '100%' }}
      >
        <StatsGl />
        <FlyControls movementSpeed={1.5} rollSpeed={0.5} />
        <group>
          <SplatMesh
            url={'http://127.0.01:8000/train.splat'}
            upload={true}
            maxSplats={1000000}
          />
        </group>
      </Canvas>
    </>
  );
}

export default App;
