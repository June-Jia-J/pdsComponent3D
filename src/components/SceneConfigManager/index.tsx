import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useEffect,
  useState,
  useMemo,
  FC,
  ReactNode,
} from 'react';
import {
  SceneConfig,
  SceneConfigAPI,
  SceneConfigSnapshot,
  CoordinateSystem,
  generateId,
  AnchorPoint,
  ViewBookmark,
  LightingPreset,
} from '@/types/sceneConfig';

export { SceneConfigPanel } from './SceneConfigPanel';
export { SceneConfigWrapper } from './SceneConfigWrapper';
export { SceneConfigBridge } from './SceneConfigBridge';

const SCENE_CONFIG_VERSION = '1.0.0';

const DEFAULT_COORDINATE_SYSTEM: CoordinateSystem = {
  type: 'world',
  origin: [0, 0, 0],
  scale: 1,
  unit: 'meter',
};

interface SceneConfigContextValue {
  config: SceneConfig;
  isReady: boolean;
  setConfig: (updates: Partial<SceneConfig>) => void;
  setBookmarks: (bookmarks: ViewBookmark[]) => void;
  setAnchors: (anchors: AnchorPoint[]) => void;
  setCurrentPreset: (preset: LightingPreset | null) => void;
  bridgeApi: {
    picking: SceneConfigAPI['picking'] | null;
    bookmarks: SceneConfigAPI['bookmarks'] | null;
    lighting: SceneConfigAPI['lighting'] | null;
  };
  setBridgeApi: (api: SceneConfigAPI['picking'] | null, 
                  bookmarks: SceneConfigAPI['bookmarks'] | null,
                  lighting: SceneConfigAPI['lighting'] | null) => void;
}

const SceneConfigContext = createContext<SceneConfigContextValue | null>(null);

export interface SceneConfigProviderProps {
  children?: ReactNode;
  initialConfig?: Partial<SceneConfig>;
  onConfigChange?: (config: SceneConfig) => void;
  autoSave?: boolean;
  storageKey?: string;
}

