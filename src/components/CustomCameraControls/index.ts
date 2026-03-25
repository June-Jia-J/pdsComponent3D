import * as THREE from 'three';
import { Octree } from 'three/addons/math/Octree.js';
import { CameraControlsImpl } from '@react-three/drei';

// CameraControlsImpl.install({ THREE: THREE });

const _ORIGIN = new THREE.Vector3(0, 0, 0);
const _v3A = new THREE.Vector3();
const _v3B = new THREE.Vector3();
const _v3C = new THREE.Vector3();
const _ray = new THREE.Ray();
const _rotationMatrix = new THREE.Matrix4();

class CustomCameraControls extends CameraControlsImpl {
  octree: Octree;
  constructor(
    camera: THREE.PerspectiveCamera,
    domElement?: globalThis.HTMLCanvasElement
  ) {
    super(camera, domElement);
    this.octree = new Octree();
  }

  _collisionTest() {
    let distance = Infinity;

    if (!this.octree) return distance;

    const direction = _v3A
      .setFromSpherical(this._spherical)
      .divideScalar(this._spherical.radius);
    _rotationMatrix.lookAt(_ORIGIN, direction, this._camera.up);

    for (let i = 0; i < 4; i++) {
      const nearPlaneCorner = _v3B.copy(this._nearPlaneCorners[i]);
      nearPlaneCorner.applyMatrix4(_rotationMatrix);

      const origin = _v3C.addVectors(this._target, nearPlaneCorner);
      _ray.set(origin, direction);

      const intersect = this.octree.rayIntersect(_ray);

      if (intersect && intersect.distance < distance) {
        distance = intersect.distance;
      }
    }

    return distance;
  }
}

export default CustomCameraControls;
