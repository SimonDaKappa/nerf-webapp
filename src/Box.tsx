import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

export function Box(props: any) {
  const meshRef = useRef<Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const [scale, setScale] = useState(1);
  const maxScale = 1.5;
  const minScale = 1;

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = meshRef.current.rotation.y += delta;
    if (active) {
      setScale(Math.min(maxScale, scale + 0.01));
    }
    else {
      setScale(Math.max(minScale,  scale - 0.01));
    }
  });



  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={ scale}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      renderOrder={5}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "blue" : "red"} transparent={false} roughness={0} metalness={0.5} />
    </mesh>
  );
}
