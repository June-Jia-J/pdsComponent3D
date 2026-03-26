/* global navigator */
import React, { useState, useCallback } from 'react';
import { useSceneConfigContext } from './SceneConfigProvider';

export interface SceneConfigToolbarProps {
  /** 工具栏位置 */
  position?: 'top' | 'bottom';
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 场景配置工具栏组件
 * 提供配置导入/导出、重置等功能
 */
export function SceneConfigToolbar({
  position = 'bottom',
  style,
}: SceneConfigToolbarProps) {
  const { exportConfig, importConfig, resetToDefault } =
    useSceneConfigContext();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportText, setExportText] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // 显示通知
  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // 导出配置
  const handleExport = useCallback(() => {
    const config = exportConfig();
    setExportText(config);
    setShowExportModal(true);
    showNotification('配置已导出');
  }, [exportConfig, showNotification]);

  // 导入配置
  const handleImport = useCallback(() => {
    if (!importText.trim()) return;

    const success = importConfig(importText.trim());
    if (success) {
      setShowImportModal(false);
      setImportText('');
      showNotification('配置导入成功');
    } else {
      showNotification('配置导入失败，请检查JSON格式');
    }
  }, [importText, importConfig, showNotification]);

  // 重置配置
  const handleReset = useCallback(() => {
    if (window.confirm('确定要重置为默认配置吗？所有自定义设置将丢失。')) {
      resetToDefault();
      showNotification('配置已重置');
    }
  }, [resetToDefault, showNotification]);

  // 复制到剪贴板
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(exportText).then(() => {
      showNotification('已复制到剪贴板');
    });
  }, [exportText, showNotification]);

  const positionStyles: React.CSSProperties =
    position === 'top'
      ? { top: 20, left: '50%', transform: 'translateX(-50%)' }
      : { bottom: 20, left: '50%', transform: 'translateX(-50%)' };

  return (
    <>
      {/* 工具栏 */}
      <div
        style={{
          position: 'absolute',
          ...positionStyles,
          display: 'flex',
          gap: 12,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: 8,
          padding: '10px 16px',
          zIndex: 1000,
          ...style,
        }}
      >
        <button
          onClick={handleExport}
          style={{
            padding: '8px 16px',
            borderRadius: 4,
            border: 'none',
            backgroundColor: '#007bff',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>📤</span> 导出配置
        </button>
        <button
          onClick={() => setShowImportModal(true)}
          style={{
            padding: '8px 16px',
            borderRadius: 4,
            border: 'none',
            backgroundColor: '#28a745',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>📥</span> 导入配置
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            borderRadius: 4,
            border: 'none',
            backgroundColor: '#dc3545',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>🔄</span> 重置
        </button>
      </div>

      {/* 导出弹窗 */}
      {showExportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={() => setShowExportModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1a1a2e',
              borderRadius: 12,
              padding: 24,
              width: 600,
              maxWidth: '90vw',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>导出配置</h3>
            <textarea
              value={exportText}
              readOnly
              style={{
                flex: 1,
                minHeight: 300,
                padding: 12,
                borderRadius: 8,
                border: '1px solid #444',
                backgroundColor: '#0d1117',
                color: '#c9d1d9',
                fontFamily: 'monospace',
                fontSize: 12,
                resize: 'none',
              }}
            />
            <div
              style={{
                display: 'flex',
                gap: 12,
                marginTop: 16,
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={handleCopy}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                复制到剪贴板
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 导入弹窗 */}
      {showImportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={() => setShowImportModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1a1a2e',
              borderRadius: 12,
              padding: 24,
              width: 600,
              maxWidth: '90vw',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>导入配置</h3>
            <p style={{ color: '#888', marginBottom: 12, fontSize: 13 }}>
              请粘贴之前导出的JSON配置内容：
            </p>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder='在此粘贴JSON配置...'
              style={{
                flex: 1,
                minHeight: 250,
                padding: 12,
                borderRadius: 8,
                border: '1px solid #444',
                backgroundColor: '#0d1117',
                color: '#c9d1d9',
                fontFamily: 'monospace',
                fontSize: 12,
                resize: 'none',
              }}
            />
            <div
              style={{
                display: 'flex',
                gap: 12,
                marginTop: 16,
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportText('');
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                取消
              </button>
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                style={{
                  padding: '10px 20px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: importText.trim() ? '#007bff' : '#555',
                  color: '#fff',
                  cursor: importText.trim() ? 'pointer' : 'not-allowed',
                  fontSize: 14,
                }}
              >
                导入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 通知 */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#28a745',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 'bold',
            zIndex: 3000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {notification}
        </div>
      )}
    </>
  );
}
