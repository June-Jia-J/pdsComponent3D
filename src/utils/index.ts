import * as THREE from 'three';
import globalData from '@/store/globalData';

/**
 * 检查URL是否为有效的GLTF文件
 */
export const isValidGLTFUrl = (url: string): boolean => {
  const validExtensions = ['.gltf', '.glb'];
  return validExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

/**
 * 格式化文件大小
 */ export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 生成唯一ID
 */
export const generateUniqueId = (): string => {
  return 'id-' + Math.random().toString(36).substr(2, 16);
};

/**
 * 检查模型是否在关注列表中
 * @param {THREE.Object3D} model - 要检查的模型
 * @returns {boolean} - 是否应该关注这个模型
 */
export const isModelInFocus = (object: THREE.Object3D) => {
  // 检查模型是否可见
  if (!object || !object.visible) return false;
  // 检查模型名称是否在关注列表中
  return globalData.app.focusModelNames.some(name => {
    // 检查模型是否可见
    // if (!object || !object.visible) return false;
    // 检查模型是否为网格
    // if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Group))
    //   return false;

    // 检查模型是否为地面
    if (object.name === 'Ground') return false;

    // 支持通配符 * 匹配
    if (name.endsWith('*')) {
      const nameWithoutStar = name.slice(0, -1);
      return object.name.startsWith(nameWithoutStar);
    }
    return object.name === name;
  });
};
