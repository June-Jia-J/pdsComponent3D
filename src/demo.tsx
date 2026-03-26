/*
 * @Author: jiajing
 * @Date: 2025-08-04 14:41:07
 * @LastEditTime: 2025-08-19 16:32:25
 * @LastEditors: jiajing
 * @Description: 场景配置系统集成演示
 */
import { StrictMode, useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import GLTFViewer from './components/GLTFViewer';
import { model7, deviceLabels } from '../public/const.js';
import { Leva } from 'leva';
import { ModelFile } from '@/types';
import globalData, { setApp } from '@/store/globalData';
import { decalConfigs } from '../public/const';
import {
  SceneConfigProvider,
  SceneConfigPanel,
  SceneConfigBridge,
  useSceneConfig,
} from './components/SceneConfigManager';
import { SceneConfigAPI, LightingPreset } from '@/types/sceneConfig';

const sampleModel = model7 as ModelFile;

const handleGetCurrentViewState = () => {
  if (globalData.app && globalData.app.getCurrentViewState) {
    const viewState = globalData.app.getCurrentViewState();
    console.log('当前视角参数:', viewState);
  } else {
    console.log('API 尚未初始化，请等待模型加载完成后再试');
  }
};

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
    '220kV-TR_主变_box_01',
    '220kV-TR_主变_box',
    '220kV-TR_主变_BézierCurve007',
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

const SceneConfigDemo: React.FC = () => {
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [sceneApi, setSceneApi] = useState<SceneConfigAPI | null>(null);
  const [currentPreset, setCurrentPreset] = useState<string>('默认');
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [anchorCount, setAnchorCount] = useState(0);

  const handleCreateBookmark = useCallback(() => {
    if (!sceneApi) return;
    const bookmark = sceneApi.bookmarks.getCurrentViewAsBookmark(`视角 ${Date.now()}`);
    sceneApi.bookmarks.createBookmark(bookmark.name, bookmark);
    setBookmarkCount(sceneApi.bookmarks.getBookmarks().length);
    console.log('创建书签:', bookmark);
  }, [sceneApi]);

  const handleExportConfig = useCallback(() => {
    if (!sceneApi) return;
    const config = sceneApi.exportConfig();
    console.log('导出配置:', config);
    navigator.clipboard.writeText(config);
    alert('配置已复制到剪贴板');
  }, [sceneApi]);

  const handlePickModel = useCallback(() => {
    if (!sceneApi) return;
    const result = sceneApi.picking.pickModelByName('110kV-GIS_104_CB_PDS-S500-AE');
    if (result) {
      console.log('拾取结果:', result);
      sceneApi.picking.createAnchor(
        '设备锚点',
        result.worldPosition!,
        { businessId: 'device-001', modelName: result.object?.name }
      );
      setAnchorCount(sceneApi.picking.getAnchors().length);
    }
  }, [sceneApi]);

  useEffect(() => {
    if (sceneApi?.picking && sceneApi?.bookmarks) {
      setBookmarkCount(sceneApi.bookmarks.getBookmarks().length);
      setAnchorCount(sceneApi.picking.getAnchors().length);
    }
  }, [sceneApi]);

  return (
    <SceneConfigProvider
      autoSave={true}
      storageKey='pds-scene-config-demo'
    >
      <Leva />
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <header
          style={{
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            gap: '10px',
          }}
        >
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            style={{
              padding: '10px 20px',
              backgroundColor: showConfigPanel ? '#28a745' : '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {showConfigPanel ? '隐藏配置面板' : '场景配置'}
          </button>
          <button
            onClick={handleGetCurrentViewState}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            获取当前视角
          </button>
          <button
            onClick={handleCreateBookmark}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            保存书签 ({bookmarkCount})
          </button>
          <button
            onClick={handlePickModel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#fd7e14',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            创建锚点 ({anchorCount})
          </button>
          <button
            onClick={handleExportConfig}
            style={{
              padding: '10px 20px',
              backgroundColor: '#20c997',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            导出配置
          </button>
        </header>

        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '10px 15px',
            borderRadius: '5px',
            color: 'white',
            fontSize: '12px',
          }}
        >
          <div>当前光影预设: {currentPreset}</div>
          <div>书签数量: {bookmarkCount}</div>
          <div>锚点数量: {anchorCount}</div>
        </div>

        <main style={{ flex: 1 }}>
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
            onLoad={() => console.log('模型加载完成')}
            onProgress={progress => console.log(`加载进度: ${progress}%`)}
            onError={error => console.error('加载错误:', error)}
            deviceLabelConfig={{
              enabled: true,
              globalVisible: true,
              autoPosition: true,
              defaultOffset: [0, 0.5, 0],
              positionMode: 'robust-bbox',
              labels: deviceLabels,
            }}
          >
            <SceneConfigBridge
              onPresetChange={(preset: LightingPreset) => {
                setCurrentPreset(preset.name);
                console.log('光影预设切换:', preset.name);
              }}
            />
            <ApiBridge onApiReady={setSceneApi} />
          </GLTFViewer>
        </main>

        {showConfigPanel && (
          <SceneConfigPanel
            visible={showConfigPanel}
            onClose={() => setShowConfigPanel(false)}
          />
        )}
      </div>
    </SceneConfigProvider>
  );
};

const ApiBridge: React.FC<{
  onApiReady: (api: SceneConfigAPI) => void;
}> = ({ onApiReady }) => {
  const api = useSceneConfig();
  
  useEffect(() => {
    if (api.picking && api.bookmarks && api.lighting) {
      onApiReady(api);
    }
  }, [api, onApiReady]);
  
  return null;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SceneConfigDemo />
  </StrictMode>
);
