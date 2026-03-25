import { QuadraticBezierLine } from '@react-three/drei';
import { RefObject } from 'react';
import { Object3D, Vector3 } from 'three';

export interface IConnectCableProps {
  start: RefObject<Object3D>;
  end: RefObject<Object3D>;
  v1?: Vector3;
  v2?: Vector3;
}

function ConnectCable({
  start,
  end,
  v1 = new Vector3(),
  v2 = new Vector3(),
}: IConnectCableProps) {
  return (
    <QuadraticBezierLine
      lineWidth={3}
      color='#ff2060'
      start={start.current.getWorldPosition(v1)}
      end={end.current.getWorldPosition(v2)}
    />
  );
}

export default ConnectCable;
