import React from 'react';
import StatusPanel from './index';
import globalData from '@/store/globalData';

// 示例：如何在HubModel组件中集成DeviceStatusPanel
const ExampleUsage: React.FC = () => {
  // 示例1：基础用法
  const basicUsage = () => {
    return (
      <StatusPanel
        onClose={() => {
          console.log('基础用法：关闭状态面板');
        }}
      />
    );
  };

  // 示例2：自定义配置
  const customUsage = () => {
    // 在globalData.app中配置自定义项
    if (globalData.app) {
      globalData.app.getStatusPanelLeftItems = () => [
        {
          id: "voltage",
          label: "电压",
          value: "220",
          unit: "V",
          icon: "/images/voltage.svg",
          type: "panel" as const,
          color: "#00FF00"
        },
        {
          id: "current",
          label: "电流",
          value: "5.2",
          unit: "A",
          icon: "/images/current.svg",
          type: "panel" as const,
          color: "#FFA500"
        },
        {
          id: "power",
          label: "功率",
          value: "1144",
          unit: "W",
          icon: "/images/power.svg",
          type: "panel" as const,
          color: "#FF0000"
        }
      ];

      globalData.app.getStatusPanelRightItems = () => [
        {
          id: "status",
          label: "状态",
          value: "正常",
          icon: "/images/status.svg",
          type: "circle" as const,
          color: "#00FF00"
        },
        {
          id: "alarm",
          label: "告警",
          value: "0",
          icon: "/images/alarm.svg",
          type: "circle" as const,
          color: "#00FF00"
        },
        {
          id: "maintenance",
          label: "维护",
          value: "需要",
          icon: "/images/maintenance.svg",
          type: "circle" as const,
          color: "#FFA500"
        }
      ];

      // 配置事件处理
      globalData.app.onStatusPanelClick = (id: string, selectedModel: any) => {
        console.log('自定义配置：点击了状态项:', id, '模型:', selectedModel);
        
        // 根据不同的ID执行不同的操作
        switch (id) {
          case 'voltage':
            console.log('显示电压详细信息');
            break;
          case 'current':
            console.log('显示电流详细信息');
            break;
          case 'power':
            console.log('显示功率详细信息');
            break;
          case 'status':
            console.log('显示设备状态详情');
            break;
          case 'alarm':
            console.log('显示告警信息');
            break;
          case 'maintenance':
            console.log('显示维护信息');
            break;
          default:
            console.log('未知的状态项:', id);
        }
      };

      globalData.app.onStatusPanelClose = () => {
        console.log('自定义配置：关闭状态面板');
      };
    }

    return (
      <StatusPanel
        onClose={() => {
          console.log('自定义配置：关闭状态面板');
        }}
      />
    );
  };

  // 示例3：动态数据更新
  const dynamicDataUsage = () => {
    // 模拟实时数据更新
    const updateStatusData = () => {
      if (globalData.app && globalData.app.getStatusPanelLeftItems) {
        const currentItems = globalData.app.getStatusPanelLeftItems();
        const updatedItems = currentItems.map((item: any) => ({
          ...item,
          value: Math.floor(Math.random() * 1000).toString()
        }));
        
        globalData.app.getStatusPanelLeftItems = () => updatedItems;
      }
    };

    // 每5秒更新一次数据
    const intervalId = globalThis.setInterval(updateStatusData, 5000);

    // 清理定时器
    return () => {
      globalThis.clearInterval(intervalId);
    };
  };

  return (
    <div>
      <h2>StatusPanel 使用示例</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>示例1：基础用法</h3>
        <button onClick={basicUsage}>显示基础状态面板</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>示例2：自定义配置</h3>
        <button onClick={customUsage}>显示自定义状态面板</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>示例3：动态数据更新</h3>
        <button onClick={dynamicDataUsage}>显示动态状态面板</button>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5' }}>
        <h4>使用说明：</h4>
        <ol>
          <li>点击按钮后会配置相应的状态面板</li>
          <li>在3D场景中选择模型后，状态面板会自动显示</li>
          <li>左侧显示方形面板，右侧显示圆形指示器</li>
          <li>点击状态项会触发相应的回调函数</li>
          <li>中央的关闭按钮可以关闭整个面板</li>
        </ol>
      </div>
    </div>
  );
};

export default ExampleUsage; 