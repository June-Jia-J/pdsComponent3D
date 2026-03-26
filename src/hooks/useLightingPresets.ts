import { useRef, useCallback, useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  LightingPreset,
  LightConfig,
  EnvironmentConfig,
  ShadowConfig,
} from '../types/sceneConfig';
const defaultLightPresets: LightingPreset[] = [
 {
 id: 'preset-default',
 name: '默认',
 description: '基础照明设置，适合大多数场景',
 category: '标准',
 lights: {
 ambient: {
 type: 'ambient',
 enabled: true,
 color: '#ffffff',
 intensity: 0.4,
 },
 directional: {
 type: 'directional',
 enabled: true,
 color: '#ffffff',
 intensity: 1.0,
 position: [10, 10, 5],
 castShadow: true,
 shadowMapSize: [2048, 2048],
 shadowBias: -0.0001,
 },
 },
 environment: {
 enabled: true,
 type: 'hdr',
 source: './assets/potsdamer_platz_1k.hdr',
 intensity: 1.0,
 backgroundColor: '#000000',
 toneMapping: 'ACESFilmic',
 toneMappingExposure: 1.0,
 },
 shadows: {
 enabled: true,
 type: 'pcfsoft',
 mapSize: [2048, 2048],
 bias: -0.0001,
 normalBias: 0.0,
 radius: 1.0,
 },
 createdAt: Date.now(),
 updatedAt: Date.now(),
 },
 {
 id: 'preset-studio',
 name: '工作室',
 description: '柔和的三灯设置，适合产品展示',
 category: '专业',
 lights: {
 ambient: {
 type: 'ambient',
 enabled: true,
 color: '#ffffff',
 intensity: 0.2,
 },
 keyLight: {
 type: 'spot',
 enabled: true,
 color: '#fff8f0',
 intensity: 2.0,
 position: [5, 8, 5],
 castShadow: true,
 angle: 0.4,
 penumbra: 0.5,
 shadowMapSize: [2048, 2048],
 },
 fillLight: {
 type: 'directional',
 enabled: true,
 color: '#f0f8ff',
 intensity: 0.5,
 position: [-5, 3, 3],
 },
 rimLight: {
 type: 'directional',
 enabled: true,
 color: '#ffffff',
 intensity: 0.3,
 position: [0, 5, -5],
 },
 },
 environment: {
 enabled: false,
 type: 'color',
 intensity: 0,
 backgroundColor: '#1a1a1a',
 toneMapping: 'ACESFilmic',
 toneMappingExposure: 1.2,
 },
 shadows: {
 enabled: true,
 type: 'pcfsoft',
 mapSize: [2048, 2048],
 bias: -0.0001,
 normalBias: 0.0,
 radius: 2.0,
 },
 createdAt: Date.now(),
 updatedAt: Date.now(),
 },
 {
 id: 'preset-outdoor',
 name: '室外日景',
 description: '明亮的日光效果',
 category: '环境',
 lights: {
 ambient: {
 type: 'ambient',
 enabled: true,
 color: '#87ceeb',
 intensity: 0.3,
 },
 sun: {
 type: 'directional',
 enabled: true,
 color: '#fff5e6',
 intensity: 1.5,
 position: [50, 100, 50],
 castShadow: true,
 shadowMapSize: [4096, 4096],
 shadowBias: -0.001,
 },
 },
 environment: {
 enabled: true,
 type: 'hdr',
 source: './assets/potsdamer_platz_1k.hdr',
 intensity: 0.8,
 backgroundColor: '#87ceeb',
 toneMapping: 'ACESFilmic',
 toneMappingExposure: 1.0,
 },
 shadows: {
 enabled: true,
 type: 'pcf',
 mapSize: [4096, 4096],
 bias: -0.001,
 normalBias: 0.0,
 radius: 1.5,
 },
 createdAt: Date.now(),
 updatedAt: Date.now(),
 },
 {
 id: 'preset-night',
 name: '夜景',
 description: '低光环境，强调人工照明',
 category: '环境',
 lights: {
 ambient: {
 type: 'ambient',
 enabled: true,
 color: '#1a1a3e',
 intensity: 0.1,
 },
 moon: {
 type: 'directional',
 enabled: true,
 color: '#c4d4ff',
 intensity: 0.3,
 position: [-20, 30, -20],
 castShadow: true,
 shadowMapSize: [2048, 2048],
 },
 point1: {
 type: 'point',
 enabled: true,
 color: '#ffaa00',
 intensity: 1.0,
 position: [5, 3, 5],
 distance: 20,
 decay: 2.0,
 },
 point2: {
 type: 'point',
 enabled: true,
 color: '#ffaa00',
 intensity: 1.0,
 position: [-5, 3, -5],
 distance: 20,
 decay: 2.0,
 },
 },
 environment: {
 enabled: true,
 type: 'hdr',
 source: './assets/potsdamer_platz_1k.hdr',
 intensity: 0.2,
 backgroundColor: '#0a0a1a',
 toneMapping: 'ACESFilmic',
 toneMappingExposure: 0.8,
 },
 shadows: {
 enabled: true,
 type: 'pcfsoft',
 mapSize: [2048, 2048],
 bias: -0.0001,
 normalBias: 0.0,
 radius: 1.0,
 },
 createdAt: Date.now(),
 updatedAt: Date.now(),
 },
 {
 id: 'preset-dramatic',
 name: '戏剧化',
 description: '高对比度，强阴影效果',
 category: '专业',
 lights: {
 ambient: {
 type: 'ambient',
 enabled: true,
 color: '#ffffff',
 intensity: 0.1,
 },
 key: {
 type: 'spot',
 enabled: true,
 color: '#ffffff',
 intensity: 3.0,
 position: [0, 10, 0],
 castShadow: true,
 angle: 0.6,
 penumbra: 0.3,
 shadowMapSize: [2048, 2048],
 },
 rim: {
 type: 'spot',
 enabled: true,
 color: '#ff6600',
 intensity: 1.5,
 position: [-5, 5, -5],
 angle: 0.8,
 penumbra: 0.5,
 },
 },
 environment: {
 enabled: false,
 type: 'color',
 intensity: 0,
 backgroundColor: '#000000',
 toneMapping: 'ACESFilmic',
 toneMappingExposure: 1.5,
 },
 shadows: {
 enabled: true,
 type: 'pcfsoft',
 mapSize: [2048, 2048],
 bias: -0.0001,
 normalBias: 0.0,
 radius: 3.0,
 },
 createdAt: Date.now(),
 updatedAt: Date.now(),
 },
];
export const useLightingPresets = () => {
 const { scene, gl } = useThree();
 const [presets, setPresets] = useState<LightingPreset[]>(defaultLightPresets);
 const [activePresetId, setActivePresetId] = useState<string | undefined>('preset-default');
 const [activeLights, setActiveLights] = useState<Map<string, THREE.Light>>(new Map());
 const sceneRef = useRef(scene);
 const glRef = useRef(gl);
 useEffect(() => {
 sceneRef.current = scene;
 glRef.current = gl;
 }, [scene, gl]);
 const createLight = useCallback((config: LightConfig): THREE.Light | null => {
 if (!config.enabled)
 return null;
 let light: THREE.Light;
 switch (config.type) {
 case 'ambient':
 light = new THREE.AmbientLight(config.color, config.intensity);
 break;
 case 'directional':
 light = new THREE.DirectionalLight(config.color, config.intensity);
 if (config.position) {
 light.position.set(...config.position);
 }
 if (config.castShadow) {
 (light as THREE.DirectionalLight).castShadow = true;
 (light as THREE.DirectionalLight).shadow.mapSize.set(config.shadowMapSize?.[0] || 1024, config.shadowMapSize?.[1] || 1024);
 (light as THREE.DirectionalLight).shadow.bias = config.shadowBias || -0.0001;
 }
 break;
 case 'spot':
 light = new THREE.SpotLight(config.color, config.intensity, config.distance, config.angle, config.penumbra, config.decay);
 if (config.position) {
 light.position.set(...config.position);
 }
 if (config.castShadow) {
 (light as THREE.SpotLight).castShadow = true;
 (light as THREE.SpotLight).shadow.mapSize.set(config.shadowMapSize?.[0] || 1024, config.shadowMapSize?.[1] || 1024);
 (light as THREE.SpotLight).shadow.bias = config.shadowBias || -0.0001;
 }
 break;
 case 'point':
 light = new THREE.PointLight(config.color, config.intensity, config.distance, config.decay);
 if (config.position) {
 light.position.set(...config.position);
 }
 if (config.castShadow) {
 (light as THREE.PointLight).castShadow = true;
 (light as THREE.PointLight).shadow.mapSize.set(config.shadowMapSize?.[0] || 1024, config.shadowMapSize?.[1] || 1024);
 (light as THREE.PointLight).shadow.bias = config.shadowBias || -0.0001;
 }
 break;
 default:
 return null;
 }
 return light;
 }, []);
 const applyPreset = useCallback((id: string): boolean => {
 const preset = presets.find(p => p.id === id);
 if (!preset)
 return false;
 const currentScene = sceneRef.current;
 const renderer = glRef.current;
 activeLights.forEach((light) => {
 currentScene.remove(light);
 if (light.dispose) {
 light.dispose();
 }
 });
 activeLights.clear();
 Object.entries(preset.lights).forEach(([key, config]) => {
 const light = createLight(config);
 if (light) {
 light.name = `preset-${key}`;
 currentScene.add(light);
 setActiveLights(prev => new Map(prev).set(key, light));
 }
 });
 if (renderer) {
 const toneMapping: Record<string, THREE.ToneMapping> = {
 'None': THREE.NoToneMapping,
 'Linear': THREE.LinearToneMapping,
 'Reinhard': THREE.ReinhardToneMapping,
 'Cineon': THREE.CineonToneMapping,
 'ACESFilmic': THREE.ACESFilmicToneMapping,
 };
 renderer.toneMapping = toneMapping[preset.environment.toneMapping || 'ACESFilmic'] || THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure = preset.environment.toneMappingExposure || 1.0;
 }
 if (preset.shadows.enabled && renderer) {
 const shadowTypes: Record<string, THREE.ShadowMapType> = {
 'basic': THREE.BasicShadowMap,
 'pcf': THREE.PCFShadowMap,
 'pcfsoft': THREE.PCFSoftShadowMap,
 'vsm': THREE.VSMShadowMap,
 };
 renderer.shadowMap.enabled = true;
 renderer.shadowMap.type = shadowTypes[preset.shadows.type] || THREE.PCFSoftShadowMap;
 }
 else if (renderer) {
 renderer.shadowMap.enabled = false;
 }
 setActivePresetId(id);
 return true;
 }, [presets, createLight, activeLights]);
 const createPreset = useCallback((name: string, config: Omit<LightingPreset, 'id' | 'name' | 'createdAt' | 'updatedAt'>): LightingPreset => {
 const preset: LightingPreset = {
 ...config,
 id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
 name,
 createdAt: Date.now(),
 updatedAt: Date.now(),
 };
 setPresets(prev => [...prev, preset]);
 return preset;
 }, []);
 const removePreset = useCallback((id: string): boolean => {
 if (id.startsWith('preset-')) {
 setPresets(prev => {
 const index = prev.findIndex(p => p.id === id);
 if (index > -1) {
 return [...prev.slice(0, index), ...prev.slice(index + 1)];
 }
 return prev;
 });
 if (activePresetId === id) {
 setActivePresetId(undefined);
 }
 }
 return true;
 }, [activePresetId]);
 const updatePreset = useCallback((id: string, updates: Partial<LightingPreset>): LightingPreset | null => {
 let updated: LightingPreset | null = null;
 setPresets(prev => prev.map(preset => {
 if (preset.id === id) {
 updated = { ...preset, ...updates, updatedAt: Date.now() };
 return updated;
 }
 return preset;
 }));
 if (updated && activePresetId === id) {
 applyPreset(id);
 }
 return updated;
 }, [activePresetId, applyPreset]);
 const getPreset = useCallback((id: string): LightingPreset | undefined => {
 return presets.find(p => p.id === id);
 }, [presets]);
 const getAllPresets = useCallback((): LightingPreset[] => {
 return [...presets];
 }, [presets]);
 const getActivePreset = useCallback((): LightingPreset | undefined => {
 return presets.find(p => p.id === activePresetId);
 }, [presets, activePresetId]);
 const serializePreset = useCallback((id: string): string => {
 const preset = presets.find(p => p.id === id);
 if (!preset)
 return '';
 return JSON.stringify(preset, null, 2);
 }, [presets]);
 const deserializePreset = useCallback((json: string): LightingPreset | null => {
 try {
 const preset = JSON.parse(json) as LightingPreset;
 if (!preset.id || !preset.name)
 return null;
 setPresets(prev => [...prev, preset]);
 return preset;
 }
 catch (error) {
 console.error('Failed to deserialize preset:', error);
 return null;
 }
 }, []);
 const exportAllPresets = useCallback((): string => {
 return JSON.stringify(presets, null, 2);
 }, [presets]);
 const importPresets = useCallback((json: string, merge = true): LightingPreset[] => {
 try {
 const imported = JSON.parse(json) as LightingPreset[];
 const validPresets = imported.filter(p => p.id && p.name);
 if (merge) {
 const existingIds = new Set(presets.map(p => p.id));
 const newPresets = validPresets.filter(p => !existingIds.has(p.id));
 setPresets(prev => [...prev, ...newPresets]);
 return newPresets;
 }
 else {
 setPresets(validPresets);
 return validPresets;
 }
 }
 catch (error) {
 console.error('Failed to import presets:', error);
 return [];
 }
 }, [presets]);
 const getCurrentLightingState = useCallback((): Omit<LightingPreset, 'id' | 'name' | 'createdAt' | 'updatedAt'> => {
 const renderer = glRef.current;
 const lights: Record<string, LightConfig> = {};
 activeLights.forEach((light, key) => {
 let config: LightConfig | null = null;
 if (light instanceof THREE.AmbientLight) {
 config = {
 type: 'ambient',
 enabled: true,
 color: '#' + light.color.getHexString(),
 intensity: light.intensity,
 };
 }
 else if (light instanceof THREE.DirectionalLight) {
 config = {
 type: 'directional',
 enabled: true,
 color: '#' + light.color.getHexString(),
 intensity: light.intensity,
 position: [light.position.x, light.position.y, light.position.z],
 castShadow: light.castShadow,
 shadowMapSize: light.shadow ? [light.shadow.mapSize.width, light.shadow.mapSize.height] : undefined,
 shadowBias: light.shadow?.bias,
 };
 }
 else if (light instanceof THREE.SpotLight) {
 config = {
 type: 'spot',
 enabled: true,
 color: '#' + light.color.getHexString(),
 intensity: light.intensity,
 position: [light.position.x, light.position.y, light.position.z],
 castShadow: light.castShadow,
 angle: light.angle,
 penumbra: light.penumbra,
 decay: light.decay,
 distance: light.distance,
 shadowMapSize: light.shadow ? [light.shadow.mapSize.width, light.shadow.mapSize.height] : undefined,
 shadowBias: light.shadow?.bias,
 };
 }
 else if (light instanceof THREE.PointLight) {
 config = {
 type: 'point',
 enabled: true,
 color: '#' + light.color.getHexString(),
 intensity: light.intensity,
 position: [light.position.x, light.position.y, light.position.z],
 castShadow: light.castShadow,
 decay: light.decay,
 distance: light.distance,
 shadowMapSize: light.shadow ? [light.shadow.mapSize.width, light.shadow.mapSize.height] : undefined,
 shadowBias: light.shadow?.bias,
 };
 }
 if (config) {
 lights[key] = config;
 }
 });
 const environment: EnvironmentConfig = {
 enabled: true,
 type: 'hdr',
 intensity: 1.0,
 backgroundColor: '#000000',
 toneMapping: renderer ? Object.entries({
 'None': THREE.NoToneMapping,
 'Linear': THREE.LinearToneMapping,
 'Reinhard': THREE.ReinhardToneMapping,
 'Cineon': THREE.CineonToneMapping,
 'ACESFilmic': THREE.ACESFilmicToneMapping,
 }).find(([, value]) => value === renderer.toneMapping)?.[0] : 'ACESFilmic',
 toneMappingExposure: renderer?.toneMappingExposure,
 };
 const shadowType = renderer ? Object.entries({
 'basic': THREE.BasicShadowMap,
 'pcf': THREE.PCFShadowMap,
 'pcfsoft': THREE.PCFSoftShadowMap,
 'vsm': THREE.VSMShadowMap,
 }).find(([, value]) => value === renderer.shadowMap.type)?.[0] : 'pcfsoft';
 const shadows: ShadowConfig = {
 enabled: renderer?.shadowMap.enabled || false,
 type: shadowType as ShadowConfig['type'],
 mapSize: [1024, 1024],
 bias: -0.0001,
 normalBias: 0.0,
 radius: 1.0,
 };
 return { lights, environment, shadows };
 }, [activeLights]);
 return {
 presets,
 activePresetId,
 lighting: {
 createPreset,
 removePreset,
 updatePreset,
 getPreset,
 getAllPresets,
 applyPreset,
 getActivePreset,
 serializePreset,
 deserializePreset,
 exportAllPresets,
 importPresets,
 getCurrentLightingState,
 },
 };
};

