import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sphere, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import NadirArrows from "./NadirArrows";
import TechHotspot from "./TechHotspot";

const PanoramaScene = forwardRef(({ image, hotspots, onHotspotClick, nadirLogo, showArrows, initialView }, ref) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const keysRef = useRef({ 
    forward: false, backward: false, left: false, right: false 
  });

  const MIN_FOV = 30;
  const MAX_FOV = 90;
  const ZOOM_STEP = 5;
  const ROTATE_SPEED = 5.0;

  const handleZoom = (dir) => {
    if (isTransitioning) return;
    const currentFov = camera.fov;
    const newFov = THREE.MathUtils.clamp(
      currentFov + (dir === "in" ? -ZOOM_STEP : ZOOM_STEP),
      MIN_FOV,
      MAX_FOV
    );
    camera.fov = newFov;
    camera.updateProjectionMatrix();
  };

  useImperativeHandle(ref, () => ({
    zoomIn: () => handleZoom("in"),
    zoomOut: () => handleZoom("out"),
  }));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isTransitioning) return;
      const activeTag = document.activeElement.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement.isContentEditable) {
        return;
      }
      switch(e.code) {
        case 'KeyW': case 'ArrowUp': keysRef.current.forward = true; break;
        case 'KeyS': case 'ArrowDown': keysRef.current.backward = true; break;
        case 'KeyA': case 'ArrowLeft': keysRef.current.left = true; break;
        case 'KeyD': case 'ArrowRight': keysRef.current.right = true; break;
        default: break;
      }
    };

    const handleKeyUp = (e) => {
      const activeTag = document.activeElement.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement.isContentEditable) {
        keysRef.current = { forward: false, backward: false, left: false, right: false };
        return;
      }
      switch(e.code) {
        case 'KeyW': case 'ArrowUp': keysRef.current.forward = false; break;
        case 'KeyS': case 'ArrowDown': keysRef.current.backward = false; break;
        case 'KeyA': case 'ArrowLeft': keysRef.current.left = false; break;
        case 'KeyD': case 'ArrowRight': keysRef.current.right = false; break;
        default: break;
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (isTransitioning) return;
      if (e.deltaY < 0) handleZoom("in"); else handleZoom("out");
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    const dom = gl.domElement;
    dom.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      dom.removeEventListener("wheel", handleWheel);
    };
  }, [isTransitioning, gl]);

  useFrame((state, delta) => {
    if (controlsRef.current && !isTransitioning) {
      const controls = controlsRef.current;
      const speed = ROTATE_SPEED * delta;

      if (keysRef.current.left) controls.setAzimuthalAngle(controls.getAzimuthalAngle() + speed);
      if (keysRef.current.right) controls.setAzimuthalAngle(controls.getAzimuthalAngle() - speed);
      if (keysRef.current.forward) controls.setPolarAngle(controls.getPolarAngle() + speed);
      if (keysRef.current.backward) controls.setPolarAngle(controls.getPolarAngle() - speed);
      
      controls.update();
    }
  });

  const [textureMain, setTextureMain] = useState(null);
  const [textureNext, setTextureNext] = useState(null);
  const [nadirTexture, setNadirTexture] = useState(null);
  const fadeMaterialRef = useRef(null);

  

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(image, (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.x = -1;
      setTextureMain(tex);
    });
  }, []); 

  useEffect(() => {
    if (nadirLogo) {
        const loader = new THREE.TextureLoader();
        loader.load(nadirLogo, (tex) => {
            setNadirTexture(tex);
        });
    }
  }, [nadirLogo]);

  useEffect(() => {
    // Chỉ chạy khi có controls và có dữ liệu góc nhìn
    if (controlsRef.current && initialView) {
      const { x, y, z } = initialView;
      
      // Kiểm tra nếu vector hợp lệ (không phải 0,0,0)
      if (x || y || z) {
        // Chuyển đổi Vector3 sang Spherical (Hệ tọa độ cầu)
        const targetVec = new THREE.Vector3(x, y, z);
        const spherical = new THREE.Spherical().setFromVector3(targetVec);

        // OrbitControls dùng Azimuthal (ngang) và Polar (dọc)
        // Cần reset lại control trước để tránh xung đột animation
        controlsRef.current.reset();
        
        controlsRef.current.setAzimuthalAngle(spherical.theta);
        controlsRef.current.setPolarAngle(spherical.phi);
        
        controlsRef.current.update();
      }
    }
  }, [image, initialView]);

  const handleHotspotClick = (spot) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const targetVec = new THREE.Vector3(spot.x, spot.y, spot.z);
    const spherical = new THREE.Spherical().setFromVector3(targetVec);

    const tl = gsap.timeline({
      onComplete: () => {
       
        if (spot.type === 'info' || spot.type === 'chat') {
           setIsTransitioning(false); 
        }
      }
    });
    tl.to(controlsRef.current, {
      azimuthAngle: spherical.theta,
      polarAngle: Math.PI / 2,
      duration: 0.8,
      ease: "power2.inOut"
    })
    .to(camera, {
      fov: 60,
      duration: 0.8,
      ease: "power2.inOut"
    }, "<");

    onHotspotClick(spot);
  };

  useEffect(() => {
    if (!image || !textureMain) return;
    if (textureMain.image.src === image) return;

    setIsTransitioning(true);

    const loader = new THREE.TextureLoader();
    loader.load(image, (newTex) => {
      newTex.wrapS = THREE.RepeatWrapping;
      newTex.repeat.x = -1;
      setTextureNext(newTex); 

      gsap.to(camera, { fov: 75, duration: 1.5, ease: "power2.out" });

      const fadeObj = { val: 0 };
      gsap.to(fadeObj, {
        val: 1,
        duration: 1,
        ease: "none",
        onUpdate: () => {
          if (fadeMaterialRef.current) {
            fadeMaterialRef.current.opacity = fadeObj.val;
          }
        },
        onComplete: () => {
          setTextureMain(newTex);
          setTextureNext(null);
          setIsTransitioning(false);
        }
      });
    });
  }, [image]);

  return (
    <>
      {textureMain && (
        <Sphere args={[500, 64, 64]} scale={[1, 1, 1]}>
          <meshBasicMaterial map={textureMain} side={THREE.BackSide} depthWrite={false} />
        </Sphere>
      )}

      {textureNext && (
        <Sphere args={[490, 64, 64]} scale={[1, 1, 1]}>
          <meshBasicMaterial 
            ref={fadeMaterialRef} 
            map={textureNext} 
            side={THREE.BackSide} 
            transparent={true} 
            opacity={0}
            depthWrite={false} 
            depthTest={false} 
          />
        </Sphere>
      )}

      {nadirTexture && (
        <mesh 
            position={[0, -180, 0]} // Đặt thấp xuống trục Y (dưới chân)
            rotation={[-Math.PI / 2, 0, 0]} // Xoay ngang ra để mặt hướng lên trên
            renderOrder={2} // Vẽ đè lên background
        >
            <circleGeometry args={[45, 64]} /> {/* Bán kính 60 */}
            <meshBasicMaterial 
                map={nadirTexture} 
                transparent={true} 
                side={THREE.DoubleSide} 
                depthTest={false}
            />
            
        </mesh>
      )}
      {showArrows && <NadirArrows hotspots={hotspots} />}

      {hotspots && hotspots.map((spot) => {
        if (spot.type === 'nav' || !spot.type) {
        const vecXZ = new THREE.Vector3(spot.x, 0, spot.z);
        vecXZ.normalize().multiplyScalar(950); 
        const floorY = -150; 

        return (
          <group 
            key={spot.id} 
            position={[vecXZ.x, floorY, -vecXZ.z]} 
            onClick={(e) => {
              e.stopPropagation();
              handleHotspotClick(spot);
            }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
          >
            
           
            <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={0} visible={false}>
                <circleGeometry args={[120, 32]} /> 
                <meshBasicMaterial />
            </mesh>

        
            <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
               <ringGeometry args={[40, 70, 32]} /> 
               <meshBasicMaterial 
                 color="#00ffff" 
                 transparent 
                 opacity={0.6}  
                 side={THREE.DoubleSide} 
                 depthTest={false} 
               />
            </mesh>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]} renderOrder={2}>
               <circleGeometry args={[30, 32]} />
               <meshBasicMaterial 
                 color="#ffffff" 
                 transparent 
                 opacity={0.9} 
                 side={THREE.DoubleSide}
                 depthTest={false} 
               />
            </mesh>
            
            {/* Label */}
            {/* <Html center position={[0, 50, 0]} pointerEvents="none" style={{ pointerEvents: 'none' }}>
               <div style={{ 
                 color: '#00ffff', // Chữ màu xanh Neon theo tông
                 textShadow: '0 2px 4px #000000', 
                 fontSize: '16px', // Font to hơn
                 fontWeight: '900',
                 fontFamily: 'Arial, sans-serif',
                 background: 'rgba(0, 0, 0, 0.7)',
                 padding: '8px 12px',
                 borderRadius: '20px',
                 border: '2px solid #00ffff', // Viền neon
                 whiteSpace: 'nowrap',
                 transform: 'scale(1.5)', // Hack scale cho to nữa
                 boxShadow: '0 0 10px #00ffff' // Đổ bóng phát sáng
               }}>
                  {spot.label || "BƯỚC TỚI ➔"}
               </div>
            </Html> */}
          </group>
        );
      }
      if (spot.type === 'info' || spot.type === 'chat') {
            return (
                <TechHotspot 
                    key={spot.id} 
                    spot={spot} 
                    onClick={handleHotspotClick} 
                />
            );
        }
        
        return null;
      })}

      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enableRotate={!isTransitioning}
        rotateSpeed={-0.5}
        enableDamping
        enablePan={false}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
      />
    </>
  );
});

export default PanoramaScene;