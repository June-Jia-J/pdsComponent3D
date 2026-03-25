import { atom } from 'jotai';
import * as THREE from 'three';

// 选中的模型
export const selectedModelAtom = atom<THREE.Object3D | null>(null);
// 选中的模型所在的区域的模型
export const selectedAreaModelAtom = atom<THREE.Object3D | null>(null);
// 选中的监控模型
export const selectedMonitorModelAtom = atom<THREE.Object3D | null>(null);

export const selectedAreaModelPropsAtom = atom<{
  center: THREE.Vector3 | null;
  size: THREE.Vector3 | null;
}>({
  center: null,
  size: null,
});

// 更新选中模型的动作
export const formateSelectedAreaModelAtom = atom(
  get => get(selectedAreaModelAtom),
  (_, set, model: THREE.Object3D | null) => {
    set(selectedAreaModelAtom, model);
    if (model) {
      try {
        const areaBox = new THREE.Box3().setFromObject(model);
        const areaCenter = areaBox.getCenter(new THREE.Vector3());
        const areaSize = areaBox.getSize(new THREE.Vector3());
        set(selectedAreaModelPropsAtom, {
          center: areaCenter,
          size: areaSize,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }
);

export const screenPositionAtom = atom<{ x: number; y: number }>({
  x: 0,
  y: 0,
});

// 模型所在位置的屏幕坐标
export const modelScreenPositionAtom = atom<{ x: number; y: number }>({
  x: 0,
  y: 0,
});

// GLTF场景缩放状态
export const mainScene = atom<THREE.Scene | null>(null);

export const glowingModelAtom = atom<THREE.Object3D | null>(null);

export const glowingAreaAtom = atom<THREE.Object3D | null>(null);

export const hudModelAtom = atom<THREE.Object3D | null>(null);

export const mainModelAtom = atom<THREE.Object3D | null>(null);

export const centerDistancetAtom = atom<number | null>(null);

export const centerPoinAtom = atom<THREE.Vector3 | null>(null);