export const SceneConfigProvider: FC<SceneConfigProviderProps> = ({
  children,
  initialConfig,
  onConfigChange,
  autoSave = false,
  storageKey = 'scene-config',
}) => {
  const [config, setConfigState] = useState<SceneConfig>(() => ({
    id: initialConfig?.id || generateId(),
    name: initialConfig?.name || 'Default Scene',
    description: initialConfig?.description,
    coordinateSystem:
      initialConfig?.coordinateSystem || DEFAULT_COORDINATE_SYSTEM,
    viewBookmarks: initialConfig?.viewBookmarks || [],
    lightingPresetId: initialConfig?.lightingPresetId || 'builtin-default',
    anchorPoints: initialConfig?.anchorPoints || [],
    createdAt: initialConfig?.createdAt || Date.now(),
    updatedAt: initialConfig?.updatedAt || Date.now(),
  }));

  const [isReady, setIsReady] = useState(false);
  const [bridgeApi, setBridgeApiState] = useState<{
    picking: SceneConfigAPI['picking'] | null;
    bookmarks: SceneConfigAPI['bookmarks'] | null;
    lighting: SceneConfigAPI['lighting'] | null;
  }>({
    picking: null,
    bookmarks: null,
    lighting: null,
  });

  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (autoSave && isReady) {
      try {
        const snapshot: SceneConfigSnapshot = {
          version: SCENE_CONFIG_VERSION,
          timestamp: Date.now(),
          config: configRef.current,
        };
        localStorage.setItem(storageKey, JSON.stringify(snapshot));
      } catch (e) {
        console.error('Failed to auto-save scene config:', e);
      }
    }
  }, [config, autoSave, storageKey, isReady]);

  useEffect(() => {
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  const setConfig = useCallback((updates: Partial<SceneConfig>) => {
    setConfigState(prev => ({
      ...prev,
      ...updates,
      updatedAt: Date.now(),
    }));
  }, []);

  const setBookmarks = useCallback((bookmarks: ViewBookmark[]) => {
    setConfigState(prev => ({
      ...prev,
      viewBookmarks: bookmarks,
      updatedAt: Date.now(),
    }));
  }, []);

  const setAnchors = useCallback((anchors: AnchorPoint[]) => {
    setConfigState(prev => ({
      ...prev,
      anchorPoints: anchors,
      updatedAt: Date.now(),
    }));
  }, []);

  const setCurrentPreset = useCallback((preset: LightingPreset | null) => {
    setConfigState(prev => ({
      ...prev,
      lightingPresetId: preset?.id || 'builtin-default',
      updatedAt: Date.now(),
    }));
  }, []);

  const setBridgeApi = useCallback(
    (
      picking: SceneConfigAPI['picking'] | null,
      bookmarks: SceneConfigAPI['bookmarks'] | null,
      lighting: SceneConfigAPI['lighting'] | null
    ) => {
      setBridgeApiState(prev => {
        if (
          prev.picking === picking &&
          prev.bookmarks === bookmarks &&
          prev.lighting === lighting
        ) {
          return prev;
        }
        return { picking, bookmarks, lighting };
      });
    },
    []
  );

  const contextValue: SceneConfigContextValue = useMemo(
    () => ({
      config,
      isReady,
      setConfig,
      setBookmarks,
      setAnchors,
      setCurrentPreset,
      bridgeApi,
      setBridgeApi,
    }),
    [config, isReady, setConfig, setBookmarks, setAnchors, setCurrentPreset, bridgeApi, setBridgeApi]
  );

  return (
    <SceneConfigContext.Provider value={contextValue}>
      {children}
    </SceneConfigContext.Provider>
  );
};

export function useSceneConfigContext(): SceneConfigContextValue {
  const context = useContext(SceneConfigContext);
  if (!context) {
    throw new Error(
      'useSceneConfigContext must be used within a SceneConfigProvider'
    );
  }
  return context;
}

export function useSceneConfig(): SceneConfigAPI {
  const context = useContext(SceneConfigContext);
  if (!context) {
    throw new Error(
      'useSceneConfig must be used within a SceneConfigProvider'
    );
  }
  
  const { config, setConfig, bridgeApi } = context;

  const getSceneConfig = useCallback((): SceneConfig => {
    return { ...config };
  }, [config]);

  const exportConfig = useCallback((): string => {
    const snapshot: SceneConfigSnapshot = {
      version: SCENE_CONFIG_VERSION,
      timestamp: Date.now(),
      config,
    };
    return JSON.stringify(snapshot, null, 2);
  }, [config]);

  const importConfig = useCallback(
    (json: string) => {
      try {
        const snapshot: SceneConfigSnapshot = JSON.parse(json);
        if (snapshot.version !== SCENE_CONFIG_VERSION) {
          console.warn(
            `Config version mismatch: expected ${SCENE_CONFIG_VERSION}, got ${snapshot.version}`
          );
        }
        setConfig({
          ...snapshot.config,
          updatedAt: Date.now(),
        });

        if (snapshot.config.viewBookmarks.length > 0 && bridgeApi.bookmarks) {
          bridgeApi.bookmarks.importBookmarks(
            JSON.stringify(snapshot.config.viewBookmarks)
          );
        }

        if (snapshot.config.anchorPoints.length > 0 && bridgeApi.picking) {
          bridgeApi.picking.importAnchors(JSON.stringify(snapshot.config.anchorPoints));
        }
      } catch (e) {
        console.error('Failed to import scene config:', e);
      }
    },
    [config, setConfig, bridgeApi.bookmarks, bridgeApi.picking]
  );

  const reset = useCallback(() => {
    const now = Date.now();
    setConfig({
      id: generateId(),
      name: 'Default Scene',
      coordinateSystem: DEFAULT_COORDINATE_SYSTEM,
      viewBookmarks: [],
      lightingPresetId: 'builtin-default',
      anchorPoints: [],
      createdAt: now,
      updatedAt: now,
    });
  }, [setConfig]);

  return useMemo(
    () => ({
      picking: bridgeApi.picking!,
      bookmarks: bridgeApi.bookmarks!,
      lighting: bridgeApi.lighting!,
      getSceneConfig,
      setSceneConfig: setConfig,
      exportConfig,
      importConfig,
      reset,
    }),
    [
      bridgeApi.picking,
      bridgeApi.bookmarks,
      bridgeApi.lighting,
      getSceneConfig,
      setConfig,
      exportConfig,
      importConfig,
      reset,
    ]
  );
}

export function useSceneConfigState(): {
  config: SceneConfig;
  isReady: boolean;
} {
  const context = useContext(SceneConfigContext);
  if (!context) {
    throw new Error(
      'useSceneConfigState must be used within a SceneConfigProvider'
    );
  }
  return {
    config: context.config,
    isReady: context.isReady,
  };
}

export function usePicking(): SceneConfigAPI['picking'] {
  const api = useSceneConfig();
  return api.picking;
}

export function useBookmarks(): SceneConfigAPI['bookmarks'] {
  const api = useSceneConfig();
  return api.bookmarks;
}

export function useLighting(): SceneConfigAPI['lighting'] {
  const api = useSceneConfig();
  return api.lighting;
}

export function loadSceneConfigFromStorage(
  storageKey: string = 'scene-config'
): SceneConfig | null {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    const snapshot: SceneConfigSnapshot = JSON.parse(stored);
    return snapshot.config;
  } catch {
    return null;
  }
}

export function clearSceneConfigFromStorage(
  storageKey: string = 'scene-config'
): void {
  localStorage.removeItem(storageKey);
}

export default SceneConfigProvider;
