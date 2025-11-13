import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useState, useEffect } from 'react';
import { Mesh, Vector3 } from 'three';
import * as THREE from 'three';

interface FloatingElementProps {
  position: [number, number, number];
  rotationSpeed: [number, number, number];
  floatSpeed: number;
  floatRange: number;
  imageUrl?: string;
  isCircle?: boolean;
  scale?: number;
}

const FloatingElement = ({ 
  position, 
  rotationSpeed, 
  floatSpeed, 
  floatRange,
  imageUrl,
  isCircle = false,
  scale = 1
}: FloatingElementProps) => {
  const meshRef = useRef<Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const initialY = position[1];

  useEffect(() => {
    if (imageUrl) {
      const loader = new THREE.TextureLoader();
      loader.load(imageUrl, setTexture);
    }
  }, [imageUrl]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Rotation
    meshRef.current.rotation.x += rotationSpeed[0];
    meshRef.current.rotation.y += rotationSpeed[1];
    meshRef.current.rotation.z += rotationSpeed[2];
    
    // Floating
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = initialY + Math.sin(time * floatSpeed) * floatRange;
    
    // Mouse parallax
    const mouse = state.mouse;
    meshRef.current.position.x = position[0] + mouse.x * 0.5;
    meshRef.current.position.z = position[2] + mouse.y * 0.5;
  });

  const geometry = isCircle 
    ? new THREE.CircleGeometry(0.5 * scale, 32)
    : new THREE.PlaneGeometry(1 * scale, 1.4 * scale);

  return (
    <mesh ref={meshRef} position={position} geometry={geometry}>
      {texture ? (
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} transparent />
      ) : (
        <meshStandardMaterial color="#667eea" side={THREE.DoubleSide} transparent opacity={0.8} />
      )}
    </mesh>
  );
};

const FloatingIcon3D = ({ 
  position, 
  rotationSpeed, 
  floatSpeed, 
  floatRange,
  iconType = 'stethoscope',
  scale = 1
}: FloatingElementProps & { iconType?: string }) => {
  const meshRef = useRef<Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (!meshRef.current) return;
    
    meshRef.current.rotation.x += rotationSpeed[0];
    meshRef.current.rotation.y += rotationSpeed[1];
    meshRef.current.rotation.z += rotationSpeed[2];
    
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = initialY + Math.sin(time * floatSpeed) * floatRange;
    
    const mouse = state.mouse;
    meshRef.current.position.x = position[0] + mouse.x * 0.3;
    meshRef.current.position.z = position[2] + mouse.y * 0.3;
  });

  const getGeometry = () => {
    switch (iconType) {
      case 'heart':
        return <sphereGeometry args={[0.3 * scale, 16, 16]} />;
      case 'brain':
        return <torusKnotGeometry args={[0.2 * scale, 0.05, 100, 16]} />;
      case 'dna':
        return <torusGeometry args={[0.2 * scale, 0.05, 16, 100]} />;
      default:
        return <boxGeometry args={[0.4 * scale, 0.4 * scale, 0.1]} />;
    }
  };

  return (
    <mesh ref={meshRef} position={position}>
      {getGeometry()}
      <meshStandardMaterial 
        color="#764ba2" 
        metalness={0.6} 
        roughness={0.2}
        emissive="#667eea"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};

export const FloatingScene = () => {
  const elements = useMemo(() => {
    const items = [];
    
    // Medical report images
    const reportImages = [
      '/images/medical-report-1.jpg',
      '/images/xray-report.jpg',
      '/images/ecg-report.jpg',
      '/images/lab-report.jpg',
      '/images/prescription.jpg'
    ];
    
    // Doctor images
    const doctorImages = [
      '/images/doctor-1.jpg',
      '/images/doctor-2.jpg',
      '/images/doctor-3.jpg',
      '/images/doctor-4.jpg',
      '/images/doctor-5.jpg'
    ];
    
    // Generate floating medical reports
    for (let i = 0; i < 12; i++) {
      items.push({
        type: 'report',
        imageUrl: reportImages[i % reportImages.length],
        position: [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10 - 5
        ] as [number, number, number],
        rotationSpeed: [
          Math.random() * 0.005,
          Math.random() * 0.005,
          Math.random() * 0.005
        ] as [number, number, number],
        floatSpeed: 0.5 + Math.random() * 0.5,
        floatRange: 0.3 + Math.random() * 0.5,
        scale: 0.8 + Math.random() * 0.4
      });
    }
    
    // Generate floating doctor avatars
    for (let i = 0; i < 15; i++) {
      items.push({
        type: 'doctor',
        imageUrl: doctorImages[i % doctorImages.length],
        position: [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10 - 3
        ] as [number, number, number],
        rotationSpeed: [
          0,
          Math.random() * 0.01,
          0
        ] as [number, number, number],
        floatSpeed: 0.4 + Math.random() * 0.6,
        floatRange: 0.4 + Math.random() * 0.6,
        isCircle: true,
        scale: 0.6 + Math.random() * 0.4
      });
    }
    
    // Generate medical icons
    const iconTypes = ['heart', 'brain', 'dna', 'stethoscope'];
    for (let i = 0; i < 20; i++) {
      items.push({
        type: 'icon',
        iconType: iconTypes[Math.floor(Math.random() * iconTypes.length)],
        position: [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 8 - 2
        ] as [number, number, number],
        rotationSpeed: [
          Math.random() * 0.01,
          Math.random() * 0.01,
          Math.random() * 0.01
        ] as [number, number, number],
        floatSpeed: 0.6 + Math.random() * 0.4,
        floatRange: 0.5 + Math.random() * 0.5,
        scale: 0.5 + Math.random() * 0.5
      });
    }
    
    return items;
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 75 }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#667eea" />
      
      {elements.map((element, index) => {
        if (element.type === 'icon') {
          return (
            <FloatingIcon3D
              key={index}
              position={element.position}
              rotationSpeed={element.rotationSpeed}
              floatSpeed={element.floatSpeed}
              floatRange={element.floatRange}
              iconType={element.iconType}
              scale={element.scale}
            />
          );
        }
        
        return (
          <FloatingElement
            key={index}
            position={element.position}
            rotationSpeed={element.rotationSpeed}
            floatSpeed={element.floatSpeed}
            floatRange={element.floatRange}
            isCircle={element.isCircle}
            scale={element.scale}
            imageUrl={element.imageUrl}
          />
        );
      })}
    </Canvas>
  );
};
