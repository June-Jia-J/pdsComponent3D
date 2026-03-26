import React, {
  Suspense,
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
  Ref,
} from 'react';
import { Canvas } from '@react-three/fiber';
import {
  CameraControls,
  CameraControlsImpl,
  PerspectiveCamera,
  AdaptiveDpr,
} from '@react-three/drei';
import { GLTFViewerProps, LoadingState, TcordonConfigItem } from '../../types';
import GLTFModel from './GLTFModel';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { useControls } from 'leva';
import {
  Object3D,
  PerspectiveCamera as PerspectiveCameraImpl,
  // Box3,
  // Vector3,
  Group,
  // Vector3,
} from 'three';
import DeviceInfoLabel from './DeviceInfoLabel';
import { useDeviceLabels } from '@/hooks/useDeviceLabels';
import { DeviceLabelConfig } from '@/types';
import globalData, { setApp } from '@/store/globalData';
import BoundingBoxHelper from '../BoundingBoxHelper';
import EnvirComponent from './EnvirComponent';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  selectedModelAtom,
  screenPositionAtom,
  selectedAreaModelAtom,
  // selectedMonitorModelAtom,
  // modelScreenPositionAtom,
} from '@/atoms/selectModel';
import Roulette from '../HubModel/Roulette';
// import StatusPanel from "../StatusPanel";
import Cordon from '../Cordon';
import { cordonConfigAtom } from '@/atoms/cordonConfig';
import {
  controlingAtom,
  controlToggleAtom,
  mainCameraAtom,
} from '@/atoms/controlManagement';
// import { selectedIdAtom } from "@/atoms/rouletteModel";
import ModelCoordinateCalculator from '../ModelCoordinateCalculator';
import { SceneConfigProvider, ScenePickingHandler } from '../SceneConfigProvider';
import DecalManager from '../Decal/DecalManager';
import {
  useDecalManager,
  UseDecalManagerReturn,
} from '@/hooks/useDecalManager';

const { ACTION } = CameraControlsImpl;

