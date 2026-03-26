import { useCallback, useRef, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  LightingPreset,
  LightingPresetsAPI,
  LightingPresetName,
  BUILT_IN_LIGHTING_PRESETS,
  generateId,
} from '@/types/sceneConfig';

export interface UseLightingPresetsOptions {
  defaultPreset?: LightingPresetName;
  onPresetChange?: (preset: LightingPreset) => void;
}

export interface LightingState {
  ambientIntensity: number;
  ambientColor: string;
  mainLightPosition: [number, number, number];
  mainLightIntensity: number;
  mainLightColor: string;
  auxLightPosition: [number, number, number];
  auxLightIntensity: number;
  auxLightColor: string;
  environmentIntensity: number;
  hdrUrl: string;
  shadowsEnabled: boolean;
}

function initializeBuiltInPresets(): Map<string, LightingPreset> {
  const builtInPresets = new Map<string, LightingPreset>();
  Object.entries(BUILT_IN_LIGHTING_PRESETS).forEach(([name, preset]) => {
    const fullPreset: LightingPreset = {
      ...preset,
      id: `builtin-${name}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    builtInPresets.set(fullPreset.id, fullPreset);
  });
  return builtInPresets;
}

function getDefaultPreset(defaultPreset: LightingPresetName): LightingPreset | null {
  const defaultPresetConfig = BUILT_IN_LIGHTING_PRESETS[defaultPreset];
  if (defaultPresetConfig) {
    return {
      ...defaultPresetConfig,
      id: `builtin-${defaultPreset}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
  return null;
}

export function useLightingPresets(
  options: UseLightingPresetsOptions = {}
): LightingPresetsAPI {
  const { defaultPreset = 'default', onPresetChange } = options;

  const { scene: _scene } = useThree();
  const presetsRef = useRef<Map<string, LightingPreset>>(initializeBuiltInPresets());
  const currentPresetRef = useRef<LightingPreset | null>(getDefaultPreset(defaultPreset));
  const lightingStateRef = useRef<LightingState>({
    ambientIntensity: 0.2,
    ambientColor: '#ffffff',
    mainLightPosition: [10, 10, 5],
    mainLightIntensity: 0.5,
    mainLightColor: '#ffffff',
    auxLightPosition: [-5, 5, -5],
    auxLightIntensity: 0,
    auxLightColor: '#ffeedd',
    environmentIntensity: 1,
    hdrUrl: './assets/potsdamer_platz_1k.hdr',
    shadowsEnabled: true,
  });

  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const mainLightRef = useRef<THREE.DirectionalLight | null>(null);
  const auxLightRef = useRef<THREE.DirectionalLight | null>(null);

  void ambientLightRef;
  void mainLightRef;
  void auxLightRef;
  void _scene;

  const applyPresetToState = useCallback((preset: LightingPreset) => {
    lightingStateRef.current = {
      ambientIntensity: preset.ambient.intensity,
      ambientColor: preset.ambient.color || '#ffffff',
      mainLightPosition: preset.mainLight.position,
      mainLightIntensity: preset.mainLight.intensity,
      mainLightColor: preset.mainLight.color || '#ffffff',
      auxLightPosition: preset.auxLight?.position || [-5, 5, -5],
      auxLightIntensity: preset.auxLight?.intensity || 0,
      auxLightColor: preset.auxLight?.color || '#ffeedd',
      environmentIntensity: preset.environment.intensity,
      hdrUrl: preset.environment.hdrUrl || './assets/potsdamer_platz_1k.hdr',
      shadowsEnabled: preset.shadows?.enabled ?? true,
    };
  }, []);

  const createPreset = useCallback(
    (name: string, config: Partial<LightingPreset>): LightingPreset => {
      const now = Date.now();
      const preset: LightingPreset = {
        id: generateId(),
        name,
        ambient: config.ambient || { intensity: 0.2, color: '#ffffff' },
        mainLight: config.mainLight || {
          position: [10, 10, 5],
          intensity: 0.5,
          color: '#ffffff',
        },
        environment: config.environment || { intensity: 1 },
        createdAt: now,
        updatedAt: now,
        ...config,
      };

      presetsRef.current.set(preset.id, preset);
      return preset;
    },
    []
  );

  const updatePreset = useCallback(
    (id: string, updates: Partial<LightingPreset>): LightingPreset | null => {
      const existing = presetsRef.current.get(id);
      if (!existing) return null;

      const updatedPreset: LightingPreset = {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
      };
      presetsRef.current.set(id, updatedPreset);

      if (currentPresetRef.current?.id === id) {
        currentPresetRef.current = updatedPreset;
        applyPresetToState(updatedPreset);
      }

      return updatedPreset;
    },
    [applyPresetToState]
  );

  const deletePreset = useCallback(
    (id: string): boolean => {
      if (id.startsWith('builtin-')) {
        console.warn('Cannot delete built-in presets');
        return false;
      }

      const deleted = presetsRef.current.delete(id);

      if (currentPresetRef.current?.id === id) {
        currentPresetRef.current = null;
      }

      return deleted;
    },
    []
  );

  const getPreset = useCallback(
    (id: string): LightingPreset | undefined => {
      return presetsRef.current.get(id);
    },
    []
  );

  const getPresets = useCallback((): LightingPreset[] => {
    return Array.from(presetsRef.current.values());
  }, []);

  const applyPreset = useCallback(
    (id: string) => {
      const preset = presetsRef.current.get(id);
      if (!preset) {
        console.warn(`Preset with id ${id} not found`);
        return;
      }

      currentPresetRef.current = preset;
      applyPresetToState(preset);
      onPresetChange?.(preset);
    },
    [applyPresetToState, onPresetChange]
  );

  const getCurrentAsPreset = useCallback(
    (name: string): LightingPreset => {
      const state = lightingStateRef.current;
      const now = Date.now();
      return {
        id: generateId(),
        name,
        ambient: {
          intensity: state.ambientIntensity,
          color: state.ambientColor,
        },
        mainLight: {
          position: state.mainLightPosition,
          intensity: state.mainLightIntensity,
          color: state.mainLightColor,
        },
        auxLight: {
          position: state.auxLightPosition,
          intensity: state.auxLightIntensity,
          color: state.auxLightColor,
        },
        environment: {
          intensity: state.environmentIntensity,
          hdrUrl: state.hdrUrl,
        },
        shadows: {
          enabled: state.shadowsEnabled,
        },
        createdAt: now,
        updatedAt: now,
      };
    },
    []
  );

  const exportPresets = useCallback((): string => {
    const customPresets = Array.from(presetsRef.current.values()).filter(
      p => !p.id.startsWith('builtin-')
    );
    return JSON.stringify(customPresets, null, 2);
  }, []);

  const importPresets = useCallback((json: string) => {
    try {
      const importedPresets: LightingPreset[] = JSON.parse(json);
      importedPresets.forEach(preset => {
        if (!preset.id.startsWith('builtin-')) {
          presetsRef.current.set(preset.id, preset);
        }
      });
    } catch (e) {
      console.error('Failed to import presets:', e);
    }
  }, []);

  const getBuiltInPreset = useCallback(
    (name: LightingPresetName): LightingPreset => {
      const config = BUILT_IN_LIGHTING_PRESETS[name];
      return {
        ...config,
        id: `builtin-${name}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    },
    []
  );

  return useMemo(() => ({
    createPreset,
    updatePreset,
    deletePreset,
    getPreset,
    getPresets,
    applyPreset,
    getCurrentAsPreset,
    exportPresets,
    importPresets,
    getBuiltInPreset,
  }), [
    createPreset,
    updatePreset,
    deletePreset,
    getPreset,
    getPresets,
    applyPreset,
    getCurrentAsPreset,
    exportPresets,
    importPresets,
    getBuiltInPreset,
  ]);
}

export function serializeLightingState(state: LightingState): string {
  return JSON.stringify(state, null, 2);
}

export function deserializeLightingState(json: string): LightingState | null {
  try {
    return JSON.parse(json) as LightingState;
  } catch {
    return null;
  }
}

export function mergeLightingPresets(
  base: LightingPreset,
  override: Partial<LightingPreset>
): LightingPreset {
  return {
    ...base,
    ...override,
    ambient: {
      ...base.ambient,
      ...override.ambient,
    },
    mainLight: {
      ...base.mainLight,
      ...override.mainLight,
    },
    auxLight: override.auxLight
      ? { ...base.auxLight, ...override.auxLight }
      : base.auxLight,
    environment: {
      ...base.environment,
      ...override.environment,
    },
    shadows: override.shadows
      ? { ...base.shadows, ...override.shadows }
      : base.shadows,
    updatedAt: Date.now(),
  };
}
