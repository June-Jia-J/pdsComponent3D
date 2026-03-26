import React, { useState, useCallback } from 'react';
import { LightingPreset } from '../types';
import { useSceneConfigContext } from './SceneConfigProvider';

export interface LightingPresetPanelProps {
  /** 面板位置 */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 光影预设面板组件
 * 用于选择和应用光影预设
 */
export function LightingPresetPanel({
  position = 'top-left',
  style,
}: LightingPresetPanelProps) {
  const {
    getLightingPresets,
    applyLightingPreset,
    addLightingPreset,
    removeLightingPreset,
    config,
  } = useSceneConfigContext();

  const [presets, setPresets] =
    useState<LightingPreset[]>(getLightingPresets());
  const [activeId, setActiveId] = useState<string>(
    config.activeLightingPresetId
  );
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  // 刷新预设列表
  const refreshPresets = useCallback(() => {
    setPresets(getLightingPresets());
  }, [getLightingPresets]);

  // 应用预设
  const handleApplyPreset = useCallback(
    (presetId: string) => {
      const success = applyLightingPreset(presetId);
      if (success) {
        setActiveId(presetId);
      }
    },
    [applyLightingPreset]
  );

  // 添加新预设
  const handleAddPreset = useCallback(() => {
    if (!newPresetName.trim()) return;

    // 基于当前激活的预设创建新预设
    const currentPreset = presets.find(p => p.id === activeId);
    if (currentPreset) {
      addLightingPreset({
        ...currentPreset,
        name: newPresetName.trim(),
        description: '自定义预设',
      });
      refreshPresets();
    }

    setNewPresetName('');
    setShowAddForm(false);
  }, [newPresetName, activeId, presets, addLightingPreset, refreshPresets]);

  // 删除预设
  const handleRemovePreset = useCallback(
    (id: string) => {
      removeLightingPreset(id);
      refreshPresets();
    },
    [removeLightingPreset, refreshPresets]
  );

  // 位置样式
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-left': { top: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
  };

  // 获取预设图标
  const getPresetIcon = (preset: LightingPreset) => {
    if (preset.id.includes('daylight') || preset.id.includes('sun'))
      return '☀️';
    if (preset.id.includes('night') || preset.id.includes('dark')) return '🌙';
    if (preset.id.includes('indoor') || preset.id.includes('warm')) return '🏠';
    if (preset.id.includes('inspection')) return '🔍';
    if (preset.id.includes('presentation')) return '🎬';
    return '💡';
  };

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyles[position],
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: 8,
        padding: 16,
        minWidth: 220,
        maxWidth: 300,
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
          光影预设
        </h3>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <>
          {/* 预设列表 */}
          <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 12 }}>
            {presets.map(preset => (
              <div
                key={preset.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  marginBottom: 8,
                  backgroundColor:
                    preset.id === activeId
                      ? 'rgba(0, 123, 255, 0.3)'
                      : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  border:
                    preset.id === activeId
                      ? '1px solid #007bff'
                      : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
                onClick={() => handleApplyPreset(preset.id)}
              >
                <span style={{ fontSize: 20, marginRight: 10 }}>
                  {getPresetIcon(preset)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 'bold',
                      marginBottom: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {preset.name}
                    {preset.id === activeId && (
                      <span
                        style={{
                          color: '#007bff',
                          marginLeft: 6,
                          fontSize: 12,
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  {preset.description && (
                    <div
                      style={{
                        fontSize: 11,
                        color: '#888',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {preset.description}
                    </div>
                  )}
                </div>
                {!preset.id.startsWith('default-') && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleRemovePreset(preset.id);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: 'none',
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 11,
                      marginLeft: 8,
                    }}
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 添加新预设 */}
          {showAddForm ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type='text'
                value={newPresetName}
                onChange={e => setNewPresetName(e.target.value)}
                placeholder='预设名称'
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '1px solid #444',
                  backgroundColor: '#222',
                  color: '#fff',
                  fontSize: 13,
                }}
                onKeyDown={e => e.key === 'Enter' && handleAddPreset()}
              />
              <button
                onClick={handleAddPreset}
                disabled={!newPresetName.trim()}
                style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: newPresetName.trim() ? '#28a745' : '#555',
                  color: '#fff',
                  cursor: newPresetName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: 12,
                }}
              >
                添加
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewPresetName('');
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 4,
                border: '1px dashed #555',
                backgroundColor: 'transparent',
                color: '#aaa',
                cursor: 'pointer',
                fontSize: 13,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.color = '#007bff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#555';
                e.currentTarget.style.color = '#aaa';
              }}
            >
              + 基于当前创建新预设
            </button>
          )}
        </>
      )}
    </div>
  );
}