const GLTFViewer: React.FC<GLTFViewerProps> = ({
  server = window.location.origin,
  modelList = [],
  showLoading = false,
  setPolarAngle = {
    min: Math.PI / 6,
    max: Math.PI / 2.1,
    nearThreshold: 8,
  },
  // setCameraLimit = {
  //   minDistance: 1,
  //   maxDistance: 20,
  //   // 相机边界限制配置
  //   boundaryLimits: {
  //     // 各轴的最小最大值偏移
  //     x: { min: 0, max: 0 }, // X轴：左边界，右边界
  //     y: { min: 1, max: 0 }, // Y轴：下边界，上边界
  //     z: { min: 0, max: 0 }, // Z轴：后边界，前边界
  //   },
  // },
  forbidSelectionModelNameList = [],
  width = '100%',
  height = '100%',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  cameraPosition = [0, 0, 5],
  cameraTarget = [0, 0, 0],
  backgroundColor = 'black',
  enableShadows = false,
  ambientLightIntensity = 0.2,
  directionalLightIntensity = 0.5,
  directionalLightPosition = [10, 10, 5],
  deviceLabelConfig,
  onLabelMethodsReady,
  boundingBoxConfig,
  cordonConfig,
  decalConfigs = [], // 新增：贴花配置
  modelClick,
  onLoad,
  loadStatusCallBack,
  onProgress,
  onError,
  loadingComponent,
  errorComponent,
  className,
  style,
  enableSmartLighting: smartLightingEnabled = false,
  enableSmartPerspective: enableSmartPerspectiveEnabled = false,
  hdrUrl = './assets/potsdamer_platz_1k.hdr',
}) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    progress: 0,
    error: null,
    loaded: false,
  });

  const containerRef = useRef<globalThis.HTMLDivElement>(null);

  const cameraRef = useRef<PerspectiveCameraImpl>(null);
  const [mainCamera, setMainCamera] = useAtom(mainCameraAtom);

  const modelRef = useRef<{ [id: string]: Ref<Group> }>({});
  const controlsRef = useRef<CameraControlsImpl>(null);
  const [modelScene, setModelScene] = useState<Object3D | null>(null);

  const selectedModel = useAtomValue(selectedModelAtom);
  const selectedArea = useAtomValue(selectedAreaModelAtom);
  // const selectedMonitorModel = useAtomValue(selectedMonitorModelAtom);
  // const modelScreenPosition = useAtomValue(modelScreenPositionAtom);
  const screenPosition = useAtomValue(screenPositionAtom);
  const [controling, setControling] = useAtom(controlingAtom);
  const setControlToggle = useSetAtom(controlToggleAtom);
  const controlEndAbleRef = useRef<boolean>(true);

  const [cordConfigState, setCordConfigState] =
    useAtom<TcordonConfigItem[]>(cordonConfigAtom);

  // 贴花管理
  const decalManager = useDecalManager();

  // 处理贴花更新

  const handleDecalUpdate = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (decalId: string, data: any) => {
      decalManager.updateDecal(decalId, data);
    },
    [decalManager]
  );

  // 处理贴花移除
  const handleDecalRemove = useCallback(
    (decalId: string) => {
      decalManager.removeDecal(decalId);
    },
    [decalManager]
  );

  // 贴花管理器准备就绪回调 - 通过globalData.app挂载
  const handleDecalManagerReady = useCallback(
    (manager: UseDecalManagerReturn) => {
      // 通过globalData.app挂载贴花管理器实例
      setApp({
        decalManager: manager,
      });
      // console.log("🎯 贴花管理器已挂载到 globalData.app");
    },
    []
  );

  // 初始化贴花配置 - 直接使用传入的decalConfigs
  useEffect(() => {
    // console.log("🔄 GLTFViewer: 贴花配置变化", {
    //   count: decalConfigs.length,
    //   configs: decalConfigs.map(d => ({ id: d.id, type: d.type }))
    // });

    // 清理所有现有贴花
    decalManager.clearDecals();

    // 添加新的贴花配置
    if (decalConfigs.length > 0) {
      // console.log("🔄 GLTFViewer: 添加贴花配置", decalConfigs.length, "个");
      decalConfigs.forEach(config => {
        decalManager.addDecal(config);
      });
    } else {
      // console.log("🗑️ GLTFViewer: 清空所有贴花");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decalConfigs]);

  const environmentIntensity = useMemo(() => {
    return selectedArea ? 0.1 : 1;
  }, [selectedArea]);

  const setControlingRef = useRef<typeof setControling | null>(null);

  setControlingRef.current = setControling;

  // 包围盒配置
  const finalBoundingBoxConfig = useMemo(() => {
    return {
      enabled: false,
      showBox: true,
      showCenter: true,
      boxColor: '#00ff00',
      centerColor: '#ff0000',
      centerSize: 0.1,
      lineWidth: 2,
      ...boundingBoxConfig,
    };
  }, [boundingBoxConfig]);

  const [boundingBoxControls] = useControls('包围盒辅助', () => {
    return {
      enabled: {
        value: finalBoundingBoxConfig.enabled,
        label: '启用包围盒显示',
      },
      showBox: {
        value: finalBoundingBoxConfig.showBox,
        label: '显示包围盒',
      },
      showCenter: {
        value: finalBoundingBoxConfig.showCenter,
        label: '显示中心点',
      },
      boxColor: {
        value: finalBoundingBoxConfig.boxColor,
        label: '包围盒颜色',
      },
      centerColor: {
        value: finalBoundingBoxConfig.centerColor,
        label: '中心点颜色',
      },
      centerSize: {
        value: finalBoundingBoxConfig.centerSize,
        min: 0.01,
        max: 1,
        step: 0.01,
        label: '中心点大小',
      },
    };
  });
  // 直接使用deviceLabelConfig，设置默认值
  const finalDeviceLabelConfig = useMemo(() => {
    if (!deviceLabelConfig) {
      return {
        enabled: false,
        globalVisible: false,
        labels: [],
        defaultOffset: [0, 1, 0] as [number, number, number],
        autoPosition: true,
      };
    }

    return {
      enabled: true,
      globalVisible: true,
      defaultOffset: [0, 1, 0] as [number, number, number],
      autoPosition: true,
      ...deviceLabelConfig,
    };
  }, [deviceLabelConfig]);

  // 设备标签管理
  const {
    labels: deviceLabelInstances,
    addLabels: addLabelsHook,
    updateLabel: updateLabelHook,
    updateLabelText: updateLabelTextHook,
    clearLabels: clearLabelsHook,
  } = useDeviceLabels(modelScene || undefined, {
    defaultOffset: finalDeviceLabelConfig.defaultOffset,
    autoPosition: finalDeviceLabelConfig.autoPosition,
    positionMode: finalDeviceLabelConfig.positionMode || 'bbox-top',
  });

  // 暴露方法给父组件
  useEffect(() => {
    if (onLabelMethodsReady) {
      onLabelMethodsReady({
        updateLabel: updateLabelHook,
        updateLabelText: updateLabelTextHook,
        addLabels: addLabelsHook,
        clearLabels: clearLabelsHook,
        getLabels: () => deviceLabelInstances,
      });
    }
  }, [
    updateLabelHook,
    updateLabelTextHook,
    addLabelsHook,
    clearLabelsHook,
    onLabelMethodsReady,
    deviceLabelInstances,
  ]);

  // 调试信息：检查设备标签实例
  // console.log("📱 当前设备标签实例数量:", deviceLabelInstances.length);

  // 稳定化标签列表，避免不必要的重新渲染
  const stableLabels = useMemo(() => {
    return finalDeviceLabelConfig.labels || [];
  }, [finalDeviceLabelConfig.labels]);

  // 初始化和更新设备标签
  useEffect(() => {
    // console.log("🔄 设备标签配置更新:", {
    //   enabled: finalDeviceLabelConfig.enabled,
    //   labelsLength: stableLabels.length,
    //   labels: stableLabels,
    // });

    if (finalDeviceLabelConfig.enabled && stableLabels.length > 0) {
      // console.log("✅ 添加设备标签:", stableLabels.length, "个");
      clearLabelsHook();
      addLabelsHook(stableLabels as DeviceLabelConfig[]);
    } else {
      // console.log(
      //   "🚫 清理设备标签 - 原因:",
      //   !finalDeviceLabelConfig.enabled ? "已禁用" : "无标签"
      // );
      clearLabelsHook();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalDeviceLabelConfig.enabled, stableLabels]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearLabelsHook();
    };
  }, [clearLabelsHook]);

  // 设置相机边界
  // const _setupCameraBoundary = useCallback(() => {
  //   if (controlsRef.current && modelScene) {
  //     try {
  //       // 创建场景包围盒
  //       const sceneBoundary = new Box3();
  //       sceneBoundary.setFromObject(modelScene);

  //       // 计算场景尺寸和中心点
  //       // const sceneSize = sceneBoundary.getSize(new Vector3());
  //       // const sceneCenter = sceneBoundary.getCenter(new Vector3());

  //       // 创建相机边界（基于场景包围盒）
  //       const cameraBoundary = new Box3();

  //       // 获取边界限制配置，如果没有配置则使用默认值
  //       const boundaryConfig = setCameraLimit.boundaryLimits || {
  //         x: { min: 0, max: 0 },
  //         y: { min: 0, max: 2 },
  //         z: { min: 0, max: 0 },
  //       };

  //       // 计算各轴的最小最大值
  //       const minX = sceneBoundary.min.x + boundaryConfig.x.min;
  //       const maxX = sceneBoundary.max.x + boundaryConfig.x.max;
  //       const minY = sceneBoundary.min.y + boundaryConfig.y.min;
  //       const maxY = sceneBoundary.max.y + boundaryConfig.y.max;
  //       const minZ = sceneBoundary.min.z + boundaryConfig.z.min;
  //       const maxZ = sceneBoundary.max.z + boundaryConfig.z.max;

  //       // 设置相机边界
  //       cameraBoundary.set(
  //         new Vector3(minX, minY, minZ),
  //         new Vector3(maxX, maxY, maxZ)
  //       );

  //       // 设置相机边界
  //       controlsRef.current.setBoundary(cameraBoundary);

  //       // console.log("📐 相机边界已设置:", {
  //       //   sceneBoundary: {
  //       //     min: sceneBoundary.min.toArray(),
  //       //     max: sceneBoundary.max.toArray(),
  //       //     size: sceneSize.toArray(),
  //       //     center: sceneCenter.toArray(),
  //       //   },
  //       //   cameraBoundary: {
  //       //     min: cameraBoundary.min.toArray(),
  //       //     max: cameraBoundary.max.toArray(),
  //       //   },
  //       //   boundaryLimits: boundaryConfig,
  //       //   boundarySize: {
  //       //     x: maxX - minX,
  //       //     y: maxY - minY,
  //       //     z: maxZ - minZ,
  //       //   },
  //       // });
  //     } catch {
  //       // console.warn("⚠️ 设置相机边界失败");
  //     }
  //   }
  // }, [modelScene, setCameraLimit.boundaryLimits]);

  // 设置相机边界
  // useEffect(() => {
  //   if (controlsRef.current && modelScene) {
  //     // 延迟设置边界，确保相机控制器完全初始化
  //     const timer = globalThis.setTimeout(() => {
  //       setupCameraBoundary();
  //     }, 100);

  //     return () => globalThis.clearTimeout(timer);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [controlsRef.current, modelScene]);

  useEffect(() => {
    setCordConfigState(cordonConfig || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cordonConfig]);

  // 模型加载完成后设置场景
  const handleModelLoad = useCallback((scene: Object3D) => {
    setModelScene(scene);
  }, []);

  const handleLoad = useCallback(
    (scene?: Object3D) => {
      setLoadingState(prev => ({ ...prev, isLoading: false, loaded: true }));
      if (scene) {
        onLoad?.(scene);
        handleModelLoad(scene);
        loadStatusCallBack?.('loadComplete', scene);

        setApp({
          scene,
        });
      }
    },
    [onLoad, handleModelLoad, loadStatusCallBack]
  );

  const handleProgress = useCallback(
    (progress: number) => {
      setLoadingState(prev => ({ ...prev, progress }));
      onProgress?.(progress);
    },
    [onProgress]
  );

  const handleError = useCallback(
    (error: Error) => {
      setLoadingState(prev => ({ ...prev, isLoading: false, error }));
      onError?.(error);
    },
    [onError]
  );

  const handleControlEnd = useCallback(() => {
    setApp({
      cameraControling: false,
    });
    // globalData.app?.onControlEnd?.();
    controlEndAbleRef.current = true;
    setControling(false);
    setControlToggle({});
  }, [setControlToggle, setControling]);

  const handleEndTimer = useRef<globalThis.NodeJS.Timeout | null>(null);

  const handleEnd = useCallback(() => {
    if (handleEndTimer.current) {
      globalThis.clearTimeout(handleEndTimer.current);
    }
    handleEndTimer.current = globalThis.setTimeout(() => {
      globalData.app?.onControlEnd?.();
      setControling(false);
      setControlToggle({});
    }, 300);
  }, [setControlToggle, setControling]);

  const handleChange = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleControlStartTimer = useRef<globalThis.NodeJS.Timeout | null>(
    null
  );
  const handleControlStart = useCallback(() => {
    setApp({
      cameraControling: false,
    });
    if (handleControlStartTimer.current) {
      globalThis.clearTimeout(handleControlStartTimer.current);
    }
    controlEndAbleRef.current = false;
    handleControlStartTimer.current = globalThis.setTimeout(() => {
      if (!controlEndAbleRef.current) {
        setControling(true);
      }
    }, 300);
  }, [setControling]);

  // useEffect(() => {
  //   if (controlsRef.current) {
  //     controlsRef.current.setLookAt(
  //       cameraPosition[0],
  //       cameraPosition[1],
  //       cameraPosition[2],
  //       cameraTarget[0],
  //       cameraTarget[1],
  //       cameraTarget[2]
  //     );
  //   }
  // }, [cameraPosition, cameraTarget]);

  const containerStyle = useMemo<React.CSSProperties>(() => {
    return {
      width,
      height,
      position: 'relative',
      ...style,
    };
  }, [height, style, width]);

  const cordonList = useMemo(() => {
    return cordConfigState?.filter(item => item.enabled) || [];
  }, [cordConfigState]);

  // 如果有错误，显示错误组件
  if (loadingState.error) {
    return (
      <div className={className} style={containerStyle}>
        {errorComponent || <ErrorDisplay error={loadingState.error} />}
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className={className} style={containerStyle}>
        {/* 加载状态显示 */}
        {showLoading && loadingState.isLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 10,
            }}
          >
            {loadingComponent || (
              <LoadingSpinner progress={loadingState.progress} />
            )}
          </div>
        )}

        {/* 3D场景 */}
        <Canvas
          // frameloop="demand"
          camera={mainCamera || undefined}
          shadows={enableShadows}
          gl={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true,
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <AdaptiveDpr pixelated />
          
          {/* 场景配置系统 */}
          <SceneConfigProvider controls={controlsRef} defaultLightingPreset="preset-default">
            <ScenePickingHandler enabled={true} />

          {/* 背景 */}
          <color attach='background' args={[backgroundColor]} />

          <EnvirComponent
            ambientLightIntensity={ambientLightIntensity}
            enableShadows={enableShadows}
            directionalLightPosition={directionalLightPosition}
            directionalLightIntensity={directionalLightIntensity}
            environmentIntensity={environmentIntensity}
            hdrUrl={hdrUrl}
          />

          {/* 模型 */}
          <Suspense fallback={null}>
            {modelList.map(model => {
              if (!modelRef.current[model.id]) {
                modelRef.current[model.id] = { current: null };
              }
              return (
                <GLTFModel
                  key={model.id}
                  ref={modelRef.current[model.id]}
                  url={`${server}${model.url}`}
                  position={position}
                  rotation={rotation}
                  scale={scale}
                  onLoad={handleLoad}
                  onProgress={handleProgress}
                  onError={handleError}
                  forbidSelectionModelNameList={forbidSelectionModelNameList}
                  modelClick={modelClick}
                  cameraPosition={cameraPosition}
                  cameraTarget={cameraTarget}
                  ambientLightIntensity={ambientLightIntensity}
                  enableShadows={enableShadows}
                  directionalLightPosition={directionalLightPosition}
                  directionalLightIntensity={directionalLightIntensity}
                  hdrUrl={hdrUrl}
                  smartLightingEnabled={smartLightingEnabled}
                  enableSmartPerspectiveEnabled={enableSmartPerspectiveEnabled}
                  controlsRef={controlsRef}
                />
              );
            })}
          </Suspense>

          {/* 设备标签 */}
          {finalDeviceLabelConfig.enabled &&
            finalDeviceLabelConfig.globalVisible && (
              <>
                {deviceLabelInstances.map(labelInstance => (
                  <DeviceInfoLabel
                    key={labelInstance.id}
                    position={labelInstance.finalPosition}
                    width={labelInstance.width}
                    height={labelInstance.height}
                    bgUrl={labelInstance.bgUrl}
                    iconUrl={labelInstance.iconUrl}
                    labelList={labelInstance.labelList}
                    onClick={event =>
                      labelInstance.onClick?.(labelInstance.id, event)
                    }
                    canvasWidth={labelInstance.canvasWidth}
                    canvasHeight={labelInstance.canvasHeight}
                    iconPosition={labelInstance.iconPosition}
                    iconSize={labelInstance.iconSize}
                    materialOptions={labelInstance.materialOptions}
                    lookAtCamera={labelInstance.lookAtCamera}
                    visible={labelInstance.visible}
                  />
                ))}
              </>
            )}

          <PerspectiveCamera
            ref={ref => {
              cameraRef.current = ref;
              if (ref) {
                setMainCamera(ref);
              }
            }}
            makeDefault
            castShadow={enableShadows}
            receiveShadow={enableShadows}
            fov={50}
            near={0.1}
            far={1000}
          />

          {mainCamera && (
            <CameraControls
              // impl={CustomCameraControlsImpl}
              ref={ref => {
                controlsRef.current = ref;
                // 相机控制器初始化完成后，如果场景已加载则设置边界
                // if (ref && modelScene) {
                //   globalThis.setTimeout(() => {
                //     setupCameraBoundary();
                //   }, 100);
                // }
              }}
              // camera={cameraRef.current}
              makeDefault
              mouseButtons={{
                left: selectedArea ? ACTION.NONE : ACTION.TRUCK, // 左键平移
                middle: ACTION.DOLLY, // 中键缩放
                right: ACTION.ROTATE, // 右键旋转
                wheel: ACTION.DOLLY, // 滚轮缩放
              }}
              touches={{
                one: ACTION.TOUCH_ROTATE,
                two: ACTION.TOUCH_DOLLY_TRUCK,
                three: ACTION.TOUCH_DOLLY_TRUCK,
              }}
              // dollyToCursor={true} // 缩放时以鼠标位置为中心
              infinityDolly={false} // 禁用无限缩放
              minZoom={1}
              maxZoom={1}
              // minDistance={setCameraLimit.minDistance} // 最小距离
              // maxDistance={setCameraLimit.maxDistance} // 最大距离
              maxPolarAngle={setPolarAngle.max} // 最大垂直旋转角度
              // 碰撞检测配置
              // colliderMeshes={Object.keys(modelRef.current).reduce(
              //   (acc, item) => {

              //     if (
              //       modelRef.current[item] &&
              //       (modelRef.current[item] as any).current
              //     ) {
              //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
              //       acc.push((modelRef.current[item] as any).current);
              //     }
              //     return acc;
              //   },
              //   [] as Object3D[]
              // )}
              // 限制相机移动
              truckSpeed={1.0} // 平移速度
              minPolarAngle={setPolarAngle.min} // 最小垂直旋转角度
              // boundaryFriction={0.3} // 碰撞边界摩擦力
              boundaryEnclosesCamera={true} // 确保相机不会穿过边界
              restThreshold={0.01} // 相机停止移动的阈值
              onControlStart={handleControlStart}
              onControlEnd={handleControlEnd}
              onChange={handleChange}
            />
          )}

          {/* 监控模型坐标计算器 - 独立运行，不依赖其他组件 */}
          <ModelCoordinateCalculator />

          {/* 包围盒辅助 */}
          {boundingBoxControls.enabled && modelScene && (
            <BoundingBoxHelper
              target={modelScene}
              showBox={boundingBoxControls.showBox}
              showCenter={boundingBoxControls.showCenter}
              boxColor={boundingBoxControls.boxColor}
              centerColor={boundingBoxControls.centerColor}
              centerSize={boundingBoxControls.centerSize}
              lineWidth={finalBoundingBoxConfig.lineWidth}
            />
          )}

          {/* 警戒线 */}
          {cordonList.length &&
            modelScene &&
            cordonList.map(cordon => (
              <Cordon
                areaModelNames={cordon.areaModelNames}
                distance={cordon.distance}
                color={cordon.color}
                lineWidth={cordon.lineWidth}
                lineCount={cordon.lineCount}
                lineSpacing={cordon.lineSpacing}
                cornerRadius={cordon.cornerRadius}
                visible={cordon.visible}
                entryPoint={cordon.entryPoint}
                alertColor={cordon.alertColor}
                scene={modelScene}
              />
            ))}

          {/* 贴花管理器 */}
          <DecalManager
            decals={decalManager.decals}
            onDecalUpdate={handleDecalUpdate}
            onDecalRemove={handleDecalRemove}
            onManagerReady={handleDecalManagerReady}
          />
          
          </SceneConfigProvider>
        </Canvas>
      </div>
      {selectedModel && (
        <div
          style={{
            position: 'absolute',
            top: screenPosition.y,
            left: screenPosition.x,
            transform: `translate(-50%, -50%)`,
            display: controling ? 'none' : 'block',
            zIndex: 150,
          }}
        >
          <Roulette />
        </div>
      )}
      {/* {selectedMonitorModel && (
        <div
          style={{
            position: "absolute",
            top: modelScreenPosition.y,
            left: modelScreenPosition.x,
            transform: `translate(-50%, -50%)`,
            display: controling ? "none" : "block",
            zIndex: 150,
          }}
        >
          <StatusPanel
            onClose={() => {
              console.log("监控模型：关闭状态面板");
            }}
          />
        </div>
      )} */}
    </>
  );
};

export default GLTFViewer;
