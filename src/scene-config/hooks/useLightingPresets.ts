import { useCallback, useRef, useState } from 'react';
import { LightingPreset, EnvironmentPreset } from '../types';
import {
  DEFAULT_LIGHTING_PRESETS,
  DEFAULT_ENVIRONMENT_PRESETS,
} from '../constants';

/* eslint-disable no-unused-vars */
export interface UseLightingPresetsOptions {
  /** 是否启用 */
  enabled?: boolean;
  /** 预设变更回调 */
  onPresetChange?: (presetId: string, preset: LightingPreset) => void;
  /** 默认激活的预设ID */
  defaultPresetId?: string;
}

export interface UseLightingPresetsReturn {
  /** 当前激活的预设ID */
  activePresetId: string;
  /** 应用光影预设 */
  applyLightingPreset: (presetId: string) => boolean;
  /** 添加光影预设 */
  addLightingPreset: (preset: Omit<LightingPreset, 'id'>) => LightingPreset;
  /** 更新光影预设 */
  updateLightingPreset: (
    id: string,
    updates: Partial<LightingPreset>
  ) => boolean;
  /** 删除光影预设 */
  removeLightingPreset: (id: string) => boolean;
  /** 获取所有光影预设 */
  getLightingPresets: () => LightingPreset[];
  /** 根据ID获取光影预设 */
  getLightingPresetById: (id: string) => LightingPreset | undefined;
  /** 设置光影预设列表 */
  setLightingPresets: (presets: LightingPreset[]) => void;
  /** 获取当前激活的预设 */
  getActivePreset: () => LightingPreset | undefined;
  /** 获取环境预设列表 */
  getEnvironmentPresets: () => EnvironmentPreset[];
  /** 添加环境预设 */
  addEnvironmentPreset: (
    preset: Omit<EnvironmentPreset, 'id'>
  ) => EnvironmentPreset;
  /** 设置环境预设列表 */
  setEnvironmentPresets: (presets: EnvironmentPreset[]) => void;
  /** 获取当前光影配置值（用于绑定到UI） */
  currentConfig: LightingConfigValues;
}
/* eslint-enable no-unused-vars */

/**
 * 光影配置值 - 用于UI绑定
 */
export interface LightingConfigValues {
  mainLightIntensity: number;
  mainLightPosition: [number, number, number];
  mainLightColor: string;
  ambientLightIntensity: number;
  ambientLightColor: string;
  environmentEnabled: boolean;
  environmentIntensity: number;
  environmentHdrUrl: string;
  shadowsEnabled: boolean;
  backgroundColor: string;
}

/**
 * 光影预设管理 Hook
 * 提供光影预设的增删改查和应用能力
 */
