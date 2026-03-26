import React, { useState, useCallback } from 'react';
import { CameraBookmark } from '../types';
import { useSceneConfigContext } from './SceneConfigProvider';

export interface CameraBookmarkPanelProps {
  /** 面板位置 */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** 是否显示缩略图 */
  showThumbnails?: boolean;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 相机书签面板组件
 * 用于显示和管理相机视角书签
 */
export function CameraBookmarkPanel({
  position = 'top-right',
  showThumbnails = false,
  style,
}: CameraBookmarkPanelProps) {
  const {
    getBookmarks,
    saveBookmark,
    removeBookmark,
    restoreBookmark,
    generateThumbnail,
  } = useSceneConfigContext();

  const [bookmarks, setBookmarks] = useState<CameraBookmark[]>(getBookmarks());
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // 刷新书签列表
  const refreshBookmarks = useCallback(() => {
    setBookmarks(getBookmarks());
  }, [getBookmarks]);

  // 保存新书签
  const handleSaveBookmark = useCallback(() => {
    if (!newBookmarkName.trim()) return;
    saveBookmark(newBookmarkName.trim());
    setNewBookmarkName('');
    refreshBookmarks();
  }, [newBookmarkName, saveBookmark, refreshBookmarks]);

  // 删除书签
  const handleRemoveBookmark = useCallback(
    (id: string) => {
      removeBookmark(id);
      refreshBookmarks();
    },
    [removeBookmark, refreshBookmarks]
  );

  // 恢复书签视角
  const handleRestoreBookmark = useCallback(
    (id: string) => {
      restoreBookmark(id, {
        duration: 1000,
        easing: 'easeInOut',
      });
    },
    [restoreBookmark]
  );

  // 生成缩略图
  const handleGenerateThumbnail = useCallback(
    async (id: string) => {
      await generateThumbnail(id);
      refreshBookmarks();
    },
    [generateThumbnail, refreshBookmarks]
  );

  // 位置样式
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
  };

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyles[position],
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 8,
        padding: 16,
        minWidth: 250,
        maxWidth: 350,
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        zIndex: 1000,
        ...style,
      }}
    >
      {/* 头部 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          cursor: 'pointer',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 'bold' }}>
          视角书签
        </h3>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <>
          {/* 添加新书签 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type='text'
                value={newBookmarkName}
                onChange={e => setNewBookmarkName(e.target.value)}
                placeholder='输入书签名称'
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid #444',
                  backgroundColor: '#222',
                  color: '#fff',
                  fontSize: 13,
                }}
                onKeyDown={e => e.key === 'Enter' && handleSaveBookmark()}
              />
              <button
                onClick={handleSaveBookmark}
                disabled={!newBookmarkName.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: newBookmarkName.trim() ? '#007bff' : '#555',
                  color: '#fff',
                  cursor: newBookmarkName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: 13,
                }}
              >
                保存
              </button>
            </div>
          </div>

          {/* 书签列表 */}
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {bookmarks.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: '#888',
                  padding: '20px 0',
                  fontSize: 13,
                }}
              >
                暂无书签，点击保存当前视角
              </div>
            ) : (
              bookmarks.map(bookmark => (
                <div
                  key={bookmark.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    marginBottom: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 6,
                    gap: 10,
                  }}
                >
                  {/* 缩略图 */}
                  {showThumbnails && bookmark.thumbnail && (
                    <img
                      src={bookmark.thumbnail}
                      alt={bookmark.name}
                      style={{
                        width: 60,
                        height: 40,
                        objectFit: 'cover',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleRestoreBookmark(bookmark.id)}
                    />
                  )}

                  {/* 信息 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 'bold',
                        marginBottom: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {bookmark.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#888' }}>
                      {new Date(bookmark.createdAt).toLocaleString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleRestoreBookmark(bookmark.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 4,
                        border: 'none',
                        backgroundColor: '#28a745',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      恢复
                    </button>
                    {showThumbnails && !bookmark.thumbnail && (
                      <button
                        onClick={() => handleGenerateThumbnail(bookmark.id)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 4,
                          border: 'none',
                          backgroundColor: '#6c757d',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: 12,
                        }}
                      >
                        截图
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 4,
                        border: 'none',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
