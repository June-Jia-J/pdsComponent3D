import { Object3D, Object3DEventMap, Box3, Vector3 } from 'three';
import * as THREE from 'three';

const globalData: TGlobalData = {
  app: {
    focusModelNames: [],
    focusMonitorModelNames: [],
    publicPath: './',
    //获取模型的边框box值和中心点位置
    getModelBox(model: Object3D<Object3DEventMap>) {
      let size = {},
        center = {};
      if (model) {
        const box = new Box3().setFromObject(model);
        center = box.getCenter(new Vector3());
        size = box.getSize(new Vector3());
      }
      return { size, center };
    },
  },
  show: {},
  destroy: () => {},
  storage: {},
  THREE,
  objectsIdDict: {},
  objectsNameDict: {},
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setApp = (app: any = {}) => {
  Object.keys(app).forEach(key => {
    globalData.app[key] = app[key];
    if (key !== 'app' && key !== 'show' && key !== 'destroy') {
      globalData[key] = app[key];
    }
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setShow = (show: any = {}) => {
  Object.keys(show).forEach(key => {
    globalData.show[key] = show[key];
  });
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export type TGlobalData = {
  app: {
    focusModelNames: string[];
    // eslint-disable-next-line no-unused-vars
    getModelBox: (model: Object3D<Object3DEventMap>) => {
      size: { x: number; y: number; z: number } | {};
      center: { x: number; y: number; z: number } | {};
    };
    publicPath: string;
    [key: string]: any;
  };
  destroy: () => void;
  show: any;
  storage: any;
  objectsIdDict: { [id: number]: Object3D };
  objectsNameDict: { [name: string]: Object3D };
  [key: string]: any;
};

globalData['setApp'] = setApp;
globalData['setShow'] = setShow;

export default globalData;
