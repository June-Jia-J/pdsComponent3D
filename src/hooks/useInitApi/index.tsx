/* eslint-disable no-unused-vars */
import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import globalData, { setApp, setShow } from '@/store/globalData';
import {
  Mesh,
  Object3D,
  Vector3,
  Line,
  Light,
  Points,
  MathUtils,
  Box3,
  MeshBasicMaterial,
  Raycaster,
  Vector2,
} from 'three';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { focusPointModelAtom } from '@/atoms/focusPointModel';
import { formateSelectedIdAtom } from '@/atoms/rouletteModel';
import {
  formateSelectedAreaModelAtom,
  hudModelAtom,
  selectedModelAtom,
} from '@/atoms/selectModel';
import { isModelInFocus } from '@/utils';
import { TcordonConfigItem } from '@/types';
import { cordonConfigAtom, defaultCordonConfig } from '@/atoms/cordonConfig';
import { useFlyToView } from '../useCamera/flyToView';
import { flyingAbleAtom } from '../../atoms/animate';

type TPosition<T extends 'object' | 'array' = 'object'> = T extends 'object'
  ? {
      x: number;
      y: number;
      z: number;
    }
  : [number, number, number];

type TChangeModelColor = (
  key: string,
  type: 'setColor' | 'reSetColor',
  colorValue: string,
  keyType?: 'id' | 'name'
) => void;

type TModelShowHidden = (
  key: string | string[],
  visibleType: 'show' | 'hidden',
  keyType?: 'id' | 'name'
) => void;

type TModelLayer = {
  userDataId: string;
  value: string;
  id: number;
  text: string;
  cls: string;
  children: TModelLayer[];
  spatialInfo: {
    position: Vector3;
    rotation: {
      x: number;
      y: number;
      z: number;
    };
    scale: Vector3;
    up: Vector3;
  };
};

type TGetModelLayerList = (
  object: Object3D,
  list: TModelLayer[],
  result: TModelLayer[],
  filter: string[]
) => void;

type TRemoveObject = (object: Object3D) => void;

type TGetModelBox = (model: Object3D) => {
  size: Vector3;
  center: Vector3;
};

type TSetModelTransparent = (
  modelNames: string | string[],
  transparent?: boolean,
  opacity?: number
) => void;

type TIsModelTransparent = (
  modelNames: string | string[]
) => boolean | { [key: string]: boolean };

type TFlyToView = (
  targetState: {
    position: TPosition<'array'>;
    target: TPosition<'array'>;
  },
  options?: { duration?: number; heightBoost?: number },
  onFinish?: () => void
) => void;

type TGetCurrentViewState = () => {
  position: TPosition<'array'>;
  target: TPosition<'array'>;
};

type TSetSelectedRouletteId = (id: string) => void;

type TClickModelFromName = (name: string, force?: boolean) => void;

type TClickModelFromObj = (obj: Object3D, force?: boolean) => void;

type TChangeCordonConfig = (
  type: 'add' | 'remove' | 'update' | 'show',
  config: TcordonConfigItem[]
) => void;

type TToggleVirModel = (type: boolean) => void;

type TFlyToObject = (
  model: Object3D,
  options?: { duration?: number; mousePoint?: { x: number; y: number } },
  onFinish?: () => void
) => void;

