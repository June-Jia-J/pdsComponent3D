import { atom } from 'jotai';
import { TcordonConfigItem } from '../types';

export const defaultCordonConfig: Partial<TcordonConfigItem> = {
  enabled: true,
  distance: 0.6, // 警戒线距离模型边缘的距离
  color: 'rgba(255, 0, 0, 1)', // 警戒线颜色
  lineWidth: 2, // 警戒线宽度
  lineCount: 10, // 警戒线行数
  lineSpacing: 0.2, // 警戒线间距
  visible: true, // 是否可见
  entryPoint: [0.8, 0.1, 9.6],
};

export const cordonConfigAtom = atom<TcordonConfigItem[]>([]);
