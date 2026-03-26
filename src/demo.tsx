/*
 * @Author: jiajing
 * @Date: 2025-08-04 14:41:07
 * @LastEditTime: 2025-08-19 16:32:25
 * @LastEditors: jiajing
 * @Description: PDS 3D Component Demo - 集成场景配置系统
 */
/* global navigator alert Blob URL prompt */
import { StrictMode, useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import GLTFViewer from './components/GLTFViewer';
import { model7, deviceLabels } from '../public/const.js';
import { Leva } from 'leva';
import { ModelFile } from '@/types';
import globalData, { setApp } from '@/store/globalData';
import { decalConfigs } from '../public/const';

const sampleModel = model7 as ModelFile;

// 设置全局应用数据
setApp({
  publicPath: './public',
});

setApp({
  focusMonitorModelNames: ['110kV-GIS_104_CB_PDS-S500-AE'],
  focusModelNames: [
    'GIS_103_DS_LOD2003',
    'GIS_103_CT_LOD2003',
    '110kV-GIS_112_CB_CB',
    '110kV-GIS_112_M_M',
    '110kV-GIS_112_M_BI-DS',
    '110kV-GIS_112_DS@1_DS',
    '110kV-GIS_112_DS@1_BI-CB',
    '110kV-GIS_112_DS@1_FL',
    '110kV-GIS_112_DS@2_DS',
    '110kV-GIS_112_DS@2_BI-CT',
    '110kV-GIS_112_DS@2_PG',
    '110kV-GIS_112_ES@1_ES',
    '110kV-GIS_112_CT_CT',
    '110kV-GIS_112_ES@2_ES',
    '110kV-GIS_112_FES_FES',
    '110kV-GIS_112_LCP_LCP',
    '110kV-GIS_112_BS_BS',
    '110kV-GIS_112_CONN_Tube01',
    '110kV-GIS_112_CONN_Tube02',
    '110kV-GIS_112_CONN_Tube03',
    '110kV-GIS_112_CONN_Tube04',
    '110kV-GIS_112_CONN_BI-Co',
    '110kV-GIS_112_CONN__Tube04_PG',
    '110kV-GIS_145_M@1_M',
    '110kV-GIS_145_M@1_BI-DS',
    '110kV-GIS_145_M@2_M',
    '110kV-GIS_145_M@2_BI-Co',
    '110kV-GIS_145_LCP_LCP',
    '110kV-GIS_145_ES@3_ES',
    '110kV-GIS_145_ES@2_ES',
    '110kV-GIS_145_DS@2_DS',
    '110kV-GIS_145_DS@2_BI-CT',
    '110kV-GIS_145_DS@2_FL',
    '110kV-GIS_145_DS@1_DS',
    '110kV-GIS_145_DS@1_BI-CB',
    '110kV-GIS_145_DS@1_FL',
    '110kV-GIS_145_CT_CT',
    '110kV-GIS_145_CB_CB',
    '110kV-GIS_145_BS_BS',
    '110kV-GIS_145_CONN_TUBE',
    '110kV-GIS_113_M_M',
    '110kV-GIS_113_M_BI-DS',
    '110kV-GIS_113_LCP_LCP',
    '110kV-GIS_113_ES@3_ES',
    '110kV-GIS_113_ES@2_ES',
    '110kV-GIS_113_ES@1_ES',
    '110kV-GIS_113_DS@2_DS',
    '110kV-GIS_113_DS@2_BI-CT',
    '110kV-GIS_113_DS@2_BI-Co',
    '110kV-GIS_113_DS@1_DS',
    '110kV-GIS_113_DS@1_BI-CB',
    '110kV-GIS_113_DS@1_FL',
    '110kV-GIS_113_CT_CT',
    '110kV-GIS_113_CB_CB',
    '110kV-GIS_113_BS_BS',
    '110kV-GIS_113_Connect_Tube',
    '110kV-GIS_104_M_M',
    '110kV-GIS_104_M_BI-DS',
    '110kV-GIS_104_LCP_LCP',
    '110kV-GIS_104_LCP_Vir',
    '110kV-GIS_104_ES@3_ES',
    '110kV-GIS_104_ES@2_ES',
    '110kV-GIS_104_ES@1_ES',
    '110kV-GIS_104_DS@2_DS',
    '110kV-GIS_104_DS@2_BI-CT',
    '110kV-GIS_104_DS@2_BI-CSE',
    '110kV-GIS_104_DS@2_Vir',
    '110kV-GIS_104_DS@1_DS',
    '110kV-GIS_104_DS@1_BI-CB',
    '110kV-GIS_104_DS@1_FL',
    '110kV-GIS_104_CT_CT',
    '110kV-GIS_104_CT_Vir',
    '110kV-GIS_104_CB_CB',
    '110kV-GIS_104_CB_Vir',
    '110kV-GIS_104_BS_BS',
    '110kV-GIS_104_CSE_CSE',
    '110kV-GIS_104_CSE_Vir',
    '110kV-GIS_103_M_M',
    '110kV-GIS_103_M_BI-DS',
    '110kV-GIS_103_LCP_LCP',
    '110kV-GIS_103_FES_FES',
    '110kV-GIS_103_ES@3_ES',
    '110kV-GIS_103_ES@2_ES',
    '110kV-GIS_103_DS@2_DS',
    '110kV-GIS_103_DS@2_BI-CT',
    '110kV-GIS_103_DS@2_BI-CSE',
    '110kV-GIS_103_DS@1_DS',
    '110kV-GIS_103_DS@1_BI-CB',
    '110kV-GIS_103_DS@1_FL',
    '110kV-GIS_103_CT_CT',
    '110kV-GIS_103_CB_CB',
    '110kV-GIS_103_BS_Supporter',
    '110kV-GIS_103_BS_Supporter001',
    '110kV-GIS_103_BS_Pipe',
    '110kV-GIS_103_BS_Pipe001',
    '110kV-GIS_103_BS_Pipe002',
    '110kV-GIS_103_BS_Supporter002',
    '110kV-GIS_103_CSE_CSE',
    '10kV-SWG_RMU@环网柜X_RMU',
    '10kV-SWG_SWG@201_1',
    '10kV-SWG_SWG@210_1',
    '10kV-SWG_SWG@211_1',
    '10kV-SWG_SWG@212_1',
    '10kV-SWG_SWG@213_1',
    '10kV-SWG_SWG@213_213',
    '10kV-SWG_SWG@220_1',
    '10kV-SWG_SWG@221_1',
    '10kV-SWG_SWG@222_1',
    '10kV-SWG_SWG@49-48_1',
    '10kV-SWG_SWG@59-58_1',
    '10kV-SWG_SWG@223_1',
    '10kV-SWG_SWG@245_1',
    '10kV-SWG_SWG@245-5_1',
    '220kV-TR_主变_TFM_wire_01',
    '220kV-TR_主变_TFM_220_03',
    '220kV-TR_主变_TFM_220_02',
    '220kV-TR_主变_TFM_220_01',
    '220kV-TR_主变_sensor-ae',
    '220kV-TR_主变_Rectangle2123446332',
    '220kV-TR_主变_Rectangle2123446329',
    '220kV-TR_主变_Plane',
    '220kV-TR_主变_Plane001',
    '220kV-TR_主变_Plane002',
    '220kV-TR_主变_Plane003',
    '220kV-TR_主变_Plane004',
    '220kV-TR_主变_Plane005',
    '220kV-TR_主变_Plane006',
    '220kV-TR_主变_Plane007',
    '220kV-TR_主变_Plane008',
    '220kV-TR_主变_Plane009',
    '220kV-TR_主变_Plane010',
    '220kV-TR_主变_Plane011',
    '220kV-TR_主变_Plane012',
    '220kV-TR_主变_Plane013',
    '220kV-TR_主变_Plane014',
    '220kV-TR_主变_Plane015',
    '220kV-TR_主变_Plane016',
    '220kV-TR_主变_Plane017',
    '220kV-TR_主变_Obj3d66-9734994-658-381',
    '220kV-TR_主变_Obj3d66-9734994-658-381001',
    '220kV-TR_主变_Obj3d66-9734994-658-381002',
    '220kV-TR_主变_Obj3d66-9734994-658-381003',
    '220kV-TR_主变_Obj3d66-9734994-658-381004',
    '220kV-TR_主变_Obj3d66-9734994-658-381005',
    '220kV-TR_主变_Obj3d66-9734994-658-381006',
    '220kV-TR_主变_Obj3d66-9734994-658-381007',
    '220kV-TR_主变_Obj3d66-9734994-658-381008',
    '220kV-TR_主变_Obj3d66-9734994-303-092',
    '220kV-TR_主变_Obj3d66-9734994-303-092001',
    '220kV-TR_主变_Obj3d66-9734994-303-092002',
    '220kV-TR_主变_Obj3d66-9734994-303-092003',
    '220kV-TR_主变_Obj3d66-9734994-303-092004',
    '220kV-TR_主变_Obj3d66-9734994-303-092005',
    '220kV-TR_主变_Obj3d66-9734994-303-092006',
    '220kV-TR_主变_Obj3d66-9734994-303-092007',
    '220kV-TR_主变_Obj3d66-9734994-303-092008',
    '220kV-TR_主变_Obj3d66-9734994-303-092009',
    '220kV-TR_主变_Obj3d66-9734994-303-092010',
    '220kV-TR_主变_Obj3d66-9734994-303-092011',
    '220kV-TR_主变_Obj3d66-9734994-303-092012',
    '220kV-TR_主变_Obj3d66-9734994-303-092013',
    '220kV-TR_主变_Obj3d66-9734994-303-092014',
    '220kV-TR_主变_Obj3d66-9734994-303-092015',
    '220kV-TR_主变_Obj3d66-9734994-303-092016',
    '220kV-TR_主变_Obj3d66-9734994-303-092017',
    '220kV-TR_主变_Obj3d66-9734994-303-092018',
    '220kV-TR_主变_Obj3d66-9734994-303-092019',
    '220kV-TR_主变_Obj3d66-9734994-303-092020',
    '220kV-TR_主变_Obj3d66-9734994-303-092021',
    '220kV-TR_主变_Obj3d66-9734994-303-092022',
    '220kV-TR_主变_Obj3d66-9734994-303-092023',
    '220kV-TR_主变_Obj3d66-9734994-303-092024',
    '220kV-TR_主变_Obj3d66-9734994-303-092025',
    '220kV-TR_主变_Obj3d66-9734994-303-092026',
    '220kV-TR_主变_Obj3d66-9734994-303-092027',
    '220kV-TR_主变_Obj3d66-9734994-303-092028',
    '220kV-TR_主变_Obj3d66-9734994-303-092029',
    '220kV-TR_主变_Obj3d66-9734994-303-092030',
    '220kV-TR_主变_Obj3d66-9734994-303-092031',
    '220kV-TR_主变_Obj3d66-9734994-303-092032',
    '220kV-TR_主变_Obj3d66-9734994-228-235',
    '220kV-TR_主变_Obj3d66-9734994-228-235001',
    '220kV-TR_主变_Obj3d66-9734994-228-235002',
    '220kV-TR_主变_Obj3d66-9734994-16-771',
    '220kV-TR_主变_Obj3d66-10338871-2-997',
    '220kV-TR_主变_Obj3d66-10338871-2-997001',
    '220kV-TR_主变_Obj3d66-10338871-2-997002',
    '220kV-TR_主变_ground2',
    '220kV-TR_主变_Cylinder',
    '220kV-TR_主变_Cylinder001',
    '220kV-TR_主变_Cylinder002',
    '220kV-TR_主变_Cylinder003',
    '220kV-TR_主变_Cylinder004',
    '220kV-TR_主变_Cylinder005',
    '220kV-TR_主变_Cylinder006',
    '220kV-TR_主变_Cylinder007',
    '220kV-TR_主变_Cylinder008',
    '220kV-TR_主变_Cylinder009',
    '220kV-TR_主变_Cylinder010',
    '220kV-TR_主变_Cylinder011',
    '220kV-TR_主变_Cylinder012',
    '220kV-TR_主变_Cylinder013',
    '220kV-TR_主变_Cylinder014',
    '220kV-TR_主变_Cylinder015',
    '220kV-TR_主变_Cylinder016',
    '220kV-TR_主变_Cylinder017',
    '220kV-TR_主变_Cylinder018',
    '220kV-TR_主变_Cylinder019',
    '220kV-TR_主变_Cylinder020',
    '220kV-TR_主变_Cylinder021',
    '220kV-TR_主变_Cylinder022',
    '220kV-TR_主变_Cylinder023',
    '220kV-TR_主变_Cylinder024',
    '220kV-TR_主变_Cylinder025',
    '220kV-TR_主变_Cylinder026',
    '220kV-TR_主变_Cylinder027',
    '220kV-TR_主变_Cylinder028',
    '220kV-TR_主变_Cylinder029',
    '220kV-TR_主变_Cylinder030',
    '220kV-TR_主变_Cylinder031',
    '220kV-TR_主变_Cylinder032',
    '220kV-TR_主变_Cylinder033',
    '220kV-TR_主变_Cylinder034',
    '220kV-TR_主变_Cylinder035',
    '220kV-TR_主变_Cylinder036',
    '220kV-TR_主变_Cylinder037',
    '220kV-TR_主变_Cylinder038',
    '220kV-TR_主变_Cylinder039',
    '220kV-TR_主变_Cylinder040',
    '220kV-TR_主变_Cylinder041',
    '220kV-TR_主变_Cylinder042',
    '220kV-TR_主变_Cylinder043',
    '220kV-TR_主变_Cylinder044',
    '220kV-TR_主变_Cylinder045',
    '220kV-TR_主变_Cylinder046',
    '220kV-TR_主变_Cylinder047',
    '220kV-TR_主变_Cylinder048',
    '220kV-TR_主变_Cylinder049',
    '220kV-TR_主变_Cylinder050',
    '220kV-TR_主变_Cylinder051',
    '220kV-TR_主变_Cylinder052',
    '220kV-TR_主变_Cylinder053',
    '220kV-TR_主变_Cylinder054',
    '220kV-TR_主变_Cylinder055',
    '220kV-TR_主变_Cylinder056',
    '220kV-TR_主变_Cylinder057',
    '220kV-TR_主变_Cube',
    '220kV-TR_主变_Cube001',
    '220kV-TR_主变_Cube002',
    '220kV-TR_主变_Cube003',
    '220kV-TR_主变_Cube004',
    '220kV-TR_主变_Cube005',
    '220kV-TR_主变_Cube006',
    '220kV-TR_主变_Cube007',
    '220kV-TR_主变_Cube008',
    '220kV-TR_主变_Cube009',
    '220kV-TR_主变_Cube010',
    '220kV-TR_主变_Cube011',
    '220kV-TR_主变_Cube012',
    '220kV-TR_主变_Cube013',
    '220kV-TR_主变_Cube014',
    '220kV-TR_主变_BézierCurve',
    '220kV-TR_主变_BézierCurve001',
    '220kV-TR_主变_BézierCurve002',
    '220kV-TR_主变_BézierCurve003',
    '220kV-TR_主变_BézierCurve004',
    '220kV-TR_主变_BézierCurve005',
    '220kV-TR_主变_BézierCurve006',
    '220kV-TR_主变_BézierCurve007',
    '220kV-TR_主变_box_01',
    '220kV-TR_主变_box',
  ],
});

setApp({
  sensorList: [
    {
      materialName: '110kV-GIS_104_CB_PDS-S500-AE',
      productId: 'pdstars-uhf-g5000',
      sensorName: 'CH1',
      sensorId: '058409b3ac11411fbf45c83d6beeaf3b',
      displayTitle: 'TOP-3放电幅值',
      displayContent: '-38dBm',
    },
  ],
});

// 场景配置 Demo 组件
function SceneConfigDemo() {
  const [pickResult, setPickResult] = useState<any>(null);
  const [showSceneConfigUI, setShowSceneConfigUI] = useState(true);

  // 处理拾取结果
  const handlePickingResult = useCallback((result: any) => {
    setPickResult(result);
    console.log('📍 拾取结果:', result);
  }, []);

  // 获取当前视角参数
  const handleGetCurrentViewState = useCallback(() => {
    if (globalData.app && globalData.app.getCurrentViewState) {
      const viewState = globalData.app.getCurrentViewState();
      console.log('📷 当前视角参数:', viewState);

      // 复制到剪贴板
      const viewStateText = JSON.stringify(viewState, null, 2);
      navigator.clipboard.writeText(viewStateText).then(() => {
        alert('视角参数已复制到剪贴板:\n' + viewStateText);
      });
    } else {
      console.log('API 尚未初始化，请等待模型加载完成后再试');
    }
  }, []);

  // 导出场景配置
  const handleExportConfig = useCallback(() => {
    if (globalData.app?.sceneConfigAPI?.exportConfig) {
      const config = globalData.app.sceneConfigAPI.exportConfig();
      console.log('📦 场景配置:', config);

      // 下载配置文件
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scene-config-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  // 保存书签
  const handleSaveBookmark = useCallback(() => {
    if (globalData.app?.sceneConfigAPI?.saveBookmark) {
      const name = prompt(
        '请输入书签名称:',
        `书签 ${new Date().toLocaleTimeString()}`
      );
      if (name) {
        const bookmark = globalData.app.sceneConfigAPI.saveBookmark(name);
        console.log('🔖 书签已保存:', bookmark);
      }
    }
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* 顶部控制栏 */}
      <header
        style={{
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ color: '#fff', pointerEvents: 'auto' }}>
          <h1 style={{ margin: 0, fontSize: 18 }}>PDS 3D 场景配置系统</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, opacity: 0.8 }}>
            集成射线拾取、相机书签、光影预设
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, pointerEvents: 'auto' }}>
          <button
            onClick={() => setShowSceneConfigUI(!showSceneConfigUI)}
            style={{
              padding: '8px 16px',
              backgroundColor: showSceneConfigUI ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            {showSceneConfigUI ? '隐藏配置UI' : '显示配置UI'}
          </button>

          <button
            onClick={handleSaveBookmark}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            🔖 保存书签
          </button>

          <button
            onClick={handleGetCurrentViewState}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            📷 获取视角
          </button>

          <button
            onClick={handleExportConfig}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            📦 导出配置
          </button>
        </div>
      </header>

      {/* 主视图区域 */}
      <main style={{ flex: 1, position: 'relative' }}>
        <GLTFViewer
          decalConfigs={decalConfigs}
          modelList={[sampleModel]}
          width='100%'
          height='100%'
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          scale={1}
          cameraPosition={[
            -15.389094920454996, 8.092493707165996, 16.024169959225027,
          ]}
          cameraTarget={[
            -4.60746852203857, 2.882832258799233, 6.392122130315743,
          ]}
          backgroundColor='black'
          enableShadows={true}
          enableControls={true}
          autoRotate={false}
          autoRotateSpeed={2}
          ambientLightIntensity={0.2}
          directionalLightIntensity={0.5}
          directionalLightPosition={[10, 10, 5]}
          onLoad={() => console.log('✅ 模型加载完成')}
          onProgress={progress => console.log(`📊 加载进度: ${progress}%`)}
          onError={error => console.error('❌ 加载错误:', error)}
          deviceLabelConfig={{
            enabled: true,
            globalVisible: true,
            autoPosition: true,
            defaultOffset: [0, 0.5, 0],
            positionMode: 'robust-bbox',
            labels: deviceLabels,
          }}
        />

        {/* 场景配置 UI 层 */}
        {showSceneConfigUI && (
          <SceneConfigUILayer onPickingResult={handlePickingResult} />
        )}

        {/* 拾取结果显示 */}
        {pickResult && (
          <div
            style={{
              position: 'absolute',
              bottom: 80,
              left: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              borderRadius: 8,
              padding: 16,
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: 12,
              maxWidth: 300,
              zIndex: 1000,
            }}
          >
            <div
              style={{ fontWeight: 'bold', marginBottom: 8, color: '#4ade80' }}
            >
              🎯 最近拾取结果
            </div>
            <div>对象: {pickResult.object?.name || '(未命名)'}</div>
            <div>ID: {pickResult.object?.id}</div>
            <div>
              世界坐标:
              {pickResult.worldPosition?.x?.toFixed(2)},
              {pickResult.worldPosition?.y?.toFixed(2)},
              {pickResult.worldPosition?.z?.toFixed(2)}
            </div>
            <div>距离: {pickResult.distance?.toFixed(3)}m</div>
          </div>
        )}
      </main>

      {/* 底部说明 */}
      <footer
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '10px 20px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          color: '#fff',
          fontSize: 12,
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        <div style={{ opacity: 0.8 }}>
          💡 提示: 点击场景中的对象可查看拾取信息 | 使用左侧面板切换光影预设 |
          使用右侧面板管理视角书签
        </div>
      </footer>
    </div>
  );
}

// 场景配置 UI 层组件
function SceneConfigUILayer({
  onPickingResult,
}: {
  /* eslint-disable no-unused-vars */
  onPickingResult: (result: any) => void;
  /* eslint-enable no-unused-vars */
}) {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [lightingPresets, setLightingPresets] = useState<any[]>([]);
  const [activePresetId, setActivePresetId] = useState('default-daylight');

  // 刷新书签列表
  const refreshBookmarks = useCallback(() => {
    if (globalData.app?.sceneConfigAPI?.getBookmarks) {
      setBookmarks(globalData.app.sceneConfigAPI.getBookmarks());
    }
  }, []);

  // 刷新光影预设
  const refreshPresets = useCallback(() => {
    if (globalData.app?.sceneConfigAPI?.getLightingPresets) {
      setLightingPresets(globalData.app.sceneConfigAPI.getLightingPresets());
    }
  }, []);

  // 恢复书签
  const restoreBookmark = useCallback((id: string) => {
    if (globalData.app?.sceneConfigAPI?.restoreBookmark) {
      globalData.app.sceneConfigAPI.restoreBookmark(id, { duration: 1000 });
    }
  }, []);

  // 应用光影预设
  const applyPreset = useCallback((id: string) => {
    if (globalData.app?.sceneConfigAPI?.applyLightingPreset) {
      const success = globalData.app.sceneConfigAPI.applyLightingPreset(id);
      if (success) {
        setActivePresetId(id);
      }
    }
  }, []);

  // 删除书签
  const removeBookmark = useCallback(
    (id: string) => {
      if (globalData.app?.sceneConfigAPI?.removeBookmark) {
        globalData.app.sceneConfigAPI.removeBookmark(id);
        refreshBookmarks();
      }
    },
    [refreshBookmarks]
  );

  // 初始刷新
  useEffect(() => {
    refreshBookmarks();
    refreshPresets();
  }, [refreshBookmarks, refreshPresets]);

  return (
    <>
      {/* 光影预设面板 - 左上 */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          borderRadius: 8,
          padding: 16,
          minWidth: 200,
          color: '#fff',
          zIndex: 1000,
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: 14 }}>💡 光影预设</h3>
        <div style={{ maxHeight: 250, overflowY: 'auto' }}>
          {lightingPresets.map(preset => (
            <div
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              style={{
                padding: '8px 12px',
                marginBottom: 6,
                backgroundColor:
                  preset.id === activePresetId
                    ? 'rgba(0, 123, 255, 0.4)'
                    : 'rgba(255, 255, 255, 0.1)',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 13,
                border:
                  preset.id === activePresetId
                    ? '1px solid #007bff'
                    : '1px solid transparent',
              }}
            >
              {preset.name}
              {preset.id === activePresetId && (
                <span style={{ marginLeft: 8 }}>✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 相机书签面板 - 右上 */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          right: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          borderRadius: 8,
          padding: 16,
          minWidth: 220,
          color: '#fff',
          zIndex: 1000,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 14 }}>🔖 视角书签</h3>
          <button
            onClick={refreshBookmarks}
            style={{
              padding: '4px 8px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 4,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            刷新
          </button>
        </div>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {bookmarks.length === 0 ? (
            <div style={{ color: '#888', fontSize: 12, padding: '10px 0' }}>
              暂无书签，点击"保存书签"创建
            </div>
          ) : (
            bookmarks.map(bookmark => (
              <div
                key={bookmark.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                  marginBottom: 6,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 4,
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, fontSize: 12 }}>
                  <div style={{ fontWeight: 'bold' }}>{bookmark.name}</div>
                  <div style={{ color: '#888', fontSize: 10 }}>
                    {new Date(bookmark.createdAt).toLocaleString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <button
                  onClick={() => restoreBookmark(bookmark.id)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#28a745',
                    border: 'none',
                    borderRadius: 4,
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  恢复
                </button>
                <button
                  onClick={() => removeBookmark(bookmark.id)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#dc3545',
                    border: 'none',
                    borderRadius: 4,
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  删除
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 拾取提示 - 左下 */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: 8,
          padding: '10px 16px',
          color: '#fff',
          fontSize: 12,
          zIndex: 1000,
          cursor: 'crosshair',
        }}
        onClick={e => {
          // 执行拾取
          if (globalData.app?.sceneConfigAPI?.pick) {
            const result = globalData.app.sceneConfigAPI.pick(
              e.clientX,
              e.clientY
            );
            if (result) {
              onPickingResult(result);
            } else {
              console.log('未拾取到对象，点击坐标:', e.clientX, e.clientY);
            }
          } else {
            console.log('sceneConfigAPI.pick 不可用');
          }
        }}
      >
        🖱️ 点击场景中的对象查看拾取信息
      </div>
    </>
  );
}

// 渲染应用
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Leva />
    <SceneConfigDemo />
  </StrictMode>
);
