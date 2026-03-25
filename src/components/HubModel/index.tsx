import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CameraControlsImpl,
  Clone,
  Hud,
  PerspectiveCamera,
  // Wireframe,
} from '@react-three/drei';
import { useAtom, useAtomValue } from 'jotai';
import {
  glowingAreaAtom,
  glowingModelAtom,
  hudModelAtom,
  screenPositionAtom,
  selectedAreaModelAtom,
  selectedAreaModelPropsAtom,
  selectedModelAtom,
} from '@atoms/selectModel';
import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import {
  Group,
  PerspectiveCamera as PerspectiveCameraImpl,
  Vector3,
  Box3,
  Object3D,
  MeshStandardMaterial,
  Mesh,
} from 'three';
import EnvirComponent from '../GLTFViewer/EnvirComponent';
import { HubModelProps } from '@/types';
import globalData from '@/store/globalData';
import { selectedIdAtom } from '@/atoms/rouletteModel';
import BoundingBox from './BoundingBox';
// import useCameraAnimation from "@/hooks/usecameraAnimation";
// import Roulette from "./Roulette";

const showBox = true;

const showAnimation = true;

// emissive: 0x0be4de, // 使用青色发光

export const HubModel: React.FC<HubModelProps> = ({
  ambientLightIntensity,
  enableShadows,
  directionalLightPosition,
  directionalLightIntensity,
  hdrUrl,
  onClick,
}) => {
  const [selectedModel, setSelectedModel] = useAtom(selectedModelAtom);
  const [selectedAreaModel, setSelectedAreaModel] = useAtom(
    selectedAreaModelAtom
  );
  const selectedAreaProps = useAtomValue(selectedAreaModelPropsAtom);
  const [selectedId, setSelectedId] = useAtom(selectedIdAtom);
  const cameraRef = useRef<PerspectiveCameraImpl>(null);
  const groupRef = useRef<Group>(null);
  const [hudModel, setHudModel] = useAtom(hudModelAtom);
  const { camera, scene, size: screenSize, controls } = useThree();
  const [currentSelectedArea, setCurrentSelectedArea] =
    useState<Object3D | null>(null);
  const [currentSelectedModel, setCurrentSelectedModel] =
    useState<Object3D | null>(null);
  const [modelCenter, setModelCenter] = useState<number[]>([0, 0, 0]);
  const [areaTopPosition, setAreaTopPosition] = useState<number[]>([0, 0, 0]);
  const [screenPosition, setScreenPosition] = useAtom(screenPositionAtom);
  const modelCenterRef = useRef<Vector3>(new Vector3());
  const initialDistance = useRef<number | null>(null);

  // const glowingModelRef = useRef<Object3D | null>(null);
  const [glowingModel, setGlowingModel] = useAtom(glowingModelAtom);
  // const glowingAreaRef = useRef<Object3D | null>(null);
  const [glowingArea, setGlowingArea] = useAtom(glowingAreaAtom);

  // const animationEndRef = useRef(false);
  // const setCustomCameraFocusPointStata = useCameraAnimation(cameraRef);
  // const initalDistance = 32;
  const defaultDistance = 10; // 默认10米距离
  // eslint-disable-next-line no-unused-vars
  const handleClickRef = useRef<(e: ThreeEvent<globalThis.MouseEvent>) => void>(
    () => {}
  );

  const cameraPositionRef = useRef<Vector3 | null>(null);

  const sourceCameraPositionRef = useRef<{
    position: Vector3;
    target: Vector3;
  } | null>(null);

  // 创建发光效果模型
  const createGlowingModel = (model: Object3D) => {
    // 克隆模型
    const glowingModel = model.clone();
    glowingModel.scale.copy(model.scale); // 确保与原模型比例一致

    // 设置发光材质
    glowingModel.traverse((child: Object3D) => {
      if (child instanceof Mesh) {
        // 创建新的发光材质
        const glowMaterial = new MeshStandardMaterial({
          emissive: 0x0088ff,
          emissiveIntensity: 1,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
        });

        // 保存原始材质的颜色
        if (child.material instanceof MeshStandardMaterial) {
          glowMaterial.color = child.material.color.clone();
        }

        // 应用发光材质
        child.material = glowMaterial;
      }
    });

    // 稍微放大模型以避免z-fighting
    // glowingModel.scale.multiplyScalar(1);

    return glowingModel;
  };

  // // 计算一组模型的中心点
  // const getAreaBox = (models: Object3D[]) => {
  //   if (!models.length) return new Box3();

  //   // 创建一个包围盒
  //   const box = new Box3();

  //   // 扩展包围盒以包含所有模型
  //   models.forEach((model) => {
  //     const modelBox = new Box3().setFromObject(model);
  //     box.union(modelBox);
  //   });

  //   return box;
  // };

  useEffect(() => {
    if (!selectedAreaModel) {
      // 清理发光区域
      if (glowingArea) {
        glowingArea.removeFromParent();
        setGlowingArea(null);
      }
      // 移除发光模型
      if (glowingModel) {
        glowingModel.removeFromParent();
        setGlowingModel(null);
      }
      setCurrentSelectedArea(null);
      setCurrentSelectedModel(null);
      initialDistance.current = null;

      if (sourceCameraPositionRef.current) {
        (controls as CameraControlsImpl).setLookAt(
          sourceCameraPositionRef.current.position.x,
          sourceCameraPositionRef.current.position.y,
          sourceCameraPositionRef.current.position.z,
          sourceCameraPositionRef.current.target.x,
          sourceCameraPositionRef.current.target.y,
          sourceCameraPositionRef.current.target.z,
          true
        );
      }
      return;
    }

    if (!selectedModel) {
      // 移除发光模型
      if (glowingModel) {
        glowingModel.removeFromParent();
        setGlowingModel(null);
      }
      setCurrentSelectedModel(null);
      return;
    }

    if (
      !currentSelectedModel ||
      currentSelectedModel.name !== selectedModel.name
    ) {
      console.log('currentSelectedModel', selectedModel);
      const newSelectedModel = selectedModel.clone();
      newSelectedModel.scale.set(1, 1, 1);

      // 移除之前的发光模型（如果存在）
      if (glowingModel) {
        glowingModel.removeFromParent();
        setGlowingModel(null);
      }

      // 创建新的发光模型
      const newGlowingModel = createGlowingModel(selectedModel); // 使用原始的selectedModel而不是克隆后的
      newGlowingModel.position.copy(selectedModel.position);
      newGlowingModel.rotation.copy(selectedModel.rotation);
      newGlowingModel.scale.copy(selectedModel.scale);
      // 同步主场景的缩放
      newGlowingModel.scale.multiply(scene.scale);
      setGlowingModel(newGlowingModel);

      setCurrentSelectedModel(newSelectedModel);
    }

    if (
      !currentSelectedArea ||
      currentSelectedArea.name !== selectedAreaModel.name
    ) {
      const newSelectedArea = selectedAreaModel.clone();
      newSelectedArea.scale.set(1, 1, 1);

      setCurrentSelectedArea(newSelectedArea);

      if (selectedAreaProps.center) {
        (controls as CameraControlsImpl).setTarget(
          selectedAreaProps.center.x,
          selectedAreaProps.center.y,
          selectedAreaProps.center.z
        );
      }

      // 检查相机位置并调整
      const checkAndAdjustCameraPosition = () => {
        if (!camera || !selectedAreaModel) return;

        // 计算源模型的包围盒
        const modelBox = new Box3().setFromObject(selectedAreaModel);
        const modelCenter = modelBox.getCenter(new Vector3());
        const modelSize = modelBox.getSize(new Vector3());

        // 获取当前相机位置
        const cameraPosition = camera.position.clone();

        const cameraTarget = new Vector3();
        (controls as CameraControlsImpl).getTarget(cameraTarget);

        sourceCameraPositionRef.current = {
          position: cameraPosition,
          target: cameraTarget,
        };

        // 计算模型包围盒的最高点加4米
        const modelTopY = modelCenter.y + modelSize.y / 2 + 4;

        // 检查相机是否低于模型包围盒高度
        // if (cameraPosition.y < modelTopY) {
        console.log('相机位置低于模型包围盒，正在调整...');

        // 计算目标位置：顶部减去当前位置
        const targetY = modelTopY - cameraPosition.y;

        // 使用控制器平滑移动相机到新位置
        (controls as CameraControlsImpl).truck(0, -Math.max(targetY, 6), true);
        // }
      };

      // 延迟执行相机位置检查，确保模型已完全加载
      globalThis.setTimeout(() => {
        checkAndAdjustCameraPosition();

        if (showAnimation) {
          const cloneAreaForAnimation = selectedAreaModel.clone();
          // 同步主场景的缩放
          cloneAreaForAnimation.scale.copy(scene.scale);

          // 为区域模型添加发光效果
          cloneAreaForAnimation.traverse((child: Object3D) => {
            if (child instanceof Mesh) {
              // 创建发光材质
              const glowMaterial = new MeshStandardMaterial({
                emissive: 0x0be4de,
                emissiveIntensity: 0.4,
                transparent: true,
                opacity: 0.85,
                depthWrite: false,
                side: 2, // 双面渲染
              });

              // 保存原始材质的颜色
              if (child.material instanceof MeshStandardMaterial) {
                glowMaterial.color = child.material.color.clone();
              }

              // 应用发光材质
              child.material = glowMaterial;
            }
          });

          // 保存发光区域引用
          setGlowingArea(cloneAreaForAnimation);
        }
      }, 100);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel, selectedAreaModel]);

  // const cameraAnimation = useCallback(() => {
  //   if (cameraRef.current && currentSelectedArea) {
  //     // 计算选中区域的包围盒和中心点
  //     const areaBox = new Box3().setFromObject(currentSelectedArea);
  //     const areaCenter = areaBox.getCenter(new Vector3());

  //     // 获取当前主相机的方向向量
  //     const cameraDirection = new Vector3(0, 0, -1);
  //     cameraDirection.applyQuaternion(camera.quaternion);

  //     // 计算起始位置（距离模型中心 initalDistance 米，较远）
  //     const startPosition = areaCenter
  //       .clone()
  //       .sub(cameraDirection.clone().multiplyScalar(initalDistance))
  //       .add(new Vector3(0, -1.5, 0));

  //     const cameraDirection2 = new Vector3(0, 0, -1);
  //     cameraDirection2.applyQuaternion(camera.quaternion);

  //     // 计算结束位置（距离模型中心 defaultDistance 米，较近）
  //     const endPosition = areaCenter
  //       .clone()
  //       .sub(cameraDirection2.clone().multiplyScalar(defaultDistance))
  //       .add(new Vector3(0, -1.5, 0));

  //     animationEndRef.current = false;

  //     cameraRef.current!.position.copy(startPosition);
  //     cameraRef.current!.quaternion.copy(camera.quaternion);

  //     // 设置动画参数
  //     setCustomCameraFocusPointStata({
  //       duration: 1000,
  //       from: {
  //         x: startPosition.x,
  //         y: startPosition.y,
  //         z: startPosition.z,
  //         lookAtX: areaCenter.x,
  //         lookAtY: areaCenter.y,
  //         lookAtZ: areaCenter.z,
  //       },
  //       to: {
  //         x: endPosition.x,
  //         y: endPosition.y,
  //         z: endPosition.z,
  //         lookAtX: areaCenter.x,
  //         lookAtY: areaCenter.y,
  //         lookAtZ: areaCenter.z,
  //       },
  //       onFinish: () => {
  //         // 动画结束时将 animationEndRef 设为 true
  //         animationEndRef.current = true;
  //       },
  //     });
  //   }
  // }, [
  //   currentSelectedArea,
  //   camera.quaternion,
  //   setCustomCameraFocusPointStata,
  //   initalDistance,
  //   defaultDistance,
  // ]);

  // useEffect(() => {
  //   // 触发相机从远到近的初始化动画
  //   cameraAnimation();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [currentSelectedArea]);

  // 同步相机和模型状态
  useFrame(() => {
    if (
      // !currentSelectedModel ||
      // !selectedModel ||
      // !animationEndRef.current ||
      !cameraRef.current ||
      !groupRef.current ||
      !currentSelectedArea
    )
      return;

    const areaBox = new Box3().setFromObject(currentSelectedArea);
    const areaCenter = areaBox.getCenter(new Vector3());
    const areaSize = areaBox.getSize(new Vector3());
    modelCenterRef.current = areaCenter;

    // 计算区域顶部位置（中心点 + 高度/2 + 偏移）
    const topPosition = [
      areaCenter.x,
      areaCenter.y + areaSize.y / 2 + 0.3, // 在顶部上方0.5米
      areaCenter.z,
    ];

    if (
      areaTopPosition[0] !== topPosition[0] ||
      areaTopPosition[1] !== topPosition[1] ||
      areaTopPosition[2] !== topPosition[2]
    ) {
      setAreaTopPosition(topPosition);
    }
    // 计算模型的尺寸
    // const areaSize = areaBox.getSize(new Vector3());

    if (currentSelectedModel) {
      currentSelectedArea.traverse(child => {
        if (child.name === currentSelectedModel.name) {
          // 计算模型的包围盒和中心点
          const box = new Box3().setFromObject(child);
          const center = box.getCenter(new Vector3());
          const size = box.getSize(new Vector3());
          const newCenter = [
            center.x,
            center.y,
            center.z + size.z / 2 + 0.1, // 加0.1米的偏移，防止贴得太近
          ];

          // 计算模型表面的位置（在模型中心的基础上，向前偏移模型尺寸的一半）
          if (
            modelCenter[0] !== newCenter[0] ||
            modelCenter[1] !== newCenter[1] ||
            modelCenter[2] !== newCenter[2]
          ) {
            setModelCenter(newCenter);
          }

          // 创建一个 Vector3 来存储模型中心点
          const worldPosition = new Vector3(...newCenter);

          // 将世界坐标转换为标准化设备坐标 (NDC)
          const vector = worldPosition.project(cameraRef.current!);

          // 将 NDC 坐标转换为屏幕像素坐标
          const x = ((vector.x + 1) * screenSize.width) / 2;
          const y = ((-vector.y + 1) * screenSize.height) / 2;

          if (screenPosition.x !== x || screenPosition.y !== y) {
            setScreenPosition({ x, y });
          }
        }
      });
    }

    // 保持相机的当前朝向，计算相机前方的方向向量
    const cameraDirection = new Vector3(0, 0, -1);
    cameraDirection.applyQuaternion(camera.quaternion);

    // 计算主相机到模型中心的实际距离
    const currentDistance = camera.position.distanceTo(areaCenter);

    // 如果是首次加载，记录初始距离
    if (initialDistance.current === null) {
      initialDistance.current = currentDistance;
    }

    const scale = currentDistance / initialDistance.current;
    // 计算缩放比例
    const distanceScale = Math.min(scale, 1);

    // 根据缩放比例计算副相机的实际距离
    const scaledDistance = defaultDistance * distanceScale;

    // 计算从模型中心沿相机方向反向延伸距离的位置，并添加向下偏移
    // 计算摄像头的右方向向量（相对于摄像头视角）
    const cameraRight = new Vector3(1, 0, 0);
    cameraRight.applyQuaternion(camera.quaternion);

    // 计算摄像头向右平移的距离，使模型居于左半边
    const rightOffsetDistance = areaSize.x / 2 + 2;

    const newPosition = areaCenter
      .clone()
      .sub(cameraDirection.multiplyScalar(scaledDistance))
      .add(cameraRight.multiplyScalar(selectedId ? rightOffsetDistance : 0)) // 向右平移
      .add(new Vector3(0, -1 * distanceScale, 0));

    // 更新副相机位置和朝向
    cameraRef.current.position.copy(newPosition);

    // if (
    //   controls &&
    //   controls instanceof CameraControlsImpl &&
    //   selectedAreaProps.center
    // ) {
    //   controls.setTarget(
    //     selectedAreaProps.center.x,
    //     selectedAreaProps.center.y,
    //     selectedAreaProps.center.z
    //   );
    // }

    cameraRef.current.quaternion.copy(camera.quaternion);

    // 确保模型的朝向与主场景中的模型一致
    if (groupRef.current) {
      groupRef.current.quaternion.copy(scene.quaternion);
    }

    if (showAnimation) {
      // 为发光区域添加脉冲动画效果
      if (glowingArea) {
        const time = Date.now() * 0.001; // 获取当前时间（秒）
        const pulseIntensity = 0.2 + 0.2 * Math.sin(time * 2); // 脉冲强度在0.4-0.7之间变化

        // 同步主场景的缩放
        // if (!glowingArea.scale.equals(scene.scale)) {
        //   glowingArea.scale.copy(scene.scale);
        // }

        glowingArea.traverse((child: Object3D) => {
          if (
            child instanceof Mesh &&
            child.material instanceof MeshStandardMaterial
          ) {
            child.material.emissiveIntensity = pulseIntensity;
          }
        });
      }
    }

    // 同步发光模型的缩放
    // if (glowingModel && selectedModel) {
    //   const expectedScale = selectedModel.scale.clone().multiply(scene.scale);
    //   if (!glowingModel.scale.equals(expectedScale)) {
    //     glowingModel.scale.copy(expectedScale);
    //   }
    // }
  });

  handleClickRef.current = useCallback(
    (e: ThreeEvent<globalThis.MouseEvent>) => {
      e.stopPropagation();
      onClick?.(e, true);
    },
    [onClick]
  );

  const clearSelectedModel = useCallback(() => {
    setSelectedModel(null);
    setSelectedAreaModel(null);
    globalData.app?.onRouletteClose?.();
    setSelectedId(null);
  }, [setSelectedAreaModel, setSelectedId, setSelectedModel]);

  const calCameraPosition = useCallback(async () => {
    if (selectedAreaProps.size && selectedAreaProps.center) {
      // 获取当前相机位置
      const cameraPosition = camera.position.clone();
      // 计算摄像头向右平移的距离，使模型居于左半边
      const modelRightSide =
        selectedAreaProps.center.x + selectedAreaProps.size.x / 2;
      if (selectedId) {
        // if (!cameraPositionRef.current && cameraPosition.x < modelRightSide) {
        const rightOffsetDistance = modelRightSide - cameraPosition.x;
        cameraPositionRef.current = (
          controls as CameraControlsImpl
        ).getPosition(new Vector3());

        await (controls as CameraControlsImpl).truck(
          rightOffsetDistance,
          0,
          true
        );
        // }
      } else if (cameraPositionRef.current) {
        // const rightOffsetDistance =
        //   modelRightSide - cameraPositionRef.current.x;
        // cameraPositionRef.current = null;
        // await (controls as CameraControlsImpl).truck(
        //   -rightOffsetDistance,
        //   0,
        //   true
        // );
      }
    }
  }, [
    camera.position,
    controls,
    selectedAreaProps.center,
    selectedAreaProps.size,
    selectedId,
  ]);

  useEffect(() => {
    calCameraPosition();
    console.log('clearSelectedModel: ', clearSelectedModel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (currentSelectedArea && hudModel) {
      const modelListNeesHidden: Object3D[] = [];
      const modelListNeedShow: Object3D[] = [];
      hudModel.traverse(child => {
        if (
          globalData.app?.getModelEventAble?.(child) ||
          child.name === '110kV-GIS_103_CB_CB'
        ) {
          modelListNeesHidden.push(child);
        }
        if (child.name.toUpperCase().includes('INNER')) {
          modelListNeedShow.push(child);
        }
      });

      globalThis.setTimeout(() => {
        const toHidden = (child: Object3D) => {
          if (child && child instanceof Mesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = 0.1;
            child.material.needsUpdate = true;
          }
        };

        modelListNeesHidden.map(child => {
          if (child) {
            if (child instanceof Mesh && child.material) {
              toHidden(child);
            } else if (child instanceof Group) {
              child.traverse(item => {
                toHidden(item);
              });
            }
          }
        });

        const toChangeColor = (child: Object3D) => {
          if (child && child instanceof Mesh && child.material) {
            const sourceColor = child.material.color.clone();
            if (!child.material.originalColor) {
              child.material.originalColor = sourceColor;
            }

            child.material.color.set('#FF0000');
            child.material.needsUpdate = true;
          }
        };

        modelListNeedShow.map(child => {
          if (child) {
            if (child instanceof Mesh && child.material) {
              toChangeColor(child);
            } else if (child instanceof Group) {
              child.traverse(item => {
                toChangeColor(item);
              });
            }
          }
        });
      }, 15000);
    }
  }, [currentSelectedArea, hudModel]);

  // 渲染 HUD 内容
  const renderHudContent = useMemo(() => {
    if (!currentSelectedArea) return null;

    console.log('currentSelectedModel', currentSelectedModel);

    return (
      <group
        ref={ref => {
          groupRef.current = ref;
          setHudModel(ref);
        }}
      >
        <Clone
          deep
          onClick={e => {
            handleClickRef.current?.(e);
          }}
          // inject={(obj) => {
          //     if (obj instanceof Mesh) {
          //       const newGeometry = obj.geometry.clone().toNonIndexed();
          //       const newMaterial = obj.material.clone();
          //       return (
          //         <mesh geometry={newGeometry} material={newMaterial}>
          //           <Wireframe fillMix={0.1} fillOpacity={0} fill="#2DB8B5" simplify />
          //         </mesh>
          //       );
          //     }
          // }}
          object={currentSelectedArea}
          castShadow={false}
          receiveShadow={false}
        />

        {/* {currentSelectedModel && (
          <Html
            scale={0.5} // 缩小到原来的 30%
            zIndexRange={[50, 0]}
            rotation={[0, 0, 0]}
            prepend
            position={modelCenter as [number, number, number]}
            transform
            occlude
            center
          >
            <Roulette />
          </Html>
        )} */}
      </group>
    );
  }, [currentSelectedArea, currentSelectedModel, setHudModel]);

  return (
    <>
      {currentSelectedArea && (
        <>
          {/* {currentSelectedArea && (
            <Html
              position={areaTopPosition as [number, number, number]}
              style={{
                cursor: "pointer",
                transform: "translate(-50%, -100%)",
                top: 20,
              }}
              zIndexRange={[10, 0]}
              // center
              prepend
              // occlude
            >
              <img
                src={`${globalData.app.publicPath}/images/arrowDown.svg`}
                alt="arrow"
                style={{
                  width: "60px",
                  height: "60px",
                  filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))",
                }}
                onClick={clearSelectedModel}
              />
            </Html>
          )} */}
          <Hud renderPriority={1}>
            <PerspectiveCamera
              ref={cameraRef}
              makeDefault
              // position={[0, -2, -12]}
              // position={camera.position.toArray()} // 使用当前相机位置
              // quaternion={camera.quaternion}
            />
            {/* {cameraRef.current && (
              <CameraControls
                camera={cameraRef.current}
                // target={modelCenter as [number, number, number]}
                minDistance={1}
                maxDistance={100}
                mouseButtons={{
                  left: ACTION.NONE, // 左键平移
                  middle: ACTION.NONE, // 中键缩放
                  right: ACTION.NONE, // 右键旋转
                  wheel: ACTION.NONE, // 滚轮缩放
                }}
                touches={{
                  one: ACTION.TOUCH_ROTATE,
                  two: ACTION.TOUCH_DOLLY_TRUCK,
                  three: ACTION.TOUCH_DOLLY_TRUCK,
                }}
              />
            )} */}
            <EnvirComponent
              ambientLightIntensity={ambientLightIntensity}
              enableShadows={enableShadows}
              directionalLightPosition={directionalLightPosition}
              directionalLightIntensity={directionalLightIntensity}
              hdrUrl={hdrUrl}
            />
            {renderHudContent}
          </Hud>
          {/* 显示区域包围盒 */}
          {showBox && (
            <BoundingBox
              target={selectedAreaModel || undefined}
              fillColor='rgba(11, 228, 222, 0.25)'
              borderColor='rgba(11, 228, 222, 1)'
              fillOpacity={0.25}
              borderOpacity={1}
              showBox={true}
            />
          )}
          {/* {glowingModelRef.current && (
            <primitive object={glowingModelRef.current} />
          )}
          {glowingAreaRef.current && (
            <primitive object={glowingAreaRef.current} />
          )} */}
        </>
      )}
    </>
  );
};

export default HubModel;
