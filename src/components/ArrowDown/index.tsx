import { useCallback, useEffect, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Html } from '@react-three/drei';
import { selectedAreaModelAtom, selectedModelAtom } from '@/atoms/selectModel';
import globalData from '@/store/globalData';
import { formateSelectedIdAtom } from '@/atoms/rouletteModel';
import { Box3, Vector3 } from 'three';

const ArrowDown = () => {
  // const selectedAreaModelProps = useAtomValue(selectedAreaModelPropsAtom);
  const [, setSelectedModel] = useAtom(selectedModelAtom);
  const [selectedAreaModel, setSelectedAreaModel] = useAtom(
    selectedAreaModelAtom
  );
  const setSelectedId = useSetAtom(formateSelectedIdAtom);
  const [areaTopPosition, setAreaTopPosition] = useState<number[]>([0, 0, 0]);

  const clearSelectedModel = useCallback(() => {
    setSelectedModel(null);
    setSelectedAreaModel(null);
    setSelectedId(null);
    globalData.app?.onRouletteClose?.();
  }, [setSelectedAreaModel, setSelectedId, setSelectedModel]);

  useEffect(() => {
    if (selectedAreaModel) {
      const sourceAreaModel =
        globalData.app?.objectsNameDict[selectedAreaModel.name];
      const box = new Box3().setFromObject(sourceAreaModel);
      const center = box.getCenter(new Vector3());
      const size = box.getSize(new Vector3());
      // 计算区域顶部位置（中心点 + 高度/2 + 偏移）
      const topPosition = [
        center.x,
        center.y + size.y / 2 + 0.3, // 在顶部上方0.3米
        center.z,
      ];

      if (
        areaTopPosition[0] !== topPosition[0] ||
        areaTopPosition[1] !== topPosition[1] ||
        areaTopPosition[2] !== topPosition[2]
      ) {
        setAreaTopPosition(topPosition);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAreaModel]);

  return (
    <Html
      position={areaTopPosition as [number, number, number]}
      style={{
        cursor: 'pointer',
        transform: 'translate(-50%, -100%)',
        top: 20,
      }}
      zIndexRange={[10, 0]}
      center
      prepend
      // occlude
    >
      <img
        src={`${globalData.app.publicPath}/images/arrowDown.svg`}
        alt='arrow'
        style={{
          width: '60px',
          height: '60px',
          filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
        }}
        onClick={clearSelectedModel}
      />
    </Html>
  );
};

export default ArrowDown;
