import { atom } from 'jotai';
import { PerspectiveCamera as PerspectiveCameraImpl } from 'three';

const controlingAtom = atom<boolean>(false);

const controlToggleAtom = atom<{}>({});

const mainCameraAtom = atom<PerspectiveCameraImpl | null>(null);

export { controlingAtom, controlToggleAtom, mainCameraAtom };
