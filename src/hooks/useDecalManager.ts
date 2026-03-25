/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { useState, useCallback } from 'react';
import { DecalConfig } from '@/components/Decal/DecalManager';

export interface UseDecalManagerReturn {
  decals: DecalConfig[];
  addDecal: (config: DecalConfig) => void;
  updateDecal: (decalId: string, data: any) => void;
  removeDecal: (decalId: string) => void;
  getDecal: (decalId: string) => DecalConfig | undefined;
  clearDecals: () => void;
}

export const useDecalManager = (): UseDecalManagerReturn => {
  const [decals, setDecals] = useState<DecalConfig[]>([]);

  const addDecal = useCallback((config: DecalConfig) => {
    setDecals(prev => {
      const existingIndex = prev.findIndex(d => d.id === config.id);
      if (existingIndex >= 0) {
        // 更新现有贴花
        const newDecals = [...prev];
        newDecals[existingIndex] = { ...newDecals[existingIndex], ...config };
        return newDecals;
      } else {
        // 添加新贴花
        return [...prev, config];
      }
    });
  }, []);

  const updateDecal = useCallback((decalId: string, data: any) => {
    setDecals(prev =>
      prev.map(decal =>
        decal.id === decalId
          ? { ...decal, options: { ...decal.options, ...data } }
          : decal
      )
    );
  }, []);

  const removeDecal = useCallback((decalId: string) => {
    setDecals(prev => prev.filter(decal => decal.id !== decalId));
  }, []);

  const getDecal = useCallback(
    (decalId: string) => {
      return decals.find(decal => decal.id === decalId);
    },
    [decals]
  );

  const clearDecals = useCallback(() => {
    // setDecals([]);
  }, []);

  return {
    decals,
    addDecal,
    updateDecal,
    removeDecal,
    getDecal,
    clearDecals,
  };
};
