import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const chevronShape = (() => {
  const shape = new THREE.Shape();
  const width = 20;   
  const height = 24;  
  const notch = 10;   

  shape.moveTo(0, height);          
  shape.lineTo(width, 0);           
  shape.lineTo(0, notch);           
  shape.lineTo(-width, 0);          
  shape.lineTo(0, height);          
  return shape;
})(); 
const ChevronLayer = ({ offset, opacityOffset }) => {
  const meshRef = useRef();
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime() * 4; 
      const wave = Math.sin(t - opacityOffset); 
      const opacity = 0.2 + (wave + 1) / 2 * 0.8;
      meshRef.current.material.opacity = opacity;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={[0, offset, 0]} 
      rotation={[-Math.PI / 2, 0, Math.PI]} 
    >
      <shapeGeometry args={[chevronShape]} />
      <meshBasicMaterial 
        color="#00ffff" 
        transparent 
        side={THREE.DoubleSide} 
        depthTest={false} 
      />
    </mesh>
  );
};

const TripleArrow = ({ angle }) => {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const baseDist = 300; 
      groupRef.current.position.y = baseDist + Math.sin(clock.getElapsedTime() * 3) * 10;
    }
  });

  return (
    <group rotation={[0, 0, -angle]}>
      <group ref={groupRef} position={[0, 300, 0]}>
        <ChevronLayer offset={35} opacityOffset={0} />
        <ChevronLayer offset={18} opacityOffset={1} />
        <ChevronLayer offset={0} opacityOffset={2} />
      </group>
    </group>
  );
};

export default function NadirArrows({ hotspots }) {
  // Lọc và cắt mảng
  const navSpots = useMemo(() => {
     return hotspots ? hotspots.filter(h => h.type === 'nav' || !h.type).slice(0, 3) : [];
  }, [hotspots]);

  if (navSpots.length === 0) return null;

  return (
    <group position={[0, -150, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {navSpots.map((h, i) => {
        const angle = Math.atan2(h.x, h.z);
        return <TripleArrow key={i} angle={angle} />;
      })}
    </group>
  );
}