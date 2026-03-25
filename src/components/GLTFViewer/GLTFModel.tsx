// import useCameraAnimation from '@/hooks/usecameraAnimation';
import useInitApi from '@/hooks/useInitApi';
import globalData, { setApp } from '@/store/globalData';
import { CameraControls, useGLTF } from '@react-three/drei';
import { ThreeEvent, useThree } from '@react-three/fiber';
import {
  forwardRef,
  PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Group, Mesh, Object3D } from 'three';
import { GLTFModelProps } from '../../types';
// import { isModelInFocus } from "../../utils";
import { didMountAtom } from '@/atoms/didMount';
import {
  glowingAreaAtom,
  glowingModelAtom,
  mainModelAtom,
  selectedAreaModelAtom,
} from '@/atoms/selectModel';
import { useFlyToView } from '@/hooks/useCamera/flyToView';
import { useOptimalCameraPosition } from '@/hooks/useCamera/useOptimalCameraPosition';
// import { isModelInFocus } from '@/utils';
import { useAtomValue, useSetAtom } from 'jotai';
import ArrowDown from '../ArrowDown';
import BubbleTitleManagement from '../BubbleTitle/management';
import HubModel from '../HubModel';
import StatusPanelManagement from '../StatusPanel/management';
// import useCameraCollider from '../../hooks/useCameraCollider';
import { useControls } from 'leva';
import { SmartLighting } from '../SmartLight';
import SmartPerspective from '../SmartPerspective';
// import useCameraFocus from '@/hooks/useCameraFocus';
// import SceneModel from "../SceneModel";

