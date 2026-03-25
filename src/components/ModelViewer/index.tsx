import React from 'react';
import GLTFViewer from '../GLTFViewer';
import { ModelViewerProps } from '../../types';

const ModelViewer: React.FC<ModelViewerProps> = ({ ...props }) => {
  return <GLTFViewer {...props} />;
};

export default ModelViewer;
