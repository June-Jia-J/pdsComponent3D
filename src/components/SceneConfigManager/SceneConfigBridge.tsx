import { useEffect, FC } from 'react';
import { useSceneConfigContext } from './index';
import { usePickingSystem } from '@/hooks/usePickingSystem';
import { useViewBookmarks } from '@/hooks/useViewBookmarks';
import { useLightingPresets, UseLightingPresetsOptions } from '@/hooks/useLightingPresets';

export interface SceneConfigBridgeProps {
  onPresetChange?: UseLightingPresetsOptions['onPresetChange'];
}

export const SceneConfigBridge: FC<SceneConfigBridgeProps> = ({
  onPresetChange,
}) => {
  const context = useSceneConfigContext();

  const picking = usePickingSystem({
    enabled: true,
  });

  const bookmarks = useViewBookmarks();

  const lighting = useLightingPresets({
    defaultPreset: 'default',
    onPresetChange,
  });

  useEffect(() => {
    context.setBridgeApi(picking, bookmarks, lighting);
  });

  return null;
};

export default SceneConfigBridge;
