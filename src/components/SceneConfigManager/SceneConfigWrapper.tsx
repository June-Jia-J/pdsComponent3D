import React, { FC, useState, useEffect } from 'react';
import { SceneConfigProvider, useSceneConfig, SceneConfigBridge } from './index';
import { SceneConfigPanel } from './SceneConfigPanel';
import { LightingPreset } from '@/types/sceneConfig';

interface SceneConfigWrapperProps {
  children: React.ReactNode;
  showPanel?: boolean;
  onConfigReady?: (api: ReturnType<typeof useSceneConfig>) => void;
}

const SceneConfigInternal: FC<{
  showPanel: boolean;
  children: React.ReactNode;
  onConfigReady?: (api: ReturnType<typeof useSceneConfig>) => void;
}> = ({ showPanel, children, onConfigReady }) => {
  const api = useSceneConfig();
  const [panelVisible, setPanelVisible] = useState(showPanel);

  useEffect(() => {
    if (api.picking && api.bookmarks && api.lighting) {
      onConfigReady?.(api);
    }
  }, [api, onConfigReady]);

  return (
    <>
      <SceneConfigBridge
        onPresetChange={(preset: LightingPreset) => {
          console.log('Lighting preset changed:', preset.name);
        }}
      />
      {children}
      {panelVisible && (
        <SceneConfigPanel
          visible={panelVisible}
          onClose={() => setPanelVisible(false)}
        />
      )}
      <button
        onClick={() => setPanelVisible(!panelVisible)}
        style={{
          position: 'absolute',
          bottom: '70px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px',
          zIndex: 1000,
        }}
      >
        {panelVisible ? '隐藏配置面板' : '场景配置'}
      </button>
    </>
  );
};

export const SceneConfigWrapper: FC<SceneConfigWrapperProps> = ({
  children,
  showPanel = false,
  onConfigReady,
}) => {
  return (
    <SceneConfigProvider
      autoSave={true}
      storageKey='pds-scene-config'
    >
      <SceneConfigInternal showPanel={showPanel} onConfigReady={onConfigReady}>
        {children}
      </SceneConfigInternal>
    </SceneConfigProvider>
  );
};

export default SceneConfigWrapper;