const GLTFModel = forwardRef<Group, GLTFModelProps>(
  (
    {
      url,
      position,
      rotation,
      onLoad,
      onProgress,
      onError,
      modelClick,
      modelRightClick,
      forbidSelectionModelNameList,
      // cameraPosition,
      // cameraTarget,
      ambientLightIntensity,
      enableShadows,
      directionalLightPosition,
      directionalLightIntensity,
      hdrUrl,
      smartLightingEnabled = true,
      enableSmartPerspectiveEnabled = false,
      controlsRef,
    },
    ref
  ) => {
    const [{ enableSmartLighting, enableSmartPerspective, showVirModel }] =
      useControls('基础配置', () => {
        return {
          enableSmartLighting: {
            value: smartLightingEnabled,
            label: '启用智能灯光',
          },
          enableSmartPerspective: {
            value: enableSmartPerspectiveEnabled,
            label: '启用智能视角',
          },
          showVirModel: {
            value: false,
            label: '展示虚模型',
          },
        };
      });

    const rightClickStartPosRef = useRef<{
      x: number;
      y: number;
    } | null>(null);

    const leftClickStartPosRef = useRef<{
      x: number;
      y: number;
    } | null>(null);

    const gltf = useGLTF(url, true);

    const { scene } = gltf;

    const { controls } = useThree<{ controls: CameraControls }>();

    const selectedArea = useAtomValue(selectedAreaModelAtom);

    const modelObjectListRef = useRef<Object3D[]>([]);

    const [, setFocusAreaList] = useState<Object3D[]>([]);

    const glowingModel = useAtomValue(glowingModelAtom);

    const glowingArea = useAtomValue(glowingAreaAtom);

    const setMainModel = useSetAtom(mainModelAtom);

    const setDidMount = useSetAtom(didMountAtom);

    useInitApi();

    // useCameraCollider();

    const { moveCamera } = useFlyToView({
      transitionDuration: 1000,
    });

    const { initalCameraPostion, toggleBoundingBox } =
      useOptimalCameraPosition();

    // useCameraFocus(20, focusAreaLis);

    const mountedRef = useRef(false);

    const scale = useMemo(() => {
      return selectedArea ? 0.5 : 1;
    }, [selectedArea]);

    useEffect(() => {
      globalData.app?.toggleVirModel?.(showVirModel);
    }, [showVirModel]);

    useEffect(() => {
      if (scene) {
        // import("../../../public/parser").then((res) => {
        //   console.log(res.default(gltf, { fileName: "test" }));
        // });
        try {
          // 自动居中和缩放模型
          // const box = new Box3().setFromObject(scene);
          // const center = box.getCenter(new Vector3());

          // 将模型居中
          // scene.position.sub(center);

          const objectsNameDict: { [name: string]: Object3D } = {};
          const objectsIdDict: { [id: number]: Object3D } = {};
          const virObjectsNameDict: { [name: string]: Object3D } = {};
          const areaNameDict: {
            [name: string]: {
              object: Object3D;
              children: Object3D[];
            };
          } = {};

          modelObjectListRef.current = [];

          // 启用阴影
          scene.traverse(child => {
            if (
              globalData.app?.focusModelNames?.length > 0 &&
              globalData.app?.focusModelNames?.includes(child.name)
            ) {
              modelObjectListRef.current.push(child);
            }

            if (
              child.name.toUpperCase().includes('VIR')
              // || child.name.includes("Cable-")
            ) {
              virObjectsNameDict[child.name] = child;
              return;
            }
            objectsNameDict[child.name] = child;
            objectsIdDict[child.id] = child;
            if (child instanceof Mesh) {
              child.castShadow = false;
              child.receiveShadow = false;
            }
            const areaName = child.name.split('_').slice(0, 2).join('_');

            if (areaName) {
              if (!areaNameDict[areaName]) {
                areaNameDict[areaName] = {
                  object: null!,
                  children: [],
                };
              }
              if (child.name === areaName) {
                areaNameDict[areaName].object = child;
              } else {
                areaNameDict[areaName].children.push(child);
              }
            }
          });

          setApp({
            objectsNameDict,
            objectsIdDict,
            areaNameDict,
            modelObjectList: modelObjectListRef.current,
            virObjectsNameDict,
            // 暴露相机控制方法
            flyToPosition: (
              position: [number, number, number],
              target: [number, number, number],
              duration = 1000
            ) => {
              moveCamera({
                position,
                target,
                duration,
              });
            },
          });

          const areaNameSet = new Set<string>();
          setFocusAreaList(
            modelObjectListRef.current.reduce<Object3D[]>((acc, model) => {
              const areaName = model.name.split('_').slice(0, 2).join('_');
              if (!areaNameSet.has(areaName)) {
                areaNameSet.add(areaName);
                acc.push(areaNameDict[areaName]?.object || model);
              }
              return acc;
            }, [])
          );

          onProgress?.(100);
          onLoad?.(scene);
        } catch (error) {
          onError?.(error as Error);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scene]);

    useEffect(() => {
      if (controls && !mountedRef.current) {
        globalThis.setTimeout(() => {
          initalCameraPostion(() => {
            // setDidMount(true);
            // mountedRef.current = true;
            // const virObjectsNameDict = globalData.app?.virObjectsNameDict || {};
            // const outlineColor = '#FF0000';
            // Object.keys(virObjectsNameDict).forEach(name => {
            //   const obj = virObjectsNameDict[name];
            //   if (obj instanceof Mesh) {
            //     const sourceColor = obj.material.color.clone();
            //     obj.material.originalColor = sourceColor;
            //     if (obj.name.toUpperCase().includes('VIR')) {
            //       obj.material.transparent = true;
            //       obj.material.opacity = 0;
            //       obj.material.needsUpdate = true;
            //       obj.material.depthTest = true;
            //       obj.material.depthWrite = true;
            //       obj.material.color.set(outlineColor);
            //     }
            //   }
            // });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).toggleBoundingBox = toggleBoundingBox;
          }, true);
        }, 300);

        globalThis.setTimeout(() => {
          moveCamera({
            position: [
              -16.25080208316181, 11.991557665219235, 19.010055706805606,
            ],
            target: [1.705, 0.539, -2.829],
            duration: 1000,
            onTransitionEnd: () => {
              setDidMount(true);
              mountedRef.current = true;
              const virObjectsNameDict =
                globalData.app?.virObjectsNameDict || {};
              const outlineColor = '#FF0000';
              Object.keys(virObjectsNameDict).forEach(name => {
                const obj = virObjectsNameDict[name];
                if (obj instanceof Mesh) {
                  const sourceColor = obj.material.color.clone();
                  obj.material.originalColor = sourceColor;
                  if (obj.name.toUpperCase().includes('VIR')) {
                    obj.material.transparent = true;
                    obj.material.opacity = 0;
                    obj.material.needsUpdate = true;
                    obj.material.depthTest = true;
                    obj.material.depthWrite = true;
                    obj.material.color.set(outlineColor);
                  }
                }
              });
            },
          });
        }, 300);

        // globalData.app.flyToView?.(
        //   {
        //     position: [
        //       -16.25080208316181, 11.991557665219235, 19.010055706805606,
        //     ],
        //     target: [1.705, 0.539, -2.829],
        //   },
        //   {
        //     duration: 1000,
        //   },
        //   () => {
        //     setDidMount(true);
        //     mountedRef.current = true;
        //     const virObjectsNameDict = globalData.app?.virObjectsNameDict || {};
        //     const outlineColor = "#FF0000";
        //     Object.keys(virObjectsNameDict).forEach((name) => {
        //       const obj = virObjectsNameDict[name];
        //       if (obj instanceof Mesh) {
        //         const sourceColor = obj.material.color.clone();
        //         obj.material.originalColor = sourceColor;
        //         if (obj.name.toUpperCase().includes("VIR")) {
        //           obj.material.transparent = true;
        //           obj.material.opacity = 0;
        //           obj.material.needsUpdate = true;
        //           obj.material.depthTest = true;
        //           obj.material.depthWrite = true;
        //           obj.material.color.set(outlineColor);
        //         }
        //       }
        //     });
        //   }
        // );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controls]);
    // const [selectedAreaModel, setSelectedAreaModel] = useAtom(
    //   selectedAreaModelAtom
    // );

    const handleClick = useCallback(
      (e: ThreeEvent<globalThis.MouseEvent>, force = false) => {
        e.stopPropagation(); // 阻止事件冒泡

        if (leftClickStartPosRef.current) {
          // 计算鼠标移动距离
          const dx = Math.abs(e.clientX - leftClickStartPosRef.current.x);
          const dy = Math.abs(e.clientY - leftClickStartPosRef.current.y);
          const moveThreshold = 5; // 允许的最大移动像素
          // 如果移动距离大于阈值，则不触发点击事件
          if (dx > moveThreshold || dy > moveThreshold) return;
        }

        // // ===== 计算点击位置的3D坐标 =====
        // if (e.point) {
        //   // 世界坐标（全局坐标系中的位置）
        //   const worldPosition = e.point.clone();

        //   // 局部坐标（相对于被点击对象的坐标）
        //   const localPosition = e.object.worldToLocal(worldPosition.clone());

        //   // 交点法向量（表面法线）
        //   const normal = e.face?.normal || null;

        //   // 射线距离（从相机到交点的距离）
        //   const distance = e.distance;

        //   // UV坐标（纹理坐标，如果有的话）
        //   const uv = e.uv || null;

        //   console.log("🎯 点击位置3D坐标信息:", {
        //     worldPosition: {
        //       x: worldPosition.x.toFixed(3),
        //       y: worldPosition.y.toFixed(3),
        //       z: worldPosition.z.toFixed(3),
        //     },
        //     localPosition: {
        //       x: localPosition.x.toFixed(3),
        //       y: localPosition.y.toFixed(3),
        //       z: localPosition.z.toFixed(3),
        //     },
        //     objectName: e.object.name,
        //     distance: distance?.toFixed(3),
        //     normal: normal
        //       ? {
        //           x: normal.x.toFixed(3),
        //           y: normal.y.toFixed(3),
        //           z: normal.z.toFixed(3),
        //         }
        //       : null,
        //     uv: uv
        //       ? {
        //           u: uv.x.toFixed(3),
        //           v: uv.y.toFixed(3),
        //         }
        //       : null,
        //     screenPosition: {
        //       x: e.clientX,
        //       y: e.clientY,
        //     },
        //   });
        // }

        console.log('handleClick: ', e, forbidSelectionModelNameList);
        // 检查是否禁止选择该模型
        if (!(forbidSelectionModelNameList || []).includes(e.object.name)) {
          modelClick?.(e.object);
        }

        globalData.app?.clickModelFromObj?.(e.object, force);

        leftClickStartPosRef.current = null;
      },
      [forbidSelectionModelNameList, modelClick]
    );

    const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (e.button === 2) {
        // 右键按下
        rightClickStartPosRef.current = { x: e.clientX, y: e.clientY };
      } else if (e.button === 0) {
        // 左键按下
        leftClickStartPosRef.current = { x: e.clientX, y: e.clientY };
      }
    }, []);

    const handleContextMenu = useCallback(
      (e: ThreeEvent<globalThis.MouseEvent>) => {
        e.stopPropagation();

        if (rightClickStartPosRef.current) {
          // 计算鼠标移动距离
          const dx = Math.abs(e.clientX - rightClickStartPosRef.current.x);
          const dy = Math.abs(e.clientY - rightClickStartPosRef.current.y);
          const moveThreshold = 5; // 允许的最大移动像素

          // 只有当移动距离小于阈值时才触发右键点击事件
          if (dx <= moveThreshold && dy <= moveThreshold) {
            console.log('modelRightClick: ', e);
            modelRightClick?.(e.object);
            if (e.object) {
              const findParent = (obj: Object3D) => {
                // if (isModelInFocus(obj)) return obj;
                if (
                  obj.name.includes('10kV-SWG_SWG@212_212') ||
                  obj.name.includes('10kV-SWG_SWG@213_213') ||
                  obj.name.includes('10kV-SWG_SWG@245_245')
                )
                  return obj;
                if (obj?.parent) return findParent(obj.parent);
                return null;
              };
              const selectedDevice = findParent(e.object);

              if (selectedDevice) {
                const areaName = selectedDevice.name
                  .split('_')
                  .slice(0, 2)
                  .join('_');
                const areaModel =
                  globalData.app?.areaNameDict[areaName]?.object;
                if (areaModel) {
                  globalData.app?.flyToObject?.(
                    areaModel,
                    {
                      mousePoint: { x: e.x, y: e.y },
                    },
                    () => {
                      globalData.app?.flyEndHandle?.(e.object);
                    }
                  );
                }
              }
            }
          }

          rightClickStartPosRef.current = null;
        }
      },
      [modelRightClick]
    );

    if (!scene) {
      return null;
    }

    return (
      <>
        <group
          ref={r => {
            if (ref) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (ref as any).current = r;
            }
            setMainModel(r);
          }}
          scale={scale}
          position={position}
          rotation={rotation}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onContextMenu={handleContextMenu}
        >
          <primitive object={scene}></primitive>
          {/* <Clone object={scene} castShadow={false} receiveShadow={false} /> */}

          {glowingModel && <primitive object={glowingModel} />}
          {glowingArea && <primitive object={glowingArea} />}
          {/* <BoundingBoxVisualizer /> */}
        </group>
        <HubModel
          onClick={handleClick}
          ambientLightIntensity={ambientLightIntensity}
          enableShadows={enableShadows}
          directionalLightPosition={directionalLightPosition}
          directionalLightIntensity={directionalLightIntensity}
          hdrUrl={hdrUrl}
        />
        {globalData?.app?.sensorList?.length > 0 && !selectedArea && (
          <BubbleTitleManagement
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            titleList={globalData?.app?.sensorList?.map((sensor: any) => {
              return {
                name: sensor.materialName,
                title: sensor.displayTitle || '最大幅值',
                content: sensor.displayContent || '--',
                ...sensor,
              };
            })}
          />
        )}
        {globalData?.app?.focusMonitorModelNames?.length > 0 &&
          !selectedArea && (
            <StatusPanelManagement
              titleList={globalData?.app?.focusMonitorModelNames || []}
            />
          )}
        {selectedArea && <ArrowDown />}

        {enableSmartLighting && <SmartLighting mode='camera' />}

        {enableSmartPerspective && <SmartPerspective controls={controlsRef} />}
      </>
    );
  }
);

GLTFModel.displayName = 'GLTFModel';

export default GLTFModel;
