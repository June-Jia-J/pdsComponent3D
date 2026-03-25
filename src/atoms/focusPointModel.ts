import { atom } from 'jotai';

type TCameraLocation = {
  x: number;
  y: number;
  z: number;
  lookAtX: number;
  lookAtY: number;
  lookAtZ: number;
};

export type TFocusPointModel = {
  duration?: number;
  from: TCameraLocation;
  to: TCameraLocation;
  onStart?: () => void;
  onFinish?: () => void;
};

// 选中的模型状态
export const focusPointModelAtom = atom<TFocusPointModel>({
  duration: 2500,
  from: {
    x: 0,
    y: 0,
    z: 0,
    lookAtX: 0,
    lookAtY: 0,
    lookAtZ: 0,
  },
  to: {
    x: 0,
    y: 0,
    z: 0,
    lookAtX: 0,
    lookAtY: 0,
    lookAtZ: 0,
  },
  onStart: () => {},
  onFinish: () => {},
});

// 更新选中模型的动作
export const updateSelectedModelAtom = atom(
  get => get(focusPointModelAtom),
  (
    _,
    set,
    model: {
      from: TCameraLocation;
      to: TCameraLocation;
      onStart: () => void;
      onFinish: () => void;
    }
  ) => {
    set(focusPointModelAtom, model);
  }
);
