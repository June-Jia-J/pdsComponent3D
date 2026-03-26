import { useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { Vector3, PerspectiveCamera } from 'three';
import { CameraBookmark, CameraTransitionOptions } from '../types';
import { DEFAULT_TRANSITION_OPTIONS } from '../constants';
import { useFlyToView } from '@/hooks/useCamera/flyToView';
import globalData from '@/store/globalData';

/* eslint-disable no-unused-vars */
export interface UseCameraBookmarksOptions {
  /** 是否启用 */
  enabled?: boolean;
  /** 书签变更回调 */
  onBookmarksChange?: (bookmarks: CameraBookmark[]) => void;
  /** 恢复书签回调 */
  onBookmarkRestore?: (bookmark: CameraBookmark) => void;
}

export interface UseCameraBookmarksReturn {
  /** 保存当前视角为书签 */
  saveBookmark: (
    name: string,
    options?: Partial<CameraBookmark>
  ) => CameraBookmark;
  /** 更新书签 */
  updateBookmark: (id: string, updates: Partial<CameraBookmark>) => boolean;
  /** 删除书签 */
  removeBookmark: (id: string) => boolean;
  /** 获取所有书签 */
  getBookmarks: () => CameraBookmark[];
  /** 根据ID获取书签 */
  getBookmarkById: (id: string) => CameraBookmark | undefined;
  /** 恢复到指定书签视角 */
  restoreBookmark: (
    id: string,
    transitionOptions?: Partial<CameraTransitionOptions>
  ) => boolean;
  /** 生成书签缩略图 */
  generateThumbnail: (id: string) => Promise<string | null>;
  /** 设置书签列表 */
  setBookmarks: (bookmarks: CameraBookmark[]) => void;
  /** 清空所有书签 */
  clearBookmarks: () => void;
  /** 获取当前相机状态 */
  getCurrentCameraState: () => Omit<
    CameraBookmark,
    'id' | 'name' | 'createdAt'
  > | null;
}
/* eslint-enable no-unused-vars */

/**
 * 相机书签管理 Hook
 * 提供视角保存、恢复、缩略图生成等能力
 */
export function useCameraBookmarks(
  options: UseCameraBookmarksOptions = {}
): UseCameraBookmarksReturn {
  const { enabled = true, onBookmarksChange, onBookmarkRestore } = options;
  const { camera, gl } = useThree();
  const bookmarksRef = useRef<Map<string, CameraBookmark>>(new Map());

  const { moveCamera } = useFlyToView({
    transitionDuration: DEFAULT_TRANSITION_OPTIONS.duration,
  });

  /**
   * 获取当前相机状态
   */
  const getCurrentCameraState = useCallback(() => {
    if (!camera) return null;

    const controls = globalData.app?.controls as CameraControls | undefined;
    const perspectiveCamera = camera as PerspectiveCamera;

    // 获取目标点
    let target: [number, number, number] = [0, 0, 0];
    if (controls) {
      const targetVec = new Vector3();
      controls.getTarget(targetVec);
      target = [targetVec.x, targetVec.y, targetVec.z];
    }

    return {
      position: [camera.position.x, camera.position.y, camera.position.z] as [
        number,
        number,
        number,
      ],
      target,
      rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z] as [
        number,
        number,
        number,
      ],
      fov: perspectiveCamera.fov,
      near: perspectiveCamera.near,
      far: perspectiveCamera.far,
    };
  }, [camera]);

  /**
   * 保存当前视角为书签
   */
  const saveBookmark = useCallback(
    (name: string, options: Partial<CameraBookmark> = {}): CameraBookmark => {
      const state = getCurrentCameraState();
      if (!state) {
        throw new Error('无法获取相机状态');
      }

      const id = generateBookmarkId();
      const now = Date.now();

      const bookmark: CameraBookmark = {
        id,
        name,
        position: state.position,
        target: state.target,
        rotation: state.rotation,
        fov: state.fov,
        near: state.near,
        far: state.far,
        createdAt: now,
        updatedAt: now,
        ...options,
      };

      bookmarksRef.current.set(id, bookmark);
      onBookmarksChange?.(getBookmarks());

      return bookmark;
    },
    [getCurrentCameraState, onBookmarksChange]
  );

  /**
   * 更新书签
   */
  const updateBookmark = useCallback(
    (id: string, updates: Partial<CameraBookmark>): boolean => {
      const bookmark = bookmarksRef.current.get(id);
      if (!bookmark) return false;

      const updatedBookmark = {
        ...bookmark,
        ...updates,
        updatedAt: Date.now(),
      };

      bookmarksRef.current.set(id, updatedBookmark);
      onBookmarksChange?.(getBookmarks());

      return true;
    },
    [onBookmarksChange]
  );

  /**
   * 删除书签
   */
  const removeBookmark = useCallback(
    (id: string): boolean => {
      const result = bookmarksRef.current.delete(id);
      if (result) {
        onBookmarksChange?.(getBookmarks());
      }
      return result;
    },
    [onBookmarksChange]
  );

  /**
   * 获取所有书签
   */
  const getBookmarks = useCallback((): CameraBookmark[] => {
    return Array.from(bookmarksRef.current.values()).sort(
      (a, b) => a.createdAt - b.createdAt
    );
  }, []);

  /**
   * 根据ID获取书签
   */
  const getBookmarkById = useCallback(
    (id: string): CameraBookmark | undefined => {
      return bookmarksRef.current.get(id);
    },
    []
  );

  /**
   * 恢复到指定书签视角
   */
  const restoreBookmark = useCallback(
    (
      id: string,
      transitionOptions: Partial<CameraTransitionOptions> = {}
    ): boolean => {
      if (!enabled) return false;

      const bookmark = bookmarksRef.current.get(id);
      if (!bookmark) return false;

      const options = { ...DEFAULT_TRANSITION_OPTIONS, ...transitionOptions };

      // 使用 flyToView 进行平滑过渡
      moveCamera({
        position: bookmark.position,
        target: bookmark.target,
        duration: options.duration,
        onTransitionStart: options.onStart,
        onTransitionEnd: () => {
          options.onComplete?.();
          onBookmarkRestore?.(bookmark);
        },
      });

      return true;
    },
    [enabled, moveCamera, onBookmarkRestore]
  );

  /**
   * 生成书签缩略图
   */
  const generateThumbnail = useCallback(
    async (id: string): Promise<string | null> => {
      const bookmark = bookmarksRef.current.get(id);
      if (!bookmark || !gl) return null;

      try {
        // 先恢复到该书签视角
        const success = restoreBookmark(id, { duration: 0 });
        if (!success) return null;

        // 等待渲染完成
        await new Promise(resolve => setTimeout(resolve, 100));

        // 截取画面
        const canvas = gl.domElement;
        const thumbnail = canvas.toDataURL('image/png', 0.5);

        // 更新书签的缩略图
        updateBookmark(id, { thumbnail });

        return thumbnail;
      } catch (error) {
        console.error('生成缩略图失败:', error);
        return null;
      }
    },
    [gl, restoreBookmark, updateBookmark]
  );

  /**
   * 设置书签列表
   */
  const setBookmarks = useCallback(
    (bookmarks: CameraBookmark[]): void => {
      bookmarksRef.current.clear();
      bookmarks.forEach(bookmark => {
        bookmarksRef.current.set(bookmark.id, bookmark);
      });
      onBookmarksChange?.(getBookmarks());
    },
    [onBookmarksChange, getBookmarks]
  );

  /**
   * 清空所有书签
   */
  const clearBookmarks = useCallback((): void => {
    bookmarksRef.current.clear();
    onBookmarksChange?.([]);
  }, [onBookmarksChange]);

  return {
    saveBookmark,
    updateBookmark,
    removeBookmark,
    getBookmarks,
    getBookmarkById,
    restoreBookmark,
    generateThumbnail,
    setBookmarks,
    clearBookmarks,
    getCurrentCameraState,
  };
}

/**
 * 生成书签唯一ID
 */
function generateBookmarkId(): string {
  return `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
