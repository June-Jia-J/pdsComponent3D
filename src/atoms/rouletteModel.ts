import { atom } from 'jotai';

// 选中的模型状态
export const selectedIdAtom = atom<string | null>(null);

export const formateSelectedIdAtom = atom(
  get => get(selectedIdAtom),
  (_, set, id: string | null) => {
    set(selectedIdAtom, id);
  }
);
