import React from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import ViewModel from './index';

// 简单的测试组件
const ViewModelTest: React.FC = () => {
  const handleModelClick = (e: any, force?: boolean) => {
    console.log('ViewModel test - Model clicked:', e);
    console.log('ViewModel test - Force click:', force);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas>
        <CameraControls />

        {/* 测试 ViewModel 组件 */}
        <ViewModel
          ambientLightIntensity={0.5}
          enableShadows={true}
          directionalLightPosition={[10, 10, 5]}
          directionalLightIntensity={1}
          hdrUrl='./assets/potsdamer_platz_1k.hdr'
          onClick={handleModelClick}
          enableGlow={true}
          glowColor={0x00ff00} // 绿色发光
          glowIntensity={0.8}
          enableRoulette={true}
          secondaryCameraDistance={15}
        />

        {/* 测试用的简单几何体 */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color='red' />
        </mesh>

        <mesh position={[2, 0, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color='blue' />
        </mesh>
      </Canvas>
    </div>
  );
};

export default ViewModelTest;