export function useLightingPresets(
  options: UseLightingPresetsOptions = {}
): UseLightingPresetsReturn {
  const {
    enabled = true,
    onPresetChange,
    defaultPresetId = 'default-daylight',
  } = options;

  const presetsRef = useRef<Map<string, LightingPreset>>(new Map());
  const envPresetsRef = useRef<Map<string, EnvironmentPreset>>(new Map());
  const [activePresetId, setActivePresetId] = useState<string>(defaultPresetId);

  // 初始化默认预设
  const initializedRef = useRef(false);
  if (!initializedRef.current) {
    DEFAULT_LIGHTING_PRESETS.forEach(preset => {
      presetsRef.current.set(preset.id, preset);
    });
    DEFAULT_ENVIRONMENT_PRESETS.forEach(preset => {
      envPresetsRef.current.set(preset.id, preset);
    });
    initializedRef.current = true;
  }

  /**
   * 应用光影预设
   */
  const applyLightingPreset = useCallback(
    (presetId: string): boolean => {
      if (!enabled) return false;

      const preset = presetsRef.current.get(presetId);
      if (!preset) return false;

      setActivePresetId(presetId);
      onPresetChange?.(presetId, preset);

      return true;
    },
    [enabled, onPresetChange]
  );

  /**
   * 添加光影预设
   */
  const addLightingPreset = useCallback(
    (preset: Omit<LightingPreset, 'id'>): LightingPreset => {
      const id = generatePresetId();
      const newPreset: LightingPreset = { ...preset, id };
      presetsRef.current.set(id, newPreset);
      return newPreset;
    },
    []
  );

  /**
   * 更新光影预设
   */
  const updateLightingPreset = useCallback(
    (id: string, updates: Partial<LightingPreset>): boolean => {
      const preset = presetsRef.current.get(id);
      if (!preset) return false;

      const updatedPreset = { ...preset, ...updates };
      presetsRef.current.set(id, updatedPreset);

      // 如果更新的是当前激活的预设，触发回调
      if (id === activePresetId) {
        onPresetChange?.(id, updatedPreset);
      }

      return true;
    },
    [activePresetId, onPresetChange]
  );

  /**
   * 删除光影预设
   */
  const removeLightingPreset = useCallback(
    (id: string): boolean => {
      // 不能删除当前激活的预设
      if (id === activePresetId) return false;

      return presetsRef.current.delete(id);
    },
    [activePresetId]
  );

  /**
   * 获取所有光影预设
   */
  const getLightingPresets = useCallback((): LightingPreset[] => {
    return Array.from(presetsRef.current.values());
  }, []);

  /**
   * 根据ID获取光影预设
   */
  const getLightingPresetById = useCallback(
    (id: string): LightingPreset | undefined => {
      return presetsRef.current.get(id);
    },
    []
  );

  /**
   * 设置光影预设列表
   */
  const setLightingPresets = useCallback((presets: LightingPreset[]): void => {
    presetsRef.current.clear();
    presets.forEach(preset => {
      presetsRef.current.set(preset.id, preset);
    });
  }, []);

  /**
   * 获取当前激活的预设
   */
  const getActivePreset = useCallback((): LightingPreset | undefined => {
    return presetsRef.current.get(activePresetId);
  }, [activePresetId]);

  /**
   * 获取环境预设列表
   */
  const getEnvironmentPresets = useCallback((): EnvironmentPreset[] => {
    return Array.from(envPresetsRef.current.values());
  }, []);

  /**
   * 添加环境预设
   */
  const addEnvironmentPreset = useCallback(
    (preset: Omit<EnvironmentPreset, 'id'>): EnvironmentPreset => {
      const id = generateEnvPresetId();
      const newPreset: EnvironmentPreset = { ...preset, id };
      envPresetsRef.current.set(id, newPreset);
      return newPreset;
    },
    []
  );

  /**
   * 设置环境预设列表
   */
  const setEnvironmentPresets = useCallback(
    (presets: EnvironmentPreset[]): void => {
      envPresetsRef.current.clear();
      presets.forEach(preset => {
        envPresetsRef.current.set(preset.id, preset);
      });
    },
    []
  );

  /**
   * 获取当前光影配置值（用于绑定到UI）
   */
  const currentConfig: LightingConfigValues = (() => {
    const preset = getActivePreset();
    if (!preset) {
      return {
        mainLightIntensity: 1.0,
        mainLightPosition: [10, 10, 5],
        mainLightColor: '#ffffff',
        ambientLightIntensity: 0.2,
        ambientLightColor: '#ffffff',
        environmentEnabled: true,
        environmentIntensity: 1.0,
        environmentHdrUrl: './assets/potsdamer_platz_1k.hdr',
        shadowsEnabled: true,
        backgroundColor: '#000000',
      };
    }

    return {
      mainLightIntensity: preset.mainLight.intensity,
      mainLightPosition: preset.mainLight.position,
      mainLightColor: preset.mainLight.color,
      ambientLightIntensity: preset.ambientLight.intensity,
      ambientLightColor: preset.ambientLight.color,
      environmentEnabled: preset.environment?.enabled ?? true,
      environmentIntensity: preset.environment?.intensity ?? 1.0,
      environmentHdrUrl:
        preset.environment?.hdrUrl ?? './assets/potsdamer_platz_1k.hdr',
      shadowsEnabled: preset.shadows.enabled,
      backgroundColor: preset.background?.color ?? '#000000',
    };
  })();

  return {
    activePresetId,
    applyLightingPreset,
    addLightingPreset,
    updateLightingPreset,
    removeLightingPreset,
    getLightingPresets,
    getLightingPresetById,
    setLightingPresets,
    getActivePreset,
    getEnvironmentPresets,
    addEnvironmentPreset,
    setEnvironmentPresets,
    currentConfig,
  };
}

/**
 * 生成预设唯一ID
 */
function generatePresetId(): string {
  return `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 生成环境预设唯一ID
 */
function generateEnvPresetId(): string {
  return `env_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