const useInitApi = () => {
  const { camera, scene, controls } = useThree();
  const setPositionRef = useRef<
    (params: { position: TPosition; rotation: TPosition }) => void
  >(() => {});

  const [selectedId, setSelectedId] = useAtom(formateSelectedIdAtom);

  const setFocusPoint = useSetAtom(focusPointModelAtom);

  const [selectedAreaModel, setSelectedAreaModel] = useAtom(
    formateSelectedAreaModelAtom
  );
  const [selectedModel, setSelectedModel] = useAtom(selectedModelAtom);

  const hudModel = useAtomValue(hudModelAtom);

  const { moveCamera } = useFlyToView({
    transitionDuration: 1000,
  });

  const setCordConfigState = useSetAtom(cordonConfigAtom);

  const changeModelColorRef = useRef<TChangeModelColor>(() => {});

  const modelShowHiddenRef = useRef<TModelShowHidden>(() => {});

  const getModelLayerListRef = useRef<TGetModelLayerList>(() => {});

  const removeObjectRef = useRef<TRemoveObject>(() => {});

  const setModelTransparentRef = useRef<TSetModelTransparent>(() => {});

  const flyToViewRef = useRef<TFlyToView>(() => {});

  const flyToObjectRef = useRef<TFlyToObject>(() => {});
  const setFlyingAble = useSetAtom(flyingAbleAtom);

  const setSelectedRouletteIdRef = useRef<TSetSelectedRouletteId>(() => {});

  const clickModelFromObjRef = useRef<TClickModelFromObj>(() => {});

  const clickModelFromNameRef = useRef<TClickModelFromName>(() => {});

  const getCurrentViewStateRef = useRef<TGetCurrentViewState>(() => ({
    position: [0, 0, 0],
    target: [0, 0, 0],
  }));

  const getModelRef = useRef<TGetModelBox>(() => ({
    size: new Vector3(),
    center: new Vector3(),
  }));

  const toggleVirModelRef = useRef<TToggleVirModel>(() => {});

  const isModelTransparentRef = useRef<TIsModelTransparent>(() => false);

  const changeCordonConfigRef = useRef<TChangeCordonConfig>(() => {});

  const clearSelectedModelRef = useRef<() => void>(() => {});

  clearSelectedModelRef.current = useCallback(() => {
    setSelectedModel(null);
    setSelectedAreaModel(null);
    globalData.app?.onRouletteClose?.();
  }, [setSelectedAreaModel, setSelectedModel]);

  changeModelColorRef.current = useCallback<TChangeModelColor>(
    (key, type, colorValue, keyType = 'id') => {
      if (!scene) return;

      let obj =
        keyType === 'id'
          ? globalData.app.objectsIdDict[key]
          : globalData.app.objectsNameDict[key];
      if (obj) {
        // 检查是否匹配目标对象
        const isMatch =
          keyType === 'id' ? obj.id === Number(key) : obj.name === key;

        if (!isMatch) return;

        if (selectedAreaModel && hudModel) {
          hudModel.traverse((child: Object3D) => {
            if (child.name === obj.name) {
              obj = child;
            }
          });
        }

        // 遍历对象及其子对象
        obj.traverse((child: Object3D) => {
          if (child instanceof Mesh && child.material) {
            const isArray = Array.isArray(child.material);
            const materials = isArray ? child.material : [child.material];

            if (type === 'setColor') {
              // 如果还没有克隆材质，则克隆材质避免共用问题
              if (!child.userData._originalMaterialForColor) {
                child.userData._originalMaterialForColor = child.material;
                child.material = materials.map((mat: MeshBasicMaterial) => {
                  const newMat = mat.clone();
                  // 保持重要属性
                  newMat.map = mat.map;
                  newMat.alphaMap = mat.alphaMap;
                  newMat.transparent = mat.transparent;
                  newMat.opacity = mat.opacity;
                  newMat.side = mat.side;
                  return newMat;
                });
                if (!isArray) child.material = child.material[0];
              }

              // 设置新颜色
              const currentMaterials = Array.isArray(child.material)
                ? child.material
                : [child.material];
              currentMaterials.forEach(mat => {
                if (mat.color) {
                  mat.color.set(colorValue);
                  mat.needsUpdate = true;
                }
              });
            } else {
              // 恢复原始材质
              if (child.userData._originalMaterialForColor) {
                // 释放克隆的材质
                const currentMaterials = Array.isArray(child.material)
                  ? child.material
                  : [child.material];
                currentMaterials.forEach(mat => {
                  if (mat && mat.dispose) mat.dispose();
                });

                // 恢复原始材质
                child.material = child.userData._originalMaterialForColor;
                delete child.userData._originalMaterialForColor;
              }
            }
          }
        });
      }
    },
    [hudModel, scene, selectedAreaModel]
  );

  setPositionRef.current = useCallback(
    (params: { position: TPosition; rotation: TPosition }) => {
      if (camera) {
        const position = params.position ? params.position : undefined;
        const rotation = params.rotation ? params.rotation : undefined;
        if (position) {
          camera.position.set(position.x, position.y, position.z);
        }
        if (rotation) {
          camera.rotation.set(rotation.x, rotation.y, rotation.z);
        }
      }
    },
    [camera]
  );

  modelShowHiddenRef.current = useCallback<TModelShowHidden>(
    (key, visibleType, keyType = 'id') => {
      if (scene) {
        const keys = Array.isArray(key) ? key : [key];
        console.log('modelShowHiddenRef keys: ', keys);

        const keyList = keys.reduce<Set<string>>((acc, key) => {
          if (key.endsWith('*') && keyType === 'name') {
            const nameWithoutStar = key.slice(0, -1);
            const models = Object.keys(globalData.app.objectsNameDict).filter(
              key => key.startsWith(nameWithoutStar)
            );
            models.forEach(model => acc.add(model));
          } else {
            acc.add(key);
          }
          return acc;
        }, new Set());

        Array.from(keyList).map(key => {
          const model =
            keyType === 'id'
              ? globalData.app.objectsIdDict[key]
              : globalData.app.objectsNameDict[key];
          if (model) {
            if (visibleType === 'show') {
              model.visible = true;
            } else {
              model.visible = false;
            }
          }
        });
      }
    },
    [scene]
  );

  getModelLayerListRef.current = useCallback<TGetModelLayerList>(
    (obj, list, result, filter) => {
      let cls = null;
      if (obj === scene) {
        cls = 'Scene';
      } else if (obj instanceof Line) {
        cls = 'Line';
      } else if (obj instanceof Light) {
        cls = 'Light';
      } else if (obj instanceof Points) {
        cls = 'Points';
      } else {
        cls = 'Default';
      }
      const euler = obj.rotation;
      const data = {
        userDataId: obj.userData.ID + '_' + result.length,
        value: obj.uuid,
        id: obj.id,
        text: obj.name,
        cls: cls,
        children: [],
        spatialInfo: {
          position: obj.position,
          rotation: {
            x: MathUtils.radToDeg(euler.x),
            y: MathUtils.radToDeg(euler.y),
            z: MathUtils.radToDeg(euler.z),
          },
          scale: obj.scale,
          up: obj.up,
        },
      };
      if (filter) {
        if (filter.some(v => obj.name.includes(v))) {
          result.push(data);
        }
      } else {
        result.push(data);
      }
      list.push(data);
      if (Array.isArray(obj.children)) {
        obj.children.forEach(n => {
          getModelLayerListRef.current(n, data.children, result, filter);
        });
      }
      return list;
    },
    [scene]
  );

  removeObjectRef.current = useCallback<TRemoveObject>(object => {
    // 增加健壮性判断
    if (!object || !object.parent) {
      return;
    }
    // 移除物体
    if (object.parent === null) {
      // 避免删除相机或场景
      return;
    }

    object.parent.remove(object);
  }, []);

  getModelRef.current = useCallback<TGetModelBox>(model => {
    if (model instanceof Mesh) {
      const box = new Box3().setFromObject(model);
      return {
        size: box.getSize(new Vector3()),
        center: box.getCenter(new Vector3()),
      };
    }
    return {
      size: new Vector3(),
      center: new Vector3(),
    };
  }, []);

  toggleVirModelRef.current = useCallback<TToggleVirModel>(
    (type = false) => {
      if (!scene || !globalData.app?.virObjectsNameDict) return;
      // const outlineColor = "#FF0000";
      const outlineColor = '#FF0000';
      // Object.keys(globalData.app?.objectsNameDict).forEach((name) => {
      //   if (
      //     name.toUpperCase().startsWith("110KV-GIS") ||
      //     name.toUpperCase().startsWith("10KV-SWG")
      //   ) {
      //     if (
      //       !name.includes("Cable-") &&
      //       !name.toLocaleUpperCase().includes("VIR")
      //     ) {
      //       const obj = globalData.app.objectsNameDict[name];
      //       if (obj instanceof Mesh) {
      //         obj.material.needsUpdate = true;
      //         obj.material.transparent = type;
      //         obj.material.opacity = type ? 0.3 : 1;
      //         obj.material.depthTest = !type;
      //         obj.material.depthWrite = !type;
      //         obj.renderOrder = 0;
      //       }
      //     }
      //   }
      // });
      Object.keys(globalData.app.virObjectsNameDict).forEach(name => {
        const obj = globalData.app.virObjectsNameDict[name];
        if (obj instanceof Mesh) {
          if (obj.name.toLocaleUpperCase().includes('VIR')) {
            obj.material.needsUpdate = true;
            obj.material.transparent = !type;
            obj.material.opacity = type ? 1 : 0;
            obj.material.depthTest = !type;
            obj.material.depthWrite = !type;
            obj.renderOrder = 1;
          }
          if (obj.name.includes('Cable-')) {
            obj.material.needsUpdate = true;
            obj.material.color.set(
              type ? outlineColor : obj.material.originalColor
            );
            obj.material.depthTest = !type;
            obj.material.depthWrite = !type;
            obj.renderOrder = 1;
          }
        }
      });
    },
    [scene]
  );

  // 设置指定模型名称的透明/不透明状态（只克隆一次+自动回收，分开管理原始材质）
  setModelTransparentRef.current = useCallback<TSetModelTransparent>(
    (modelNames, transparent = true, opacity = 0.3) => {
      if (!Array.isArray(modelNames)) {
        modelNames = [modelNames];
      }

      modelNames.map(name => {
        const obj = globalData.app.objectsNameDict[name];
        if (obj && obj instanceof Mesh && obj.material) {
          if (transparent) {
            if (!obj.userData._isMaterialClonedForTransparent) {
              if (Array.isArray(obj.material)) {
                obj.userData._originalMaterialForTransparent = obj.material.map(
                  mat => mat
                );
                obj.material = obj.material.map(mat => mat.clone());
              } else {
                obj.userData._originalMaterialForTransparent = obj.material;
                obj.material = obj.material.clone();
              }
              obj.userData._isMaterialClonedForTransparent = true;
            }
            if (Array.isArray(obj.material)) {
              obj.material.forEach(mat => {
                mat.transparent = true;
                mat.opacity = opacity;
                mat.needsUpdate = true;
              });
            } else {
              obj.material.transparent = true;
              obj.material.opacity = opacity;
              obj.material.needsUpdate = true;
            }
          } else {
            if (obj.userData._isMaterialClonedForTransparent) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => mat.dispose());
              } else {
                obj.material.dispose();
              }
              obj.material = obj.userData._originalMaterialForTransparent;
              delete obj.userData._originalMaterialForTransparent;
              delete obj.userData._isMaterialClonedForTransparent;
            } else {
              if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => {
                  mat.transparent = false;
                  mat.opacity = 1;
                  mat.needsUpdate = true;
                });
              } else {
                obj.material.transparent = false;
                obj.material.opacity = 1;
                obj.material.needsUpdate = true;
              }
            }
          }
        }
      });
    },
    []
  );

  /**
   * 判断指定模型（按名称或id）是否处于透明状态
   * @param {string|string[]} modelNames - 模型名称或名称数组
   * @returns {boolean|Object} - 单个名称时返回布尔值，数组时返回每个模型的透明状态
   */
  isModelTransparentRef.current = useCallback<TIsModelTransparent>(
    modelNames => {
      if (!Array.isArray(modelNames)) modelNames = [modelNames];
      const result: { [key: string]: boolean } = {};
      modelNames.map(name => {
        const obj = globalData.app.objectsNameDict[name];
        if (obj && obj instanceof Mesh && obj.material) {
          result[obj.name] = !!obj.userData._isMaterialClonedForTransparent;
        }
      });
      // 如果只查一个，直接返回布尔值
      if (modelNames.length === 1) {
        return result[modelNames[0]] || false;
      }
      return result;
    },
    []
  );
  // 获取当前视角
  getCurrentViewStateRef.current = useCallback<TGetCurrentViewState>(() => {
    if (!camera) {
      return {
        position: [0, 0, 0],
        target: [0, 0, 0],
      };
    }

    // 尝试获取实际的 CameraControls 实例
    let actualControls = null;

    // 方法1: 从 THREE.js 全局状态获取默认控制器
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (controls && (controls as any).target) {
      actualControls = controls;
      console.log('找到控制器方法1:', actualControls);
    }

    // 方法2: 从 globalData 获取已注册的 controls
    if (!actualControls && globalData.app?.controls) {
      actualControls = globalData.app.controls;
      console.log('找到控制器方法2:', actualControls);
    }

    // 方法3: 从 scene 中查找 CameraControls
    if (!actualControls && scene) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scene.traverse((child: any) => {
        if (child.isCameraControls || (child.target && child.getTarget)) {
          actualControls = child;
          console.log('找到控制器方法3:', actualControls);
        }
      });
    }

    // 获取 target 位置
    let targetPosition: [number, number, number] = [0, 0, 0];
    if (actualControls) {
      if (actualControls.target) {
        // 标准的 OrbitControls 或 CameraControls
        targetPosition = [
          actualControls.target.x || 0,
          actualControls.target.y || 0,
          actualControls.target.z || 0,
        ];
        console.log('通过 target 属性获取:', targetPosition);
      } else if (actualControls.getTarget) {
        // CameraControls 的 getTarget 方法
        const target = actualControls.getTarget();
        if (target) {
          targetPosition = [target.x || 0, target.y || 0, target.z || 0];
        }
        console.log('通过 getTarget 方法获取:', targetPosition);
      }
    } else {
      console.log('未找到控制器实例');
    }

    const result = {
      position: [camera.position.x, camera.position.y, camera.position.z] as [
        number,
        number,
        number,
      ],
      target: targetPosition,
    };

    console.log('getCurrentViewState 结果:', result);
    return result;
  }, [camera, controls, scene]);

  flyToViewRef.current = useCallback<TFlyToView>(
    (targetState, options = {}, onFinish = () => {}) => {
      const { duration = 2500 } = options;

      if (!camera || !controls) return;

      // 起始状态
      const startPosition = camera.position.clone();
      const startTarget = camera.getWorldPosition(new Vector3());

      // 目标状态
      const endPosition = new Vector3(
        targetState.position[0],
        targetState.position[1],
        targetState.position[2]
      );
      const endTarget = new Vector3(
        targetState.target[0],
        targetState.target[1],
        targetState.target[2]
      );

      setFocusPoint({
        duration: duration <= 0 ? 50 : duration,
        from: {
          x: startPosition.x,
          y: startPosition.y,
          z: startPosition.z,
          lookAtX: startTarget.x,
          lookAtY: startTarget.y,
          lookAtZ: startTarget.z,
        },
        to: {
          x: endPosition.x,
          y: endPosition.y,
          z: endPosition.z,
          lookAtX: endTarget.x,
          lookAtY: endTarget.y,
          lookAtZ: endTarget.z,
        },
        onFinish,
      });
    },
    [camera, controls, setFocusPoint]
  );

  setSelectedRouletteIdRef.current = useCallback<TSetSelectedRouletteId>(
    id => {
      setSelectedId(id);
    },
    [setSelectedId]
  );

  clickModelFromObjRef.current = useCallback<TClickModelFromObj>(
    async (object, force = false) => {
      if (!selectedAreaModel || force) {
        const clickedObject = object;
        if (!clickedObject) {
          setSelectedModel(null);
          return;
        }

        // // 检查是否是监控模型
        // const isMonitorModel = globalData.app.focusMonitorModelNames?.includes(
        //   clickedObject.name
        // );
        // if (isMonitorModel) {
        //   setSelectedModel(null); // 清空普通选中模型
        //   return;
        // }
        const findParent = (obj: Object3D) => {
          if (isModelInFocus(obj)) return obj;
          if (obj?.parent) return findParent(obj.parent);
          return null;
        };
        const selectedDevice = findParent(clickedObject);

        if (
          selectedDevice &&
          selectedModel &&
          selectedModel.name !== selectedDevice.name &&
          selectedId
        ) {
          globalData.app?.onRouletteClose?.();
          await new Promise(resolve => globalThis.setTimeout(resolve, 100));
        }

        if (
          !selectedDevice?.name?.includes('110kV-GIS_103') &&
          !selectedDevice?.name?.includes('110kV-GIS_145')
        )
          return;

        setSelectedModel(selectedDevice);

        if (selectedDevice) {
          const areaName = selectedDevice.name.split('_').slice(0, 2).join('_');
          let prevAreaName = '';
          if (selectedAreaModel) {
            prevAreaName = selectedAreaModel.name
              .split('_')
              .slice(0, 2)
              .join('_');
          }
          if (prevAreaName !== areaName) {
            setSelectedAreaModel(globalData.app.areaNameDict[areaName]?.object);
          }
        }
      }
    },
    [
      selectedAreaModel,
      selectedId,
      selectedModel,
      setSelectedAreaModel,
      setSelectedModel,
    ]
  );

  clickModelFromNameRef.current = useCallback<TClickModelFromName>(name => {
    const obj = globalData.app.objectsNameDict[name];
    clickModelFromObjRef.current(obj);
  }, []);

  changeCordonConfigRef.current = useCallback<TChangeCordonConfig>(
    (type, config) => {
      if (type === 'add') {
        setCordConfigState(prev => [
          ...prev,
          ...config.map(item => ({ ...defaultCordonConfig, ...item })),
        ]);
      } else if (type === 'remove') {
        setCordConfigState(prev =>
          prev.filter(
            item => !config.some(c => c.areaModelNames === item.areaModelNames)
          )
        );
      } else if (type === 'update') {
        setCordConfigState(prev => {
          config.forEach(item => {
            const index = prev.findIndex(
              prevItem => prevItem.areaModelNames === item.areaModelNames
            );
            if (index !== -1) {
              prev[index] = { ...prev[index], ...item };
            }
          });
          return prev;
        });
      } else if (type === 'show' || type === 'hide') {
        setCordConfigState(prev => {
          return [
            ...prev.map(item => {
              if (
                !config ||
                config.length === 0 ||
                (config.length > 0 &&
                  config.some(c => c.areaModelNames === item.areaModelNames))
              ) {
                return {
                  ...item,
                  enabled: type === 'show',
                };
              }
              return item;
            }),
          ];
        });
      }
    },
    [setCordConfigState]
  );

  flyToObjectRef.current = useCallback<TFlyToObject>(
    (model, options = {}, onFinish = () => {}) => {
      if (!camera || !controls) return;

      // 使用flyToView将相机移动到对应模型面前
      if (model) {
        try {
          // 计算模型的包围盒
          const modelBox = new Box3().setFromObject(model);
          const modelCenter = modelBox.getCenter(new Vector3());

          // 定义包围盒的六个面
          const faces = [
            {
              // 右面 (+X)
              center: new Vector3(modelBox.max.x, modelCenter.y, modelCenter.z),
              normal: new Vector3(1, 0, 0),
            },
            {
              // 左面 (-X)
              center: new Vector3(modelBox.min.x, modelCenter.y, modelCenter.z),
              normal: new Vector3(-1, 0, 0),
            },
            {
              // 上面 (+Y)
              center: new Vector3(modelCenter.x, modelBox.max.y, modelCenter.z),
              normal: new Vector3(0, 1, 0),
            },
            {
              // 下面 (-Y)
              center: new Vector3(modelCenter.x, modelBox.min.y, modelCenter.z),
              normal: new Vector3(0, -1, 0),
            },
            {
              // 前面 (+Z)
              center: new Vector3(modelCenter.x, modelCenter.y, modelBox.max.z),
              normal: new Vector3(0, 0, 1),
            },
            {
              // 后面 (-Z)
              center: new Vector3(modelCenter.x, modelCenter.y, modelBox.min.z),
              normal: new Vector3(0, 0, -1),
            },
          ];

          // 确定要面向的面和目标点
          let targetFace = faces[4]; // 默认使用前面 (+Z)
          let targetPoint = targetFace.center.clone(); // 默认使用面的中心点

          if (options.mousePoint) {
            // 如果提供了鼠标坐标，使用射线检测
            const raycaster = new Raycaster();
            const mouse = new Vector2(
              (options.mousePoint.x / window.innerWidth) * 2 - 1,
              -(options.mousePoint.y / window.innerHeight) * 2 + 1
            );

            raycaster.setFromCamera(mouse, camera);

            // 计算射线与模型的交点
            const intersects = raycaster.intersectObject(model, true);

            if (intersects.length > 0) {
              // 获取交点位置
              const intersectionPoint = intersects[0].point;

              // 找出距离交点最近的包围盒面
              let minDistance = Infinity;
              let closestFaceIndex = 0;

              faces.forEach((face, index) => {
                // 计算交点到面的距离（沿法线方向的投影距离）
                const distanceToFace = Math.abs(
                  intersectionPoint.clone().sub(face.center).dot(face.normal)
                );

                if (distanceToFace < minDistance) {
                  minDistance = distanceToFace;
                  closestFaceIndex = index;
                }
              });

              targetFace = faces[closestFaceIndex];

              // 将交点投影到最近的面上
              // 首先计算交点到面的有符号距离
              const signedDistance = intersectionPoint
                .clone()
                .sub(targetFace.center)
                .dot(targetFace.normal);

              // 然后将交点沿法线方向移动到面上
              targetPoint = intersectionPoint
                .clone()
                .sub(targetFace.normal.clone().multiplyScalar(signedDistance));

              // 确保投影点在包围盒内
              targetPoint.x = Math.max(
                modelBox.min.x,
                Math.min(modelBox.max.x, targetPoint.x)
              );
              targetPoint.y = Math.max(
                modelBox.min.y,
                Math.min(modelBox.max.y, targetPoint.y)
              );
              targetPoint.z = Math.max(
                modelBox.min.z,
                Math.min(modelBox.max.z, targetPoint.z)
              );
            } else {
              // 如果没有交点，选择最接近相机当前方向的面
              const cameraDirection = new Vector3(0, 0, -1).applyQuaternion(
                camera.quaternion
              );

              let maxDot = -Infinity;
              let bestFaceIndex = 0;

              faces.forEach((face, index) => {
                // 计算面法向量与相机方向的点积
                // 法向量需要取反，因为我们要找的是面向相机的面
                const dot = face.normal.clone().negate().dot(cameraDirection);
                if (dot > maxDot) {
                  maxDot = dot;
                  bestFaceIndex = index;
                }
              });

              targetFace = faces[bestFaceIndex];
              targetPoint = targetFace.center.clone(); // 使用面的中心点
            }
          }

          // 计算相机位置 - 在包围盒表面外1米处
          const distanceFromSurface = 1; // 1米
          const cameraTargetPosition = targetPoint
            .clone()
            .add(targetFace.normal.clone().multiplyScalar(distanceFromSurface));

          setFlyingAble(true);
          // 使用flyToView移动相机
          moveCamera({
            position: cameraTargetPosition,
            target: targetPoint, // 相机看向点击的位置，而不是模型中心
            duration: options?.duration,
            // useSourceControl: true,
            onTransitionEnd: () => {
              setFlyingAble(false);
              onFinish?.();
            },
          });
        } catch (error) {
          console.error('❌ 相机移动失败:', error);
        }
      }
    },
    [camera, controls, moveCamera, setFlyingAble]
  );

  useEffect(() => {
    setApp({
      setPosition: (params: { position: TPosition; rotation: TPosition }) => {
        setPositionRef.current(params);
      },
      changeModelColor: (
        key: string,
        type: 'setColor' | 'reSetColor',
        colorValue: string,
        keyType?: 'id' | 'name'
      ) => {
        changeModelColorRef.current(key, type, colorValue, keyType);
      },
      modelShowHidden: (
        key: string | string[],
        visibleType: 'show' | 'hidden',
        keyType?: 'id' | 'name'
      ) => {
        modelShowHiddenRef.current(key, visibleType, keyType);
      },
      getModelLayerList: (
        obj: Object3D,
        list: TModelLayer[],
        result: TModelLayer[],
        filter: string[]
      ) => {
        getModelLayerListRef.current(obj, list, result, filter);
      },
      getModelBox: (model: Object3D) => {
        getModelRef.current(model);
      },
      deselect: () => {
        clearSelectedModelRef.current?.();
      },
      flyToView: (
        targetState: {
          position: TPosition<'array'>;
          target: TPosition<'array'>;
        },
        options = {},
        onFinish: () => void
      ) => {
        flyToViewRef.current(targetState, options, onFinish);
      },
      setModelTransparent: (
        modelNames: string | string[],
        transparent?: boolean,
        opacity?: number
      ) => {
        setModelTransparentRef.current(modelNames, transparent, opacity);
      },
      isModelTransparent: (modelNames: string | string[]) => {
        return isModelTransparentRef.current(modelNames);
      },
      addDecalToModelByName: () => {},
      updateDecalText: () => {},
      showHexLabelByName: () => {},
      hideHexLabelByName: () => {},
      addModelToScene: () => {},
      getCurrentViewState: () => {
        return getCurrentViewStateRef.current();
      },
      setSelectedRouletteId: (id: string) => {
        setSelectedRouletteIdRef.current(id);
      },
      clickModelFromObj: (object: Object3D, force = false) => {
        clickModelFromObjRef.current(object, force);
      },
      clickModelFromName: (name: string, force = false) => {
        clickModelFromNameRef.current(name, force);
      },
      changeCordonConfig: (
        type: 'add' | 'remove' | 'update' | 'show',
        config: TcordonConfigItem[]
      ) => {
        changeCordonConfigRef.current(type, config);
      },
      toggleVirModel: (type = false) => {
        toggleVirModelRef.current(type);
      },
      flyToObject: (model: Object3D, options = {}, onFinish = () => {}) => {
        flyToObjectRef.current(model, options, onFinish);
      },
    });

    setShow({
      removeObject: (object: Object3D) => {
        removeObjectRef.current(object);
      },
    });
  }, []);

  useEffect(() => {
    setApp({ camera });
    setShow({ camera });
  }, [camera]);

  useEffect(() => {
    setApp({ controls });
    setShow({ controls });
  }, [controls]);

  useEffect(() => {
    setApp({ scene: scene });
    setShow({ sceneHelpers: scene, scene: scene });
  }, [scene]);
};

export default useInitApi;
