import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  CameraControls,
  CameraControlsImpl,
  PerspectiveCamera,
  AdaptiveDpr,
  Environment,
  ContactShadows,
} from '@react-three/drei';
import {
  PerspectiveCamera as PerspectiveCameraImpl,
  Vector3,
  Color,
} from 'three';
import {
  SceneConfigProvider,
  CameraBookmarkPanel,
  LightingPresetPanel,
  SceneConfigToolbar,
  PickingVisualizer,
  useSceneConfigContext,
  LightingConfigValues,
} from '@/scene-config';
import globalData, { setApp } from '@/store/globalData';

const { ACTION } = CameraControlsImpl;

interface SceneConfigViewerInnerProps {
  children: React.ReactNode;
  enablePicking?: boolean;
  enableBookmarks?: boolean;
  enableLightingPresets?: boolean;
  enableToolbar?: boolean;
  backgroundColor?: string;
  enableShadows?: boolean;
  onPickingResult?: (result: any) => void;
}

/**
 * 场景配置内部组件
 * 处理光影预设应用和相机控制
 */
function SceneConfigViewerInner({
  children,
  enablePicking = true,
  enableBookmarks = true,
  enableLightingPresets = true,
  enableToolbar = true,
  backgroundColor = '#000000',
  enableShadows = true,
  onPickingResult,
}: SceneConfigViewerInnerProps) {
  const { camera, scene } = useThree();
  const cameraRef = useRef<PerspectiveCameraImpl>(null);
  const controlsRef = useRef<CameraControlsImpl>(null);
  const { config, getActivePreset, initConfig } = useSceneConfigContext();

  // 监听 activeLightingPresetId 变化，重新计算光影配置
  const [lightingConfig, setLightingConfig] = useState<LightingConfigValues>({
    mainLightIntensity: 1.0,
    mainLightPosition: [10, 10, 5],
    mainLightColor: '#ffffff',
    ambientLightIntensity: 0.2,
    ambientLightColor: '#ffffff',
    environmentEnabled: true,
    environmentIntensity: 1.0,
    environmentHdrUrl: './assets/potsdamer_platz_1k.hdr',
    shadowsEnabled: true,
    backgroundColor: backgroundColor,
  });

  // 当 activeLightingPresetId 变化时，更新光影配置
  useEffect(() => {
    const preset = getActivePreset();
    if (preset) {
      setLightingConfig({
        mainLightIntensity: preset.mainLight.intensity,
        mainLightPosition: preset.mainLight.position,
        mainLightColor: preset.mainLight.color,
        ambientLightIntensity: preset.ambientLight.intensity,
        ambientLightColor: preset.ambientLight.color,
        environmentEnabled: preset.environment?.enabled ?? true,
        environmentIntensity: preset.environment?.intensity ?? 1.0,
        environmentHdrUrl:
          preset.environment?.hdrUrl ?? './assets/potsdamer_platz_1k.hdr',
        shadowsEnabled: preset.shadows.enabled,
        backgroundColor: preset.background?.color ?? backgroundColor,
      });
      console.log('🌟 光影预设已应用:', preset.name);
    }
  }, [config.activeLightingPresetId, getActivePreset, backgroundColor]);

  // 初始化相机控制到 globalData
  useEffect(() => {
    if (controlsRef.current) {
      setApp({
        controls: controlsRef.current,
      });
    }
  }, []);

  // 初始化场景配置
  useEffect(() => {
    initConfig();
  }, [initConfig]);

  return (
    <>
      {/* 背景 */}
      <color attach='background' args={[lightingConfig.backgroundColor]} />

      {/* 光照设置 */}
      <ambientLight
        intensity={lightingConfig.ambientLightIntensity}
        color={lightingConfig.ambientLightColor}
      />
      <directionalLight
        position={lightingConfig.mainLightPosition}
        intensity={lightingConfig.mainLightIntensity}
        color={lightingConfig.mainLightColor}
        castShadow={lightingConfig.shadowsEnabled && enableShadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* 环境贴图 */}
      {lightingConfig.environmentEnabled && (
        <Environment
          files={lightingConfig.environmentHdrUrl}
          environmentIntensity={lightingConfig.environmentIntensity}
        />
      )}

      {/* 阴影 */}
      {lightingConfig.shadowsEnabled && enableShadows && (
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.4}
          scale={50}
          blur={1}
          far={20}
          resolution={512}
          color='#000000'
        />
      )}

      {/* 相机 */}
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        fov={50}
        near={0.1}
        far={1000}
      />

      {/* 相机控制 */}
      <CameraControls
        ref={controlsRef}
        makeDefault
        mouseButtons={{
          left: ACTION.TRUCK,
          middle: ACTION.DOLLY,
          right: ACTION.ROTATE,
          wheel: ACTION.DOLLY,
        }}
        touches={{
          one: ACTION.TOUCH_ROTATE,
          two: ACTION.TOUCH_DOLLY_TRUCK,
          three: ACTION.TOUCH_DOLLY_TRUCK,
        }}
        infinityDolly={false}
        minZoom={0.5}
        maxZoom={2}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minPolarAngle={Math.PI / 6}
        truckSpeed={1.0}
        boundaryEnclosesCamera={true}
        restThreshold={0.01}
      />

      {/* 子内容 */}
      {children}

      {/* 拾取可视化 */}
      {enablePicking && (
        <PickingVisualizer
          enabled={true}
          onPick={onPickingResult}
          showDebugInfo={true}
        />
      )}

      {/* UI 面板 */}
      {enableBookmarks && (
        <CameraBookmarkPanel position='top-right' showThumbnails={false} />
      )}

      {enableLightingPresets && <LightingPresetPanel position='top-left' />}

      {enableToolbar && <SceneConfigToolbar position='bottom' />}
    </>
  );
}

