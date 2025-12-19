import { useRef, useState, useMemo, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const TechHotspot = ({ spot, onClick }) => {
  const groupRef = useRef();
  const ringRef = useRef();
  const pulseRef = useRef(); 
  const [hovered, setHovered] = useState(false);

  const isChat = spot.type === 'chat';

  const position = useMemo(() => {
    const pos = new THREE.Vector3(spot.x, spot.y, spot.z);
    return pos.normalize().multiplyScalar(450);
  }, [spot]);

  const color = isChat ? "#00ffff" : "#ffd700";
  const label = spot.label || "Info";

  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(0, 0, 0);
    }
  }, [position]);

  useFrame((state, delta) => {
    if (ringRef.current) {
      const targetScale = hovered ? 1.8 : 1.2;
      ringRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), delta * 10);
    }

    if (isChat && pulseRef.current) {
      const t = state.clock.getElapsedTime() % 2; 
      
      const scale = 1 + t * 1.5; 
      pulseRef.current.scale.setScalar(scale);

    
      const opacity = Math.max(0, 1 - Math.pow(t / 2, 1.5)); 
      pulseRef.current.material.opacity = opacity * 0.5; 
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={[position.x, position.y, -position.z]} 
      onClick={(e) => { e.stopPropagation(); onClick(spot); }}
      onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      
      {isChat && (
        <mesh ref={pulseRef} renderOrder={0}>
            <ringGeometry args={[8, 9, 32]} /> {/* Vòng mảnh */}
            <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0} />
        </mesh>
      )}

      <mesh renderOrder={1}>
        <circleGeometry args={[8, 32]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      <mesh ref={ringRef} renderOrder={1}>
        <ringGeometry args={[8, 9.5, 32]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

     
      

      <Html 
        position={[0, 30, 0]} 
        center 
        style={{ 
          pointerEvents: 'none',
          opacity: hovered ? 1 : 0,
          transition: 'all 0.2s ease-in-out',
          transform: hovered ? 'translateY(0px)' : 'translateY(10px)',
        }}
        zIndexRange={[100, 0]} 
      >
        <div style={{
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          color: color, 
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          border: `1px solid ${color}`,
          boxShadow: `0 0 10px ${color}40` 
        }}>
          {isChat ? `AI Tour: ${label}` : label}
        </div>
      </Html>

    </group>
  );
};

export default TechHotspot;