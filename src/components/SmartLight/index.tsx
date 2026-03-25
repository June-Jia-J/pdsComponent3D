import { useRef, FC, useState, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { SpotLight } from '@react-three/drei';
import * as THREE from 'three';
import { folder, useControls } from 'leva';
import { useNearestModel } from '@hooks/useNearestModel';

interface SmartLightingProps {
  mode?: 'camera' | 'model';
}

export const SmartLighting: FC<SmartLightingProps> = ({
  mode: externalMode = 'camera',
}) => {
  const [mainLightPosition, setMainLightPosition] = useState(
    new THREE.Vector3(5, 5, 5)
  );
  const [auxLightPosition, setAuxLightPosition] = useState(
    new THREE.Vector3(-5, -5, -5)
  );

  const { nearestModel } = useNearestModel();

  const [targetPoint, setTargetPoint] = useState<THREE.Vector3>(null!);
  const [currentDistance, setCurrentDistance] = useState(0);
  // const [calculatedMainLightAngle, setCalculatedMainLightAngle] = useState(0.5);

  const [prevParams, set] = useControls('相机', () => {
    return {
      cameraPosition: {
        value: 'x: 0, y: 0, z: 0',
        disabled: true,
        label: '相机位置',
      },
      nearestModelName: {
        value: '',
        disabled: true,
        label: '最近模型',
      },
      distance: {
        value: '0',
        label: '距离(米)',
        disabled: true,
      },
      boundingBoxCenter: {
        value: 'x: 0, y: 0, z: 0',
        disabled: true,
        label: '包围盒中心',
      },
    };
  });

  // Leva 控制面板配置
  const {
    smartLightEnableHelpers: enableHelpers,
    smartLightEnableBoundingBox: enableBoundingBox,
    smartLightMode: mode,
    cameraOffset,
    heightOffset,
    mainLightIntensity,
    mainLightAngle,
    mainLightPenumbra,
    mainLightColor,
    auxLightAngle,
    auxLightPenumbra,
    auxLightColor,
  } = useControls('智能灯光', {
    smartLightEnableHelpers: {
      value: false,
      label: '启用辅助线',
    },
    smartLightEnableBoundingBox: {
      value: false,
      label: '启用包围盒',
    },
    smartLightMode: {
      value: externalMode,
      options: {
        跟随相机: 'camera',
        跟随模型: 'model',
      },
      label: '智能灯光模式',
    },
    基础设置: folder({
      cameraOffset: {
        value: 0,
        min: 0,
        max: 20,
        step: 0.5,
        label: '相机偏移距离',
      },
      heightOffset: {
        value: 0,
        min: 0,
        max: 15,
        step: 0.5,
        label: '高度偏移',
      },
    }),
    主光源: folder({
      mainLightIntensity: {
        value: 10,
        min: 1,
        max: 1000,
        step: 1,
        label: '强度系数',
      },
      mainLightAngle: {
        value: 0.8,
        min: 0.1,
        max: Math.PI / 2,
        step: 0.1,
        label: '光照角度',
      },
      mainLightPenumbra: {
        value: 1,
        min: 0,
        max: 1,
        step: 0.1,
        label: '边缘柔和度',
      },
      mainLightDecay: {
        value: 0.8,
        min: 0.5,
        max: 2,
        step: 0.1,
        label: '衰减系数',
      },
      mainLightColor: { value: '#ffffff', label: '光源颜色' },
    }),
    辅助光源: folder({
      auxLightAngle: {
        value: 0.8,
        min: 0.1,
        max: Math.PI / 2,
        step: 0.1,
        label: '光照角度',
      },
      auxLightPenumbra: {
        value: 1,
        min: 0,
        max: 1,
        step: 0.1,
        label: '边缘柔和度',
      },
      // auxLightDecay: {
      //   value: 1,
      //   min: 0.5,
      //   max: 2,
      //   step: 0.1,
      //   label: "衰减系数",
      // },
      auxLightColor: { value: '#ffeedd', label: '光源颜色' },
    }),
  });

  const mainLightRef = useRef<THREE.SpotLight>(null);
  const auxLightRef = useRef<THREE.SpotLight>(null);
  const mainTargetRef = useRef<THREE.Object3D>(null!);
  const boundingBoxRef = useRef<THREE.Box3Helper>(null);
  const cameraDirection = useRef(new THREE.Vector3());
  const cameraRight = useRef(new THREE.Vector3());
  const cameraUp = useRef(new THREE.Vector3());

  const { camera, scene } = useThree();

  // 根据距离计算光照强度
  const calculateLightIntensity = useMemo(() => {
    const baseIntensity = mainLightIntensity;
    const minDistance = 2; // 最小距离
    const maxDistance = 20; // 最大距离

    // 如果距离小于最小距离，返回最小强度（基础强度的20%）
    if (currentDistance < minDistance) {
      return baseIntensity * 0.2;
    }

    // 如果距离大于最大距离，返回最大强度
    if (currentDistance > maxDistance) {
      return baseIntensity;
    }

    // 在最小和最大距离之间，线性插值计算强度
    const t = (currentDistance - minDistance) / (maxDistance - minDistance);
    return baseIntensity * (0.4 + t * 0.6); // 从20%到100%线性变化
    // return baseIntensity * t * mainLightDecay;
  }, [currentDistance, mainLightIntensity]);

  useFrame(() => {
    const param = {
      cameraPosition: `x: ${camera.position.x.toFixed(
        2
      )}, y: ${camera.position.y.toFixed(2)}, z: ${camera.position.z.toFixed(
        2
      )}`,
      nearestModelName: '',
      distance: '0',
      boundingBoxCenter: 'x: 0, y: 0, z: 0',
    };
    if (nearestModel) {
      param.nearestModelName = nearestModel.name;

      // 计算包围盒中心
      const boundingBox = new THREE.Box3().setFromObject(nearestModel);
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);
      param.boundingBoxCenter = `x: ${center.x.toFixed(
        2
      )}, y: ${center.y.toFixed(2)}, z: ${center.z.toFixed(2)}`;

      const rayDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(
        camera.quaternion
      );
      const raycaster = new THREE.Raycaster(camera.position, rayDirection);
      const intersects = raycaster.intersectObject(nearestModel, true);

      if (intersects.length > 0) {
        param.distance = intersects[0].distance.toFixed(2);
        setCurrentDistance(intersects[0].distance);
      }
    }

    if (JSON.stringify(prevParams) !== JSON.stringify(param)) {
      set(param);
    }
  });

  // 计算包围盒距离相机最近的面的中心点
  const calculateNearestFaceCenter = (
    boundingBox: THREE.Box3,
    cameraPos: THREE.Vector3
  ) => {
    const min = boundingBox.min;
    const max = boundingBox.max;

    // 创建包围盒的6个面的中心点
    const faceCenters = [
      new THREE.Vector3((min.x + max.x) / 2, (min.y + max.y) / 2, max.z), // 前面
      new THREE.Vector3((min.x + max.x) / 2, (min.y + max.y) / 2, min.z), // 后面
      new THREE.Vector3(max.x, (min.y + max.y) / 2, (min.z + max.z) / 2), // 右面
      new THREE.Vector3(min.x, (min.y + max.y) / 2, (min.z + max.z) / 2), // 左面
      new THREE.Vector3((min.x + max.x) / 2, max.y, (min.z + max.z) / 2), // 上面
      new THREE.Vector3((min.x + max.x) / 2, min.y, (min.z + max.z) / 2), // 下面
    ];

    // 找到距离相机最近的面的中心点
    let nearestCenter = faceCenters[0];
    let minDistance = nearestCenter.distanceTo(cameraPos);

    for (let i = 1; i < faceCenters.length; i++) {
      const distance = faceCenters[i].distanceTo(cameraPos);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCenter = faceCenters[i];
      }
    }

    return nearestCenter;
  };

  // 初始化函数
  const updateLightPositions = () => {
    // 重用向量对象
    cameraDirection.current.set(0, 0, -1).applyQuaternion(camera.quaternion);
    cameraRight.current.set(1, 0, 0).applyQuaternion(camera.quaternion);
    cameraUp.current.set(0, 1, 0).applyQuaternion(camera.quaternion);

    if (mode === 'camera') {
      if (nearestModel) {
        // 计算包围盒
        const boundingBox = new THREE.Box3().setFromObject(nearestModel);
        // 获取距离相机最近的面的中心点
        const targetPoint = calculateNearestFaceCenter(
          boundingBox,
          camera.position
        );
        setTargetPoint(targetPoint);

        // // 计算相机到目标点的方向向量
        // const toTarget = targetPoint.clone().sub(camera.position).normalize();
        // // 计算相机前向向量
        // const cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        // // 计算角度（弧度）
        // const angle = cameraForward.angleTo(toTarget);
        // setCalculatedMainLightAngle(angle);

        // 计算从目标点到相机的方向
        // const toCameraDir = camera.position
        //   .clone()
        //   .sub(targetPoint)
        //   .normalize();

        // 计算光源的基准距离（根据包围盒大小调整）
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        // const lightBaseDistance = Math.max(size.x, size.y, size.z) * 0.8;

        // 计算相机后方1米的基准点
        const basePoint = camera.position
          .clone()
          .add(cameraDirection.current.clone().multiplyScalar(2));

        // 计算主光源位置（右上）
        const mainLightOffset = new THREE.Vector3().addVectors(
          cameraRight.current.clone().multiplyScalar(-cameraOffset),
          cameraUp.current.clone().multiplyScalar(heightOffset)
        );
        const newMainLightPos = basePoint.clone().add(mainLightOffset);

        // 计算辅助光源位置（左下）
        const auxLightOffset = new THREE.Vector3().addVectors(
          cameraRight.current.clone().multiplyScalar(cameraOffset),
          cameraUp.current.clone().multiplyScalar(-heightOffset)
        );
        const newAuxLightPos = basePoint.clone().add(auxLightOffset);

        // 更新光源位置
        setMainLightPosition(newMainLightPos);
        setAuxLightPosition(newAuxLightPos);
      } else {
        // 如果没有模型,返回摄像机正前方最远处的点
        const farDistance = camera.far || 1000;
        const targetPoint = camera.position
          .clone()
          .add(cameraDirection.current.multiplyScalar(farDistance));
        setTargetPoint(targetPoint);
      }
    } else if (mode === 'model' && nearestModel) {
      // 模型聚焦模式下的光源位置计算
      const boundingBox = new THREE.Box3().setFromObject(nearestModel);
      const targetPoint = calculateNearestFaceCenter(
        boundingBox,
        camera.position
      );
      setTargetPoint(targetPoint);

      // 计算模型包围盒的大小
      const modelSize = new THREE.Vector3();
      boundingBox.getSize(modelSize);
      const maxDimension = Math.max(modelSize.x, modelSize.y, modelSize.z);

      // 根据模型大小调整光源距离
      const lightDistance = maxDimension * 1.5;

      // 计算新的主光源位置（从目标点的右上方照射）
      const newMainLightPos = targetPoint
        .clone()
        .add(new THREE.Vector3(lightDistance, lightDistance, lightDistance));

      // 计算新的辅助光源位置（从目标点的左下方照射）
      const newAuxLightPos = targetPoint
        .clone()
        .add(
          new THREE.Vector3(-lightDistance, -lightDistance / 2, -lightDistance)
        );

      // 更新光源位置状态
      setMainLightPosition(newMainLightPos);
      setAuxLightPosition(newAuxLightPos);

      // 更新实际光源位置
      // mainLightRef.current.position.copy(newMainLightPos);
      // auxLightRef.current.position.copy(newAuxLightPos);

      // 更新光源目标点为模型中心
      // if (mainTargetRef.current && auxTargetRef.current) {
      //   mainTargetRef.current.position.copy(modelPosition);
      // }
    }

    scene.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
  };

  // 使用 useFrame 进行每帧更新
  useFrame(updateLightPositions);

  const targetPosition = useMemo<[number, number, number]>(() => {
    return targetPoint
      ? [targetPoint.x, targetPoint.y, targetPoint.z]
      : [0, 0, 0];
  }, [targetPoint]);

  return (
    <>
      <object3D ref={mainTargetRef} position={targetPosition} />

      <SpotLight
        ref={mainLightRef}
        color={mainLightColor}
        intensity={calculateLightIntensity}
        position={[
          mainLightPosition.x,
          mainLightPosition.y,
          mainLightPosition.z,
        ]}
        angle={mainLightAngle}
        // angle={calculatedMainLightAngle}
        penumbra={mainLightPenumbra}
        // decay={mainLightDecay}
        distance={500}
        castShadow={false}
        receiveShadow={false}
        target={mainTargetRef.current || undefined}
        // shadow-bias={-0.0001}
        // shadow-mapSize={[512, 512]}
      />
      <SpotLight
        ref={auxLightRef}
        color={auxLightColor}
        intensity={calculateLightIntensity / 2}
        position={[auxLightPosition.x, auxLightPosition.y, auxLightPosition.z]}
        angle={auxLightAngle}
        // angle={calculatedMainLightAngle}
        penumbra={auxLightPenumbra}
        // decay={auxLightDecay}
        distance={500}
        castShadow={false}
        receiveShadow={false}
        target={mainTargetRef.current || undefined}
      />
      {/* 辅助线 */}
      {enableHelpers && (
        <>
          {/* 光源辅助线 */}
          {mainLightRef.current && auxLightRef.current && (
            <>
              <primitive
                object={new THREE.SpotLightHelper(mainLightRef.current)}
              >
                <object3D
                  onBeforeRender={() => {
                    if (mainLightRef.current) {
                      const helper = mainLightRef.current.parent?.children.find(
                        child => child instanceof THREE.SpotLightHelper
                      ) as THREE.SpotLightHelper;
                      if (helper) helper.update();
                    }
                  }}
                />
              </primitive>
              <primitive
                object={new THREE.SpotLightHelper(auxLightRef.current)}
              >
                <object3D
                  onBeforeRender={() => {
                    if (auxLightRef.current) {
                      const helper = auxLightRef.current.parent?.children.find(
                        child => child instanceof THREE.SpotLightHelper
                      ) as THREE.SpotLightHelper;
                      if (helper) helper.update();
                    }
                  }}
                />
              </primitive>
            </>
          )}
        </>
      )}
      {/* 包围盒辅助线 */}
      {nearestModel && enableBoundingBox && (
        <>
          {/* 包围盒 */}
          <primitive
            ref={boundingBoxRef}
            object={
              new THREE.Box3Helper(
                new THREE.Box3().setFromObject(nearestModel),
                new THREE.Color(0x00ff00)
              )
            }
          />
        </>
      )}
    </>
  );
};
