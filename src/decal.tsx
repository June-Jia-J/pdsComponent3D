/*
 * @Author: jiajing(jiajing@pdstars.com)
 * @Date: 2025-08-04 14:41:07
 * @LastEditTime: 2025-08-21 13:53:10
 * @Description: 贴花系统演示 - 支持动态加载、更新和删除贴花，包含联动状态管理和自动可见性控制
 * @Version: v2.2.1
 * 
 * 修订历史:
 * v2.0.0 - 基础贴花系统，支持动态加载、更新、删除和联动状态管理
 * v2.1.0 - 新增自动贴花可见性控制，根据模型可见状态自动执行贴花操作
 * v2.2.0 - 新增实时监听 visibleModels 变化，动态响应模型可见性状态变化
 * v2.2.1 - 修复空数组变化检测问题，确保模型不可见时能正确执行贴花删除操作
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
import { DecalType } from './components/Decal/DecalManager';

// // 创建一个示例GLTF模型URL（使用一个公开的3D模型）
// const sampleModelUrl = model5.url;

const sampleModel = model7 as ModelFile;

// 联动状态管理
const linkageStates = [
  {
    id: 1,
    name: '开关开启状态',
    switchState: 1, // 开关状态：1-开，2-关
    signalLampColor: '#2EFF58', // 信号灯颜色：绿色表示亮
    ammeterValue: 0.0, // 电流表值
    decalValue: '0.0', // 数值贴花值
    decalColor: '#2EFF58', // 数值贴花颜色
  },
  {
    id: 2,
    name: '开关关闭状态',
    switchState: 2, // 开关状态：1-开，2-关
    signalLampColor: 'gray', // 信号灯颜色：灰色表示灭
    ammeterValue: 10.1, // 电流表值
    decalValue: '10.1', // 数值贴花值
    decalColor: '#2EFF58', // 数值贴花颜色
  },
];

// 设置全局应用配置
setApp({
  publicPath: './public',
});

setApp({
  focusMonitorModelNames: ['110kV-GIS_104_CB_PDS-S500-AE'],
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

const App = () => {
  // 贴花管理状态
  const [isDecalsLoaded, setIsDecalsLoaded] = useState(false);
  const [currentDecalCount, setCurrentDecalCount] = useState(0);

  // 联动状态管理
  const [currentState, setCurrentState] = useState(linkageStates[1]);

  // 获取当前视角参数的处理函数
  const handleGetCurrentViewState = () => {
    if (globalData.app && globalData.app.getCurrentViewState) {
      const viewState = globalData.app.getCurrentViewState();
      console.log('当前视角参数:', viewState);
    } else {
      console.log('API 尚未初始化，请等待模型加载完成后再试');
    }
  };

  // 加载贴花 - 使用decalManager的addDecal方法
  const handleLoadDecals = useCallback(() => {
    if (!isDecalsLoaded && globalData.app?.decalManager) {
      console.log('🔄 开始加载贴花...');
      
      try {
        // 使用decalManager的addDecal方法添加贴花
        decalConfigs.forEach(decalConfig => {
          globalData.app.decalManager.addDecal(decalConfig);
        });
        
        setIsDecalsLoaded(true);
        setCurrentDecalCount(decalConfigs.length);
        console.log('✅ 贴花已加载，数量:', decalConfigs.length);
      } catch (error) {
        console.error('❌ 加载贴花失败:', error);
      }
    }
  }, [isDecalsLoaded]);

  // 删除贴花 - 使用decalManager的clearDecals方法
  const handleRemoveDecals = useCallback(() => {
    if (globalData.app?.decalManager) {
      console.log('🗑️ 开始删除贴花...');
      
      try {
        // 使用decalManager的clearDecals方法清除所有贴花
        globalData.app.decalManager.clearDecals();
        
        setIsDecalsLoaded(false);
        setCurrentDecalCount(0);
        console.log('✅ 贴花已删除');
      } catch (error) {
        console.error('❌ 删除贴花失败:', error);
      }
    }
  }, []);

  // 切换联动状态 - 手动触发
  const toggleLinkageState = useCallback(() => {
    setCurrentState(prevState => {
      const newIndex = prevState.id === 1 ? 2 : 1;
      const newState = linkageStates.find(state => state.id === newIndex);
      if (newState) {
        console.log(
          `🔄 切换到状态: ${newState.name} (索引: ${prevState.id} → ${newIndex})`
        );
        return newState;
      }
      return prevState; // 防止意外情况
    });
  }, []);

  // 应用联动状态到贴花 - 使用decalManager的updateDecal方法
  const applyLinkageState = useCallback((state: any) => {
    if (!globalData.app?.decalManager) {
      console.log('⚠️ decalManager 未初始化');
      return;
    }

    console.log('🔄 开始应用联动状态:', state.name);
    let newDecalConfigs = [...decalConfigs]
    try {
      // 遍历贴花配置，使用decalManager的updateDecal方法更新每个贴花
      newDecalConfigs.forEach(decal => {
        let updateData = {}
  
        switch (decal.type) {
          case DecalType.TEXT:
            if (decal.options?.textConfig) {
              updateData = {
                text: state.decalValue,
                textConfig: {
                  ...decal.options.textConfig,
                  color: state.decalColor,
                },
              }
              console.log(
                '🔄 更新文字贴花:',
                decal.id,
                state.decalValue,
                state.decalColor,
              )
            }
            break
  
          case DecalType.AMMETER:
            if (decal.options?.ammeterConfig) {
              updateData = {
                  ...decal.options.ammeterConfig,
                  value: state.ammeterValue,
              }
              console.log('🔄 更新电流表贴花:', decal.id, state.ammeterValue)
            }
            break
  
          case DecalType.SWITCH:
            if (decal.options?.switchConfig) {
              updateData = {
                  ...decal.options.switchConfig,
                  state: state.switchState,
              }
              console.log('🔄 更新开关贴花:', decal.id, state.switchState)
            }
            break
  
          case DecalType.SIGNAL_LAMP:
            if (decal.options?.signalLampConfig) {
              updateData = {
                  ...decal.options.signalLampConfig,
                  color: state.signalLampColor,
              }
              console.log('🔄 更新信号灯贴花:', decal.id, state.signalLampColor)
            }
            break
        }
  
        // 调用decalManager的updateDecal方法
        if (Object.keys(updateData).length > 0) {
          globalData.app.decalManager.updateDecal(decal.id, updateData, decal)
        }
      })

      console.log('✅ 联动状态应用完成');
    } catch (error) {
      console.error('❌ 更新贴花失败:', error);
    }
  }, []);

  // 手动更新贴花 - 触发状态切换并应用
  const handleManualUpdate = useCallback(() => {
    if (!isDecalsLoaded) {
      console.log('⚠️ 请先加载贴花');
      return;
    }

    console.log('🔄 手动更新贴花');
    // 立即执行一次状态切换
    toggleLinkageState();
  }, [isDecalsLoaded, toggleLinkageState]);

  // 监听联动状态变化，自动应用状态
  useEffect(() => {
    if (isDecalsLoaded && currentDecalCount > 0) {
      console.log('🔄 应用联动状态:', currentState.name);
      applyLinkageState(currentState);
    }
  }, [
    currentState,
    isDecalsLoaded,
    currentDecalCount,
    applyLinkageState,
  ]);

  // 调试：监听状态变化
  useEffect(() => {
    console.log('🔄 状态已变化:', {
      currentState: currentState.name,
      stateId: currentState.id,
    });
  }, [currentState]);
  // 监听 visibleModels 变化
  useEffect(() => {
    
    // 创建定时器，定期检查 visibleModels 变化
    const intervalId = setInterval(() => {
      if (!globalData.app?.decalManager?.getVisibleModels) return;
      try {
        const currentVisibleModels = globalData.app.decalManager.getVisibleModels();
        const currentHasModels = currentVisibleModels.length > 0;
        // 根据可见模型状态执行相应操作
        if (currentHasModels) {
          
          // 依次执行"加载贴花"和"手动更新贴花"操作
          if (!isDecalsLoaded) {
            handleLoadDecals();
            
            // 等待贴花加载完成后，执行手动更新
            setTimeout(() => {
              if (isDecalsLoaded) {
                handleManualUpdate();
              }
            }, 0);
          } else {
            handleManualUpdate();
          }
        } else {
          // 从有模型变为无模型时，执行删除操作
          
          // 执行"删除贴花"操作
          if (isDecalsLoaded) {
            handleRemoveDecals();
          }
        } 
      } catch (error) {
        console.error('❌ 监听 visibleModels 时发生错误:', error);
      }
    }, 2000); // 每2秒检查一次，平衡响应性和性能
    
    // 清理定时器
    return () => {
      console.log('🔄 停止监听 visibleModels 变化');
      clearInterval(intervalId);
    };
  }, [globalData.app?.decalManager, isDecalsLoaded, handleLoadDecals, handleManualUpdate, handleRemoveDecals]);
  return (
    <StrictMode>
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
            // backgroundColor: "#f0f0f0",
            // borderBottom: "1px solid #ddd",
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
          }}
        >
          {/* <div>
            <h1>PDS 3D Component Demo</h1>
            <p>GLTF Viewer 组件调试环境</p>
          </div> */}

          {/* 贴花控制按钮组 */}
          <div style={{ display: 'flex', gap: '10px', marginRight: '20px' }}>
            <button
              onClick={handleLoadDecals}
              disabled={isDecalsLoaded}
              style={{
                padding: '10px 20px',
                backgroundColor: isDecalsLoaded ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: isDecalsLoaded ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              {isDecalsLoaded ? '贴花已加载' : '加载贴花'}
            </button>

            <button
              onClick={handleManualUpdate}
              disabled={!isDecalsLoaded}
              style={{
                padding: '10px 20px',
                backgroundColor: !isDecalsLoaded ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: !isDecalsLoaded ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              手动更新贴花
            </button>

            <button
              onClick={handleRemoveDecals}
              disabled={!isDecalsLoaded}
              style={{
                padding: '10px 20px',
                backgroundColor: !isDecalsLoaded ? '#6c757d' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: !isDecalsLoaded ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              删除贴花
            </button>
          </div>

          {/* 状态显示 */}
          {isDecalsLoaded && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                marginRight: '20px',
                color: 'white',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              }}
            >
              <div>当前状态: {currentState.name}</div>
              <div>贴花数量: {currentDecalCount}</div>
            </div>
          )}

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
            获取当前视角参数
          </button>
        </header>

        <main style={{ flex: 1 }}>
          <GLTFViewer
            modelList={[sampleModel]}
            width='100%'
            height='100%'
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={1}
            cameraPosition={[
              5.370783096106912, 3.1246217243017353, 4.176256998989563,
            ]}
            cameraTarget={[
              6.745322597151732, 2.937971196900703, 4.225282052373053,
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
            // boundingBoxConfig={{
            //   enabled: true,
            //   showBox: true,
            //   showCenter: true,
            //   boxColor: "#00ff00",
            //   centerColor: "#ff0000",
            //   centerSize: 0.1,
            //   lineWidth: 2,
            // }}
            deviceLabelConfig={{
              enabled: true,
              globalVisible: true,
              autoPosition: true,
              defaultOffset: [0, 0.5, 0],
              positionMode: 'robust-bbox', // 使用新的稳定计算模式 | 备用: 'bbox-center'
              labels: deviceLabels,
            }}
            // cordonConfig={[
            //   {
            //     enabled: true,
            //     areaModelNames: globalData.app.focusModelNames.filter(item => item.startsWith("110kV-GIS")), // 区域模型名称数组
            //     distance: 0.6, // 警戒线距离模型边缘的距离
            //     color: "rgba(255, 0, 0, 1)", // 警戒线颜色
            //     lineWidth: 2, // 警戒线宽度
            //     lineCount: 10, // 警戒线行数
            //     lineSpacing: 0.2, // 警戒线间距
            //     visible: true, // 是否可见
            //     entryPoint: [0.8, 0.1, 9.6],
            //   }
            // ]}
          />
        </main>
      </div>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
