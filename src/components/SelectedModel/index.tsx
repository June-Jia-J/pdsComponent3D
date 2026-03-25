import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { selectedModelAtom } from '@atoms/selectModel';
import { Box3, Object3D, Object3DEventMap, Vector3 } from 'three';
import { useThree } from '@react-three/fiber';

export const SelectedModel: React.FC = () => {
  const selectedModel = useAtomValue(selectedModelAtom);
  const [enlargedMesh, setEnlargedMesh] =
    useState<Object3D<Object3DEventMap> | null>(null);
  const [, setModelSize] = useState<[number, number, number]>([0, 0, 0]);
  const [modelPosition, setModelPosition] = useState<Vector3>(new Vector3());

  const { scene } = useThree();

  useEffect(() => {
    if (!selectedModel) {
      setEnlargedMesh(null);
      setModelSize([0, 0, 0]);
      setModelPosition(new Vector3());
      return;
    }

    scene.updateMatrixWorld();

    // 克隆放大模型
    const enlargedClone = selectedModel.clone();
    setEnlargedMesh(enlargedClone);

    // 计算模型的包围盒和位置
    const boundingBox = new Box3().setFromObject(selectedModel);
    const height = boundingBox.max.y - boundingBox.min.y;
    const width = boundingBox.max.x - boundingBox.min.x;
    const depth = boundingBox.max.z - boundingBox.min.z;
    setModelSize([width, height, depth]);

    // 获取选中模型的世界坐标位置
    const worldPosition = new Vector3();
    const position = enlargedClone.getWorldPosition(worldPosition);
    // const oldPosition = selectedModel.getWorldPosition(worldPosition);
    // console.log("position: ", oldPosition, position, selectedModel.position, enlargedClone.position);
    setModelPosition(position);
    enlargedClone.position.copy({ x: 0, y: 0, z: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModel]);

  return (
    <>
      {selectedModel && enlargedMesh && (
        <primitive
          object={enlargedMesh}
          scale={2}
          // position={[0, 0, 0]}
          // position={[
          //   modelPosition.x - modelSize[0] * 6,
          //   modelPosition.y + modelSize[1] * 4,
          //   modelPosition.z - modelSize[2],
          // ]}
          position={[modelPosition.x, modelPosition.y, modelPosition.z]}
        />
      )}
    </>
  );
};

export default SelectedModel;
