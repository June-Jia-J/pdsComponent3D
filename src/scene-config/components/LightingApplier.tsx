import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { Color } from 'three';
import { useSceneConfigContext } from './SceneConfigProvider';

/**
 * 光影应用组件
 * 将场景配置的光影预设应用到 Three.js 场景
 */
export function LightingApplier() {
  const { scene } = useThree();
  const { config, getLightingPresetById } = useSceneConfigContext();
  const [currentPreset, setCurrentPreset] = useState(
    getLightingPresetById(config.activeLightingPresetId)
  );

  // 监听配置变化
  useEffect(() => {
    const preset = getLightingPresetById(config.activeLightingPresetId);
    setCurrentPreset(preset);
  }, [config.activeLightingPresetId, getLightingPresetById]);

  // 应用光影设置到场景
  useEffect(() => {
    if (!currentPreset) return;

    const { lighting, background } = currentPreset;

    // 更新场景背景色
    if (background?.color) {
      scene.background = new Color(background.color);
    }

    // 查找并更新现有光源
    scene.traverse(child => {
      // 更新环境光
      if (child.type === 'AmbientLight') {
        const ambientLight = child as {
          intensity: number;
          color: { set: (_color: string) => void };
        };
        ambientLight.intensity = lighting.ambient.intensity;
        ambientLight.color.set(lighting.ambient.color);
      }

      // 更新主光源（平行光）
      if (child.type === 'DirectionalLight') {
        const dirLight = child as {
          intensity: number;
          color: { set: (_color: string) => void };
          position: { set: (x: number, y: number, z: number) => void };
          castShadow: boolean;
        };
        dirLight.intensity = lighting.main.intensity;
        dirLight.color.set(lighting.main.color);
        dirLight.position.set(
          lighting.main.position[0],
          lighting.main.position[1],
          lighting.main.position[2]
        );
        dirLight.castShadow = lighting.shadows.enabled;
      }
    });
  }, [currentPreset, scene]);

  if (!currentPreset) return null;

  const { lighting, environment } = currentPreset;

  return (
    <>
      {/* 环境光 */}
      <ambientLight
        intensity={lighting.ambient.intensity}
        color={lighting.ambient.color}
      />

      {/* 主光源 */}
      <directionalLight
        position={lighting.main.position}
        intensity={lighting.main.intensity}
        color={lighting.main.color}
        castShadow={lighting.shadows.enabled}
        receiveShadow={lighting.shadows.enabled}
        shadow-mapSize-width={lighting.shadows.mapSize}
        shadow-mapSize-height={lighting.shadows.mapSize}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* 补光 */}
      {lighting.fill.enabled && (
        <directionalLight
          position={lighting.fill.position}
          intensity={lighting.fill.intensity}
          color={lighting.fill.color}
        />
      )}

      {/* 轮廓光 */}
      {lighting.rim.enabled && (
        <directionalLight
          position={lighting.rim.position}
          intensity={lighting.rim.intensity}
          color={lighting.rim.color}
        />
      )}

      {/* 环境贴图 */}
      {environment.enabled && environment.hdrUrl && (
        <Environment
          files={environment.hdrUrl}
          environmentIntensity={environment.intensity}
        />
      )}

      {/* 阴影 */}
      {lighting.shadows.enabled && (
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.4}
          scale={50}
          blur={1}
          far={10}
          resolution={256}
          color='#000000'
        />
      )}
    </>
  );
}
