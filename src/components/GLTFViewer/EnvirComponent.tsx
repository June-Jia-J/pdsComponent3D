import { ContactShadows, Environment } from '@react-three/drei';

const EnvirComponent = ({
  ambientLightIntensity,
  enableShadows,
  directionalLightPosition,
  directionalLightIntensity,
  environmentIntensity = 1,
  hdrUrl = './assets/potsdamer_platz_1k.hdr',
}: {
  ambientLightIntensity: number;
  enableShadows: boolean;
  directionalLightIntensity: number;
  directionalLightPosition: [number, number, number];
  environmentIntensity?: number;
  hdrUrl?: string;
}) => {
  return (
    <>
      {/* 光照设置 */}
      <ambientLight
        intensity={ambientLightIntensity}
        receiveShadow={enableShadows}
      />
      <directionalLight
        position={directionalLightPosition}
        intensity={directionalLightIntensity}
        castShadow={enableShadows}
        receiveShadow={enableShadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      {/* 环境贴图 */}
      <Environment files={hdrUrl} environmentIntensity={environmentIntensity} />

      {/* 阴影 */}
      {enableShadows && (
        <ContactShadows
          position={[0, -1, 0]}
          opacity={0.4}
          scale={10}
          blur={1}
          far={10}
          resolution={256}
          color='#000000'
        />
      )}
    </>
  );
};

export default EnvirComponent;
