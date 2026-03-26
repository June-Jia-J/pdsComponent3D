/* global MouseEvent */
import React, { useState, useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PickResult } from '../types';
import { useSceneConfigContext } from './SceneConfigProvider';

/* eslint-disable no-unused-vars */
export interface PickingVisualizerProps {
  /** 是否启用 */
  enabled?: boolean;
  /** 拾取回调 */
  onPick?: (result: PickResult) => void;
  /** 是否显示调试信息 */
  showDebugInfo?: boolean;
}
/* eslint-enable no-unused-vars */

/**
 * 拾取可视化组件
 * 在3D场景中显示拾取结果和调试信息
 */
export function PickingVisualizer({
  enabled = true,
  onPick,
  showDebugInfo = true,
}: PickingVisualizerProps) {
  const { gl } = useThree();
  const { pick, getBoundingBox } = useSceneConfigContext();
  const [lastPickResult, setLastPickResult] = useState<PickResult | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // 处理鼠标移动
  useEffect(() => {
    if (!enabled) return;

    const canvas = gl.domElement;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, gl]);

  // 处理点击拾取
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled) return;

      const rect = gl.domElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const result = pick(x, y);
      if (result) {
        setLastPickResult(result);
        onPick?.(result);

        // 打印拾取信息到控制台
        console.log('🎯 拾取结果:', {
          objectName: result.object.name,
          objectId: result.object.id,
          worldPosition: {
            x: result.worldPosition.x.toFixed(3),
            y: result.worldPosition.y.toFixed(3),
            z: result.worldPosition.z.toFixed(3),
          },
          localPosition: {
            x: result.localPosition.x.toFixed(3),
            y: result.localPosition.y.toFixed(3),
            z: result.localPosition.z.toFixed(3),
          },
          distance: result.distance.toFixed(3),
          normal: result.normal
            ? {
                x: result.normal.x.toFixed(3),
                y: result.normal.y.toFixed(3),
                z: result.normal.z.toFixed(3),
              }
            : null,
        });
      }
    },
    [enabled, gl, pick, onPick]
  );

  // 获取对象的包围盒信息
  const boundingBoxInfo = lastPickResult?.object.name
    ? getBoundingBox(lastPickResult.object.name)
    : null;

  if (!enabled) return null;

  return (
    <>
      {/* 点击捕获层 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          cursor: 'crosshair',
          zIndex: 100,
        }}
        onClick={handleClick}
      />

      {/* 调试信息面板 */}
      {showDebugInfo && isHovering && (
        <div
          style={{
            position: 'absolute',
            left: mousePosition.x + 15,
            top: mousePosition.y + 15,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            borderRadius: 8,
            padding: 12,
            minWidth: 200,
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: 12,
            zIndex: 1000,
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          {lastPickResult ? (
            <>
              <div
                style={{
                  fontWeight: 'bold',
                  marginBottom: 8,
                  color: '#4ade80',
                }}
              >
                🎯 拾取结果
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: '#888' }}>对象:</span>{' '}
                {lastPickResult.object.name || '(未命名)'}
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: '#888' }}>ID:</span>{' '}
                {lastPickResult.object.id}
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#888' }}>距离:</span>{' '}
                {lastPickResult.distance.toFixed(3)}m
              </div>

              <div
                style={{
                  fontWeight: 'bold',
                  marginBottom: 4,
                  color: '#60a5fa',
                }}
              >
                世界坐标
              </div>
              <div style={{ marginBottom: 8, paddingLeft: 8 }}>
                X: {lastPickResult.worldPosition.x.toFixed(3)}
                <br />
                Y: {lastPickResult.worldPosition.y.toFixed(3)}
                <br />
                Z: {lastPickResult.worldPosition.z.toFixed(3)}
              </div>

              <div
                style={{
                  fontWeight: 'bold',
                  marginBottom: 4,
                  color: '#f472b6',
                }}
              >
                局部坐标
              </div>
              <div style={{ marginBottom: 8, paddingLeft: 8 }}>
                X: {lastPickResult.localPosition.x.toFixed(3)}
                <br />
                Y: {lastPickResult.localPosition.y.toFixed(3)}
                <br />
                Z: {lastPickResult.localPosition.z.toFixed(3)}
              </div>

              {lastPickResult.normal && (
                <>
                  <div
                    style={{
                      fontWeight: 'bold',
                      marginBottom: 4,
                      color: '#fbbf24',
                    }}
                  >
                    法向量
                  </div>
                  <div style={{ paddingLeft: 8 }}>
                    X: {lastPickResult.normal.x.toFixed(3)}
                    <br />
                    Y: {lastPickResult.normal.y.toFixed(3)}
                    <br />
                    Z: {lastPickResult.normal.z.toFixed(3)}
                  </div>
                </>
              )}

              {boundingBoxInfo && (
                <>
                  <div
                    style={{
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: '1px solid #444',
                      fontWeight: 'bold',
                      marginBottom: 4,
                      color: '#a78bfa',
                    }}
                  >
                    包围盒
                  </div>
                  <div style={{ paddingLeft: 8 }}>
                    中心:{' '}
                    {boundingBoxInfo.center.map(v => v.toFixed(2)).join(', ')}
                    <br />
                    尺寸:{' '}
                    {boundingBoxInfo.size.map(v => v.toFixed(2)).join(', ')}
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ color: '#888' }}>点击场景中的对象查看拾取信息</div>
          )}
        </div>
      )}
    </>
  );
}
