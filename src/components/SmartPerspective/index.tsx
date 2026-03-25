import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useNearestModel } from '../../hooks/useNearestModel';
import * as THREE from 'three';
import { CameraControls } from '@react-three/drei';
import { useAtomValue } from 'jotai';
import {
  centerDistancetAtom,
  centerPoinAtom,
  selectedAreaModelAtom,
  selectedModelAtom,
} from '@/atoms/selectModel';
import { didMountAtom } from '@/atoms/didMount';
// import { useControls } from "leva";
// import { Autofocus, EffectComposer } from "@react-three/postprocessing";

export const SmartPerspective = ({
  controls,
}: {
  controls: React.RefObject<CameraControls | null>;
}) => {
  const { camera, scene } = useThree();
  const { nearestModel } = useNearestModel();
  const selectedModel = useAtomValue(selectedModelAtom);
  const selectedArea = useAtomValue(selectedAreaModelAtom);
  const didMount = useAtomValue(didMountAtom);
  const centerDistance = useAtomValue(centerDistancetAtom);
  const centerPoint = useAtomValue(centerPoinAtom);
  // const [target, setTarget] = useState<THREE.Vector3 | null>(null);
  const uuidRef = useRef<string | null>(null);

  const notControl = useMemo(() => {
    return (
      !!selectedModel ||
      !!selectedArea ||
      !didMount ||
      !centerDistance ||
      !centerPoint
    );
  }, [centerDistance, centerPoint, didMount, selectedArea, selectedModel]);

  // 使用 leva 添加动态控制
  // const { moveDistance } = useControls("智能视角", {
  //   moveDistance: {
  //     value: 1,
  //     min: 0.1,
  //     max: 5,
  //     step: 0.1,
  //     label: "前进距离(米)",
  //   },
  // });

  useEffect(() => {
    if (!nearestModel || !controls.current || notControl) {
      uuidRef.current = null;
      return;
    }

    // 超出中心点距离，不执行聚焦
    const currentPosition = controls.current.getPosition(new THREE.Vector3());
    const currentDistance = currentPosition.distanceTo(centerPoint!);
    if (currentDistance >= centerDistance! - 5) return;

    console.log('currentDistance', currentDistance, '智能视角已触发');

    // 检查是否是同一个模型
    if (uuidRef.current === nearestModel.uuid) {
      return;
    }

    uuidRef.current = nearestModel.uuid;

    const rayDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );

    const nearestModelClone = nearestModel.clone();

    const raycaster = new THREE.Raycaster();

    // 创建一个射线来检测模型表面
    raycaster.set(camera.position, rayDirection);

    const intersects = raycaster.intersectObjects(scene.children, true);

    // 计算目标面的中心点（用于相机朝向）
    const targetIntersects = raycaster.intersectObject(nearestModelClone, true);
    if (targetIntersects.length === 0) return;

    const targetIntersection = targetIntersects[0];
    const face = targetIntersection.face as THREE.Face;
    const geometry = (targetIntersection.object as THREE.Mesh).geometry;

    // 计算当前面的中心点
    let faceCenter;
    if (geometry instanceof THREE.BufferGeometry) {
      // 对于 BufferGeometry，我们需要从顶点位置计算面的中心
      const position = geometry.attributes.position;
      const vertex1 = new THREE.Vector3().fromBufferAttribute(position, face.a);
      const vertex2 = new THREE.Vector3().fromBufferAttribute(position, face.b);
      const vertex3 = new THREE.Vector3().fromBufferAttribute(position, face.c);

      faceCenter = new THREE.Vector3()
        .add(vertex1)
        .add(vertex2)
        .add(vertex3)
        .divideScalar(3);

      // 转换到世界坐标系
      faceCenter.applyMatrix4(
        (targetIntersection.object as THREE.Mesh).matrixWorld
      );
    } else {
      // 如果没有找到面，使用交点位置
      faceCenter = targetIntersection.point;
    }

    // // 调试信息
    // console.log("Camera movement:", {
    //   hasObstacle: intersects.length > 0,
    //   obstacleDistance: intersects.length > 0 ? intersects[0].distance : null,
    //   moveDistance,
    //   cameraPosition: camera.position.clone(),
    // });

    if (intersects.length === 0) {
      // 如果前方指定距离内没有物体，则向前移动
      // controls.current.setLookAt(
      //   camera.position.x + moveDistance * rayDirection.x,
      //   camera.position.y + moveDistance * rayDirection.y,
      //   camera.position.z + moveDistance * rayDirection.z,
      //   faceCenter.x,
      //   faceCenter.y,
      //   faceCenter.z,
      //   true
      // );

      // 使用外部传入的 controls 进行相机移动
      controls.current.setTarget(
        faceCenter.x,
        faceCenter.y,
        faceCenter.z,
        true
      );
      // .then(() => {
      //   controls.current?.forward(moveDistance, true);
      // });
    } else {
      // 如果前方有物体，只调整朝向
      // controls.current.setLookAt(
      //   camera.position.x,
      //   camera.position.y,
      //   camera.position.z,
      //   faceCenter.x,
      //   faceCenter.y,
      //   faceCenter.z,
      //   true
      // );

      controls.current.setTarget(
        faceCenter.x,
        faceCenter.y,
        faceCenter.z,
        true
      );
    }

    // setTarget(faceCenter);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearestModel]); // 添加 moveDistance 到依赖数组

  useFrame(() => {
    if (!controls.current || notControl) {
      return;
    }
    // 超出中心点距离，不执行聚焦
    const currentPosition = controls.current.getPosition(new THREE.Vector3());
    const currentDistance = currentPosition.distanceTo(centerPoint!);
    if (currentDistance >= centerDistance! - 5) {
      controls.current.setTarget(
        centerPoint!.x,
        centerPoint!.y,
        centerPoint!.z,
        false
      );
    }
  });

  return (
    <>
      {/* <EffectComposer>
        <Autofocus target={target || undefined} />
      </EffectComposer> */}
    </>
  );
};

export default SmartPerspective;