export interface SceneConfigViewerProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 容器宽度 */
  width?: string | number;
  /** 容器高度 */
  height?: string | number;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 是否启用阴影 */
  enableShadows?: boolean;
  /** 是否启用拾取 */
  enablePicking?: boolean;
  /** 是否启用书签面板 */
  enableBookmarks?: boolean;
  /** 是否启用光影预设面板 */
  enableLightingPresets?: boolean;
  /** 是否启用工具栏 */
  enableToolbar?: boolean;
  /** 拾取结果回调 */
  onPickingResult?: (result: any) => void;
  /** 配置变更回调 */
  onConfigChange?: (config: any) => void;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 类名 */
  className?: string;
}

/**
 * 场景配置查看器组件
 * 整合所有场景配置能力的完整组件
 */
export function SceneConfigViewer({
  children,
  width = '100%',
  height = '100%',
  backgroundColor = '#000000',
  enableShadows = true,
  enablePicking = true,
  enableBookmarks = true,
  enableLightingPresets = true,
  enableToolbar = true,
  onPickingResult,
  onConfigChange,
  style,
  className,
}: SceneConfigViewerProps) {
  const containerStyle: React.CSSProperties = {
    width,
    height,
    position: 'relative',
    ...style,
  };

  return (
    <div className={className} style={containerStyle}>
      <Canvas
        shadows={enableShadows}
        gl={{
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <AdaptiveDpr pixelated />
        <SceneConfigProvider
          options={{
            persist: true,
            onConfigChange,
          }}
        >
          <SceneConfigViewerInner
            enablePicking={enablePicking}
            enableBookmarks={enableBookmarks}
            enableLightingPresets={enableLightingPresets}
            enableToolbar={enableToolbar}
            backgroundColor={backgroundColor}
            enableShadows={enableShadows}
            onPickingResult={onPickingResult}
          >
            {children}
          </SceneConfigViewerInner>
        </SceneConfigProvider>
      </Canvas>
    </div>
  );
}

export default SceneConfigViewer;
