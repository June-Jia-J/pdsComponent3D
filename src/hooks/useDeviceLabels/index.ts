import { useState, useCallback, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { LabelTextItem, DeviceLabelConfig } from '../../types';

export interface UseDeviceLabelsOptions {
  /** 默认偏移量 */
  defaultOffset?: [number, number, number];
  /** 是否自动计算位置 */
  autoPosition?: boolean;
  /** 位置计算模式 */
  positionMode?:
    | 'bbox-center'
    | 'bbox-top'
    | 'world-position'
    | 'legacy'
    | 'robust-bbox';
}

export interface DeviceLabelInstance extends DeviceLabelConfig {
  /** 计算后的最终位置 */
  finalPosition: [number, number, number];
}

export const useDeviceLabels = (
  scene?: THREE.Object3D,
  options: UseDeviceLabelsOptions = {}
) => {
  const {
    defaultOffset = [0, 1, 0],
    autoPosition = true,
    positionMode = 'bbox-top', // 默认使用包围盒顶部模式
  } = options;

  const [labels, setLabels] = useState<Map<string, DeviceLabelConfig>>(
    new Map()
  );
  const labelsRef = useRef<Map<string, DeviceLabelConfig>>(new Map());

  // 改进的位置计算函数 - 基于包围盒中心点
  const calculatePosition = useCallback(
    (
      targetModelName: string,
      offset: [number, number, number] = defaultOffset
    ): [number, number, number] | null => {
      // 版本验证 - 确认最新代码已部署
      // console.log('🚀 位置计算函数版本: v2024.1.1 - robust-bbox支持');

      if (!scene || !autoPosition) return null;

      let targetModel: THREE.Object3D | null = null;

      // 添加模型查找调试信息
      const availableModels: string[] = [];
      scene.traverse(child => {
        if (child.name) {
          availableModels.push(child.name);
        }
        if (child.name === targetModelName) {
          targetModel = child;
        }
      });

      // console.log(`🔍 查找模型 "${targetModelName}":`, {
      //   found: !!targetModel,
      //   availableModels: availableModels.filter(name => name.trim() !== ''), // 过滤空名称
      //   totalModels: availableModels.length
      // });

      if (!targetModel) {
        // console.warn(`Target model "${targetModelName}" not found`);
        // console.log('💡 可用的模型名称:', availableModels.filter(name => name.trim() !== '').slice(0, 20)); // 显示前20个
        return null;
      }

      // 确保变换矩阵是最新的
      (targetModel as THREE.Object3D).updateMatrixWorld(true);

      // 计算模型在世界空间中的包围盒
      const box = new THREE.Box3().setFromObject(targetModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // 根据不同模式计算位置
      switch (positionMode) {
        case 'bbox-center':
          // 基于包围盒中心点 + 偏移
          return [
            center.x + offset[0],
            center.y + offset[1],
            center.z + offset[2],
          ];

        case 'bbox-top':
          // 基于包围盒顶部 + 偏移（原有逻辑的改进版）
          return [
            center.x + offset[0],
            box.max.y + offset[1],
            center.z + offset[2],
          ];

        case 'world-position': {
          // 基于模型的世界位置
          const worldPosition = new THREE.Vector3();
          (targetModel as THREE.Object3D).getWorldPosition(worldPosition);
          return [
            worldPosition.x + offset[0],
            worldPosition.y + size.y / 2 + offset[1], // 模型高度的一半
            worldPosition.z + offset[2],
          ];
        }

        case 'robust-bbox': {
          // 稳定的包围盒计算 - 处理坐标系差异
          (targetModel as THREE.Object3D).updateMatrixWorld(true);

          // 直接使用setFromObject，这是最可靠的方法
          const worldBox = new THREE.Box3().setFromObject(
            targetModel as THREE.Object3D
          );

          // 验证包围盒的有效性
          if (worldBox.isEmpty()) {
            // console.warn(`⚠️ 模型 ${targetModelName} 的包围盒为空`);
            return null;
          }

          const center = worldBox.getCenter(new THREE.Vector3());
          const size = worldBox.getSize(new THREE.Vector3());

          // 获取模型的世界变换信息（用于调试）
          const modelPosition = new THREE.Vector3();
          const modelQuaternion = new THREE.Quaternion();
          const modelScale = new THREE.Vector3();
          (targetModel as THREE.Object3D).matrixWorld.decompose(
            modelPosition,
            modelQuaternion,
            modelScale
          );

          // console.log(`🔧 robust-bbox 调试信息:`, {
          //   modelName: targetModelName,
          //   modelPosition: modelPosition.toArray(),
          //   worldBoxCenter: center.toArray(),
          //   worldBox: {
          //     min: worldBox.min.toArray(),
          //     max: worldBox.max.toArray(),
          //     size: size.toArray()
          //   },
          //   isValid: worldBox.min.x <= worldBox.max.x && worldBox.min.y <= worldBox.max.y && worldBox.min.z <= worldBox.max.z
          // });

          // 额外的调试信息 - 分别输出
          // console.log(`📍 模型 ${targetModelName} 世界位置:`, modelPosition.toArray());
          // console.log(`📦 模型 ${targetModelName} 包围盒中心:`, center.toArray());
          // console.log(`📏 模型 ${targetModelName} 包围盒范围:`, {
          //   min: worldBox.min.toArray(),
          //   max: worldBox.max.toArray(),
          //   size: size.toArray(),
          //   valid: worldBox.min.x <= worldBox.max.x && worldBox.min.y <= worldBox.max.y && worldBox.min.z <= worldBox.max.z
          // });

          // 验证包围盒合理性
          if (
            worldBox.min.x > worldBox.max.x ||
            worldBox.min.y > worldBox.max.y ||
            worldBox.min.z > worldBox.max.z
          ) {
            // console.error(`❌ 模型 ${targetModelName} 包围盒数据异常，使用备用计算方法`);
            // 回退到简单的中心点计算
            return [
              modelPosition.x + offset[0],
              modelPosition.y + size.y / 2 + offset[1],
              modelPosition.z + offset[2],
            ];
          }

          return [
            center.x + offset[0],
            worldBox.max.y + offset[1], // 使用包围盒顶部
            center.z + offset[2],
          ];
        }

        case 'legacy':
        default:
          // 原有的计算方式（保持向后兼容）
          return [
            center.x + offset[0],
            box.max.y + offset[1],
            center.z + offset[2],
          ];
      }
    },
    [scene, defaultOffset, autoPosition, positionMode]
  );

  // 添加标签
  const addLabel = useCallback((config: DeviceLabelConfig) => {
    const newLabels = new Map(labelsRef.current);
    newLabels.set(config.id, config);
    labelsRef.current = newLabels;
    setLabels(newLabels);
  }, []);

  // 批量添加标签
  const addLabels = useCallback((configs: DeviceLabelConfig[]) => {
    // console.log('🔧 useDeviceLabels: 批量添加标签', configs.length, '个');
    const newLabels = new Map(labelsRef.current);
    configs.forEach(config => {
      // console.log('📍 添加标签:', config.id, config.position || 'auto-position');
      newLabels.set(config.id, config);
    });
    labelsRef.current = newLabels;
    setLabels(newLabels);
    // console.log('✅ useDeviceLabels: 标签添加完成，当前总数:', newLabels.size);
  }, []);

  // 更新标签
  const updateLabel = useCallback(
    (id: string, updates: Partial<DeviceLabelConfig>) => {
      const currentLabel = labelsRef.current.get(id);
      if (!currentLabel) {
        // console.warn(`Label "${id}" not found`);
        return;
      }

      const updatedLabel = { ...currentLabel, ...updates };
      const newLabels = new Map(labelsRef.current);
      newLabels.set(id, updatedLabel);
      labelsRef.current = newLabels;
      setLabels(newLabels);
    },
    []
  );

  // 更新标签文字列表
  const updateLabelText = useCallback(
    (id: string, labelList: LabelTextItem[]) => {
      updateLabel(id, { labelList });
    },
    [updateLabel]
  );

  // 删除标签
  const removeLabel = useCallback((id: string) => {
    const newLabels = new Map(labelsRef.current);
    newLabels.delete(id);
    labelsRef.current = newLabels;
    setLabels(newLabels);
  }, []);

  // 清空所有标签
  const clearLabels = useCallback(() => {
    labelsRef.current.clear();
    setLabels(new Map());
  }, []);

  // 显示/隐藏标签
  const setLabelVisible = useCallback(
    (id: string, visible: boolean) => {
      updateLabel(id, { visible });
    },
    [updateLabel]
  );

  // 批量显示/隐藏
  const setLabelsVisible = useCallback((ids: string[], visible: boolean) => {
    const newLabels = new Map(labelsRef.current);
    ids.forEach(id => {
      const label = newLabels.get(id);
      if (label) {
        newLabels.set(id, { ...label, visible });
      }
    });
    labelsRef.current = newLabels;
    setLabels(newLabels);
  }, []);

  // 获取带计算位置的标签实例列表
  const labelInstances = useMemo(() => {
    const instances: DeviceLabelInstance[] = [];

    labels.forEach(label => {
      let finalPosition = label.position;

      // 如果没有手动指定位置且有目标模型，自动计算位置
      if (!finalPosition && label.targetModelName) {
        const calculatedPosition = calculatePosition(
          label.targetModelName,
          label.offset || defaultOffset
        );
        if (calculatedPosition) {
          finalPosition = calculatedPosition;
          // console.log(`📍 计算标签位置 [${positionMode}]:`, label.id, finalPosition);
        }
      }

      // 如果仍然没有位置，使用默认位置
      if (!finalPosition) {
        finalPosition = [0, 0, 0];
        // console.warn(`⚠️ 标签 ${label.id} 使用默认位置 [0,0,0]`);
      }

      instances.push({
        ...label,
        finalPosition,
      });
    });

    return instances;
  }, [labels, calculatePosition, defaultOffset, positionMode]);

  return {
    labels: labelInstances,
    addLabel,
    addLabels,
    updateLabel,
    updateLabelText,
    removeLabel,
    clearLabels,
    setLabelVisible,
    setLabelsVisible,
    labelCount: labels.size,
  };
};
