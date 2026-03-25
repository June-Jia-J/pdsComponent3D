import { useSpring } from '@react-spring/three';
import { useAtom } from 'jotai';
import { focusPointModelAtom, TFocusPointModel } from '@/atoms/focusPointModel';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControlsImpl } from '@react-three/drei';

const defaultFoucePoint = {
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
};

const useCameraAnimation = (
  controlsRef?: React.RefObject<CameraControlsImpl | null>
) => {
  const [focusPoint, setFocusPoint] = useAtom(focusPointModelAtom);
  const startAbleRef = useRef(false);
  const springProps = useSpring({
    config: {
      duration: focusPoint.duration,
    },
    from: {
      x: focusPoint.from.x,
      y: focusPoint.from.y,
      z: focusPoint.from.z,
      lookAtX: focusPoint.from.lookAtX,
      lookAtY: focusPoint.from.lookAtY,
      lookAtZ: focusPoint.from.lookAtZ,
    },
    to: {
      x: focusPoint.to.x,
      y: focusPoint.to.y,
      z: focusPoint.to.z,
      lookAtX: focusPoint.to.lookAtX,
      lookAtY: focusPoint.to.lookAtY,
      lookAtZ: focusPoint.to.lookAtZ,
    },
    onStart: () => {
      startAbleRef.current = true;
      focusPoint.onStart?.();
    },
    onRest: () => {
      startAbleRef.current = false;
      focusPoint.onFinish?.();
    },
  });

  const customCameraStartAbleRef = useRef(false);
  const customCameraResetAbleRef = useRef(false);

  const [customCameraFocusPointStata, setCustomCameraFocusPointStata] =
    useState<TFocusPointModel>(defaultFoucePoint);

  const customCameraSpringProps = useSpring({
    config: {
      duration: customCameraFocusPointStata.duration,
    },
    from: {
      x: customCameraFocusPointStata.from.x,
      y: customCameraFocusPointStata.from.y,
      z: customCameraFocusPointStata.from.z,
      lookAtX: customCameraFocusPointStata.from.lookAtX,
      lookAtY: customCameraFocusPointStata.from.lookAtY,
      lookAtZ: customCameraFocusPointStata.from.lookAtZ,
    },
    to: {
      x: customCameraFocusPointStata.to.x,
      y: customCameraFocusPointStata.to.y,
      z: customCameraFocusPointStata.to.z,
      lookAtX: customCameraFocusPointStata.to.lookAtX,
      lookAtY: customCameraFocusPointStata.to.lookAtY,
      lookAtZ: customCameraFocusPointStata.to.lookAtZ,
    },
    onStart: () => {
      if (!customCameraStartAbleRef.current) {
        customCameraStartAbleRef.current = true;
        customCameraFocusPointStata.onStart?.();
      }
    },
    onRest: () => {
      if (!customCameraResetAbleRef.current) {
        customCameraStartAbleRef.current = false;
        customCameraFocusPointStata.onFinish?.();
        customCameraResetAbleRef.current = true;
        setCustomCameraFocusPointStata({
          ...defaultFoucePoint,
          duration: 0,
        });
      } else {
        customCameraResetAbleRef.current = false;
      }
    },
  });

  useFrame(({ controls }) => {
    if (customCameraResetAbleRef.current) return;

    if (startAbleRef.current && controls) {
      const cameraControls = controls as CameraControlsImpl;

      cameraControls.setLookAt(
        springProps.x.animation.values[0].getValue(),
        springProps.y.animation.values[0].getValue(),
        springProps.z.animation.values[0].getValue(),
        springProps.lookAtX.animation.values[0].getValue(),
        springProps.lookAtY.animation.values[0].getValue(),
        springProps.lookAtZ.animation.values[0].getValue()
      );
    }

    if (customCameraStartAbleRef.current && controlsRef?.current) {
      // cameraRef.current.position.copy({
      //   x: customCameraSpringProps.x.animation.values[0].getValue(),
      //   y: customCameraSpringProps.y.animation.values[0].getValue(),
      //   z: customCameraSpringProps.z.animation.values[0].getValue(),
      // });
      // cameraRef.current.lookAt(
      //   customCameraSpringProps.lookAtX.animation.values[0].getValue(),
      //   customCameraSpringProps.lookAtY.animation.values[0].getValue(),
      //   customCameraSpringProps.lookAtZ.animation.values[0].getValue()
      // );

      const cameraControls = controlsRef.current;

      cameraControls.setLookAt(
        customCameraSpringProps.x.animation.values[0].getValue(),
        customCameraSpringProps.y.animation.values[0].getValue(),
        customCameraSpringProps.z.animation.values[0].getValue(),
        customCameraSpringProps.lookAtX.animation.values[0].getValue(),
        customCameraSpringProps.lookAtY.animation.values[0].getValue(),
        customCameraSpringProps.lookAtZ.animation.values[0].getValue()
      );
    }
  });

  return controlsRef ? setCustomCameraFocusPointStata : setFocusPoint;
};

export default useCameraAnimation;
