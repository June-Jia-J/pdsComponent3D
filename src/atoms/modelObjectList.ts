import { atom } from 'jotai';
import { Object3D } from 'three';

export const modelObjectListAtom = atom<Object3D[]>([]);
