import React, { FC, useState, useCallback, useEffect } from 'react';
import {
  ViewBookmark,
  LightingPreset,
  AnchorPoint,
} from '@/types/sceneConfig';
import {
  useSceneConfig,
  useSceneConfigState,
  useBookmarks,
  useLighting,
  usePicking,
} from './index';

interface SceneConfigPanelProps {
  visible?: boolean;
  onClose?: () => void;
  style?: React.CSSProperties;
}

export const SceneConfigPanel: FC<SceneConfigPanelProps> = ({
  visible = true,
  onClose,
  style = {},
}) => {
  const { isReady } = useSceneConfigState();
  const bookmarks = useBookmarks();
  const lighting = useLighting();
  const picking = usePicking();
  const sceneConfig = useSceneConfig();

  const [activeTab, setActiveTab] = useState<'bookmarks' | 'lighting' | 'picking' | 'export'>(
    'bookmarks'
  );
  const [bookmarkList, setBookmarkList] = useState<ViewBookmark[]>([]);
  const [presetList, setPresetList] = useState<LightingPreset[]>([]);
  const [anchorList, setAnchorList] = useState<AnchorPoint[]>([]);
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [newPresetName, setNewPresetName] = useState('');
  const [newAnchorName, setNewAnchorName] = useState('');
  const [exportData, setExportData] = useState('');

  useEffect(() => {
    if (isReady) {
      setBookmarkList(bookmarks.getBookmarks());
      setPresetList(lighting.getPresets());
      setAnchorList(picking.getAnchors());
    }
  }, [isReady, bookmarks, lighting, picking]);

  const handleCreateBookmark = useCallback(() => {
    if (!newBookmarkName.trim()) return;
    const bookmark = bookmarks.getCurrentViewAsBookmark(newBookmarkName);
    bookmarks.createBookmark(bookmark.name, bookmark);
    setNewBookmarkName('');
    setBookmarkList(bookmarks.getBookmarks());
  }, [bookmarks, newBookmarkName]);

  const handleApplyBookmark = useCallback(
    async (id: string) => {
      await bookmarks.applyBookmark(id, { duration: 1000 });
    },
    [bookmarks]
  );

  const handleDeleteBookmark = useCallback(
    (id: string) => {
      bookmarks.deleteBookmark(id);
      setBookmarkList(bookmarks.getBookmarks());
    },
    [bookmarks]
  );

  const handleApplyPreset = useCallback(
    (id: string) => {
      lighting.applyPreset(id);
      setPresetList(lighting.getPresets());
    },
    [lighting]
  );

  const handleCreatePresetFromCurrent = useCallback(() => {
    if (!newPresetName.trim()) return;
    const preset = lighting.getCurrentAsPreset(newPresetName);
    lighting.createPreset(preset.name, preset);
    setNewPresetName('');
    setPresetList(lighting.getPresets());
  }, [lighting, newPresetName]);

  const handleDeletePreset = useCallback(
    (id: string) => {
      lighting.deletePreset(id);
      setPresetList(lighting.getPresets());
    },
    [lighting]
  );

  const handleCreateAnchor = useCallback(() => {
    if (!newAnchorName.trim()) return;
    const currentView = bookmarks.getCurrentViewAsBookmark('temp');
    picking.createAnchor(newAnchorName, currentView.position);
    setNewAnchorName('');
    setAnchorList(picking.getAnchors());
  }, [picking, bookmarks, newAnchorName]);

  const handleDeleteAnchor = useCallback(
    (id: string) => {
      picking.removeAnchor(id);
      setAnchorList(picking.getAnchors());
    },
    [picking]
  );

  const handleExport = useCallback(() => {
    const data = sceneConfig.exportConfig();
    setExportData(data);
  }, [sceneConfig]);

  const handleImport = useCallback(() => {
    if (exportData.trim()) {
      sceneConfig.importConfig(exportData);
      setBookmarkList(bookmarks.getBookmarks());
      setPresetList(lighting.getPresets());
      setAnchorList(picking.getAnchors());
    }
  }, [sceneConfig, exportData, bookmarks, lighting, picking]);

  const handleCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(exportData);
  }, [exportData]);

  if (!visible) return null;

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    width: '320px',
    maxHeight: 'calc(100vh - 40px)',
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
    color: '#fff',
    fontSize: '13px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    ...style,
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 16px',
    cursor: 'pointer',
    borderBottom: active ? '2px solid #007bff' : '2px solid transparent',
    backgroundColor: active ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
    transition: 'all 0.2s',
  });

  const buttonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginRight: '6px',
  };

  const deleteButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#dc3545',
  };

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px',
    marginRight: '6px',
  };

  const listItemStyle: React.CSSProperties = {
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    marginBottom: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  return (
    <div style={panelStyle}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '15px' }}>场景配置</h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ×
          </button>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {(['bookmarks', 'lighting', 'picking', 'export'] as const).map(tab => (
          <div
            key={tab}
            style={tabStyle(activeTab === tab)}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'bookmarks' && '视角书签'}
            {tab === 'lighting' && '光影预设'}
            {tab === 'picking' && '锚点管理'}
            {tab === 'export' && '导入导出'}
          </div>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
        }}
      >
        {activeTab === 'bookmarks' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <input
                type='text'
                placeholder='书签名称'
                value={newBookmarkName}
                onChange={e => setNewBookmarkName(e.target.value)}
                style={{ ...inputStyle, width: '160px' }}
              />
              <button style={buttonStyle} onClick={handleCreateBookmark}>
                保存当前视角
              </button>
            </div>

            {bookmarkList.length === 0 ? (
              <div style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                暂无书签，请保存当前视角
              </div>
            ) : (
              bookmarkList.map(bookmark => (
                <div key={bookmark.id} style={listItemStyle}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{bookmark.name}</div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      位置: [{bookmark.position.map(p => p.toFixed(1)).join(', ')}]
                    </div>
                  </div>
                  <div>
                    <button
                      style={buttonStyle}
                      onClick={() => handleApplyBookmark(bookmark.id)}
                    >
                      应用
                    </button>
                    <button
                      style={deleteButtonStyle}
                      onClick={() => handleDeleteBookmark(bookmark.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'lighting' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <input
                type='text'
                placeholder='预设名称'
                value={newPresetName}
                onChange={e => setNewPresetName(e.target.value)}
                style={{ ...inputStyle, width: '160px' }}
              />
              <button style={buttonStyle} onClick={handleCreatePresetFromCurrent}>
                保存当前
              </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '8px',
                }}
              >
                内置预设
              </div>
              {presetList
                .filter(p => p.id.startsWith('builtin-'))
                .map(preset => (
                  <div key={preset.id} style={listItemStyle}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{preset.name}</div>
                      {preset.description && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'rgba(255, 255, 255, 0.5)',
                          }}
                        >
                          {preset.description}
                        </div>
                      )}
                    </div>
                    <button
                      style={buttonStyle}
                      onClick={() => handleApplyPreset(preset.id)}
                    >
                      应用
                    </button>
                  </div>
                ))}
            </div>

            {presetList.filter(p => !p.id.startsWith('builtin-')).length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginBottom: '8px',
                  }}
                >
                  自定义预设
                </div>
                {presetList
                  .filter(p => !p.id.startsWith('builtin-'))
                  .map(preset => (
                    <div key={preset.id} style={listItemStyle}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{preset.name}</div>
                      </div>
                      <div>
                        <button
                          style={buttonStyle}
                          onClick={() => handleApplyPreset(preset.id)}
                        >
                          应用
                        </button>
                        <button
                          style={deleteButtonStyle}
                          onClick={() => handleDeletePreset(preset.id)}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'picking' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <input
                type='text'
                placeholder='锚点名称'
                value={newAnchorName}
                onChange={e => setNewAnchorName(e.target.value)}
                style={{ ...inputStyle, width: '160px' }}
              />
              <button style={buttonStyle} onClick={handleCreateAnchor}>
                创建锚点
              </button>
            </div>

            {anchorList.length === 0 ? (
              <div style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                暂无锚点
              </div>
            ) : (
              anchorList.map(anchor => (
                <div key={anchor.id} style={listItemStyle}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{anchor.name}</div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      位置: [{anchor.worldPosition.map(p => p.toFixed(1)).join(', ')}]
                    </div>
                    {anchor.businessId && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        业务ID: {anchor.businessId}
                      </div>
                    )}
                  </div>
                  <button
                    style={deleteButtonStyle}
                    onClick={() => handleDeleteAnchor(anchor.id)}
                  >
                    删除
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'export' && (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <button style={buttonStyle} onClick={handleExport}>
                导出配置
              </button>
              <button style={buttonStyle} onClick={handleImport}>
                导入配置
              </button>
              {exportData && (
                <button style={buttonStyle} onClick={handleCopyToClipboard}>
                  复制到剪贴板
                </button>
              )}
            </div>

            <textarea
              value={exportData}
              onChange={e => setExportData(e.target.value)}
              placeholder='点击导出按钮生成配置JSON，或粘贴配置后点击导入'
              style={{
                width: '100%',
                height: '300px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '11px',
                padding: '8px',
                resize: 'none',
                fontFamily: 'monospace',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SceneConfigPanel;
