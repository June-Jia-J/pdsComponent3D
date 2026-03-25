import type { Meta, StoryObj } from '@storybook/react';
import GLTFViewer from '../components/GLTFViewer';
import { DeviceLabelConfig } from '../types';

const meta: Meta<typeof GLTFViewer> = {
  title: '3D Components/Device Labels',
  component: GLTFViewer,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    modelList: {
      control: 'object',
      description: 'GLTF模型文件列表',
    },
    deviceLabelConfig: {
      control: 'object',
      description: '设备标签配置',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 示例设备标签配置
const sampleDeviceLabels: DeviceLabelConfig[] = [
  {
    id: 'device-1',
    targetModelName: 'Sensor', // 假设模型中有名为 'Sensor' 的对象
    width: 2,
    height: 1,
    bgUrl: '/images/deviceNameplate.png',
    iconUrl: '/icons/defaultIcon.svg',
    labelList: [
      {
        property: '电压',
        value: '3.3',
        unit: 'V',
        labelPosition: { x: 10, y: 30 },
        propertyStyle: { color: '#fff', weight: 'bold' },
        valueStyle: { color: '#00ff00' },
        unitStyle: { color: '#ccc' },
      },
      {
        property: '电流',
        value: '0.5',
        unit: 'A',
        labelPosition: { x: 10, y: 50 },
        propertyStyle: { color: '#fff', weight: 'bold' },
        valueStyle: { color: '#ffff00' },
        unitStyle: { color: '#ccc' },
      },
      {
        property: '温度',
        value: '25',
        unit: '°C',
        labelPosition: { x: 10, y: 70 },
        propertyStyle: { color: '#fff', weight: 'bold' },
        valueStyle: { color: '#ff6600' },
        unitStyle: { color: '#ccc' },
      },
    ],
    onClick: (labelId: string, event: any) => {
      console.log('设备标签被点击:', labelId, event);
      window.alert(`设备 ${labelId} 被点击`);
    },
  },
  {
    id: 'device-2',
    position: [2, 1, 0], // 手动指定位置
    width: 1.5,
    height: 1,
    bgUrl: '/images/hexagon_blue.png',
    labelList: [
      {
        property: '状态',
        value: '正常',
        labelPosition: { x: 20, y: 40 },
        propertyStyle: { color: '#fff', weight: 'bold', size: '18px' },
        valueStyle: { color: '#00ff00', size: '18px' },
      },
    ],
  },
];

export const BasicDeviceLabels: Story = {
  args: {
    modelList: [
      {
        id: 'model-1',
        fileId: 'cgz44',
        url: '/Upload/Model/gltf/cgz44.gltf',
        format: 'gltf',
        size: 0,
        checksum: '',
      },
    ], // 使用项目中的示例模型
    width: '100%',
    height: 600,
    enableControls: true,
    autoRotate: false,
    backgroundColor: '#f0f0f0',
    deviceLabelConfig: {
      enabled: true,
      globalVisible: true,
      autoPosition: true,
      defaultOffset: [0, 1.5, 0],
      labels: sampleDeviceLabels,
    },
  },
};

// 新的统一配置示例
export const UnifiedDeviceConfig: Story = {
  args: {
    modelList: [
      {
        id: 'model-1',
        fileId: 'cgz44',
        url: '/Upload/Model/gltf/cgz44.gltf',
        format: 'gltf',
        size: 0,
        checksum: '',
      },
    ],
    width: '100%',
    height: 600,
    enableControls: true,
    autoRotate: false,
    backgroundColor: '#f0f0f0',
    deviceLabelConfig: {
      enabled: true,
      globalVisible: true,
      autoPosition: true,
      defaultOffset: [0, 1.5, 0],
      labels: sampleDeviceLabels,
    },
  },
};

export const CustomPositionLabels: Story = {
  args: {
    modelList: [
      {
        id: 'model-1',
        fileId: 'cgz44',
        url: '/Upload/Model/gltf/cgz44.gltf',
        format: 'gltf',
        size: 0,
        checksum: '',
      },
    ],
    width: '100%',
    height: 600,
    enableControls: true,
    autoRotate: false,
    backgroundColor: '#f0f0f0',
    deviceLabelConfig: {
      enabled: true,
      globalVisible: true,
      autoPosition: false,
      defaultOffset: [0, 1.5, 0],
      labels: [
        {
          id: 'custom-1',
          position: [0, 2, 0],
          width: 2,
          height: 1,
          labelList: [
            {
              property: '自定义位置',
              value: '标签',
              labelPosition: { x: 10, y: 30 },
              propertyStyle: { color: '#fff', weight: 'bold', size: '20px' },
              valueStyle: { color: '#ff0000', size: '20px' },
            },
          ],
        },
        {
          id: 'custom-2',
          position: [-2, 1, 1],
          width: 1.5,
          height: 0.8,
          labelList: [
            {
              property: '另一个',
              value: '标签',
              labelPosition: { x: 10, y: 25 },
              propertyStyle: { color: '#fff', weight: 'bold' },
              valueStyle: { color: '#0000ff' },
            },
          ],
        },
      ],
    },
  },
};

export const InteractiveLabels: Story = {
  args: {
    modelList: [
      {
        id: 'model-1',
        fileId: 'cgz44',
        url: '/Upload/Model/gltf/cgz44.gltf',
        format: 'gltf',
        size: 0,
        checksum: '',
      },
    ],
    width: '100%',
    height: 600,
    enableControls: true,
    autoRotate: false,
    backgroundColor: '#f0f0f0',
    deviceLabelConfig: {
      enabled: true,
      globalVisible: true,
      autoPosition: false,
      defaultOffset: [0, 1.5, 0],
      labels: [
        {
          id: 'interactive-1',
          position: [0, 2, 0],
          width: 2,
          height: 1,
          bgUrl: '/images/hexagon_green.png',
          iconUrl: '/icons/defaultIcon.svg',
          labelList: [
            {
              property: '点击',
              value: '我!',
              labelPosition: { x: 60, y: 40 },
              propertyStyle: { color: '#ffffff', weight: 'bold', size: '20px' },
              valueStyle: { color: '#ffffff', size: '20px' },
            },
          ],
          onClick: (labelId: string) => {
            window.alert(`交互标签 ${labelId} 被点击!`);
          },
        },
      ],
    },
  },
};

export const MultipleDeviceStatus: Story = {
  args: {
    modelList: [
      {
        id: 'model-1',
        fileId: 'cgz44',
        url: '/Upload/Model/gltf/cgz44.gltf',
        format: 'gltf',
        size: 0,
        checksum: '',
      },
    ],
    width: '100%',
    height: 600,
    enableControls: true,
    autoRotate: false,
    backgroundColor: '#f0f0f0',
    deviceLabelConfig: {
      enabled: true,
      globalVisible: true,
      autoPosition: false,
      defaultOffset: [0, 1.5, 0],
      labels: [
        {
          id: 'device-status-1',
          position: [-2, 2, 0],
          width: 2,
          height: 1.2,
          bgUrl: '/images/deviceNameplate.png',
          labelList: [
            {
              property: '设备A',
              value: '',
              labelPosition: { x: 20, y: 20 },
              propertyStyle: { color: '#ffffff', weight: 'bold', size: '18px' },
            },
            {
              property: '电压',
              value: '220',
              unit: 'V',
              labelPosition: { x: 20, y: 40 },
              propertyStyle: { color: '#fff' },
              valueStyle: { color: '#00ff00' },
              unitStyle: { color: '#ccc' },
            },
            {
              property: '电流',
              value: '10',
              unit: 'A',
              labelPosition: { x: 20, y: 55 },
              propertyStyle: { color: '#fff' },
              valueStyle: { color: '#ffff00' },
              unitStyle: { color: '#ccc' },
            },
            {
              property: '功率',
              value: '2.2',
              unit: 'kW',
              labelPosition: { x: 20, y: 70 },
              propertyStyle: { color: '#fff' },
              valueStyle: { color: '#ff6600' },
              unitStyle: { color: '#ccc' },
            },
          ],
        },
        {
          id: 'device-status-2',
          position: [2, 2, 0],
          width: 2,
          height: 1.2,
          bgUrl: '/images/deviceNameplate.png',
          labelList: [
            {
              property: '设备B',
              value: '',
              labelPosition: { x: 20, y: 20 },
              propertyStyle: { color: '#ffffff', weight: 'bold', size: '18px' },
            },
            {
              property: '状态',
              value: '离线',
              labelPosition: { x: 20, y: 40 },
              propertyStyle: { color: '#fff' },
              valueStyle: { color: '#ff0000' },
            },
            {
              property: '最后通信',
              value: '2023-12-01',
              labelPosition: { x: 20, y: 55 },
              propertyStyle: { color: '#cccccc', size: '12px' },
              valueStyle: { color: '#cccccc', size: '12px' },
            },
          ],
        },
      ],
    },
  },
};

// 调试循环问题修复
export const DebugClearLabelsLoop: Story = {
  args: {
    modelList: [
      {
        id: 'model-1',
        fileId: 'cgz44',
        url: '/Upload/Model/gltf/cgz44.gltf',
        format: 'gltf',
        size: 0,
        checksum: '',
      },
    ],
    width: '100%',
    height: 600,
    enableControls: true,
    autoRotate: false,
    backgroundColor: '#f0f0f0',
    deviceLabelConfig: {
      enabled: true,
      globalVisible: true,
      autoPosition: false,
      defaultOffset: [0, 1.5, 0],
      labels: [
        {
          id: 'debug-label',
          position: [0, 2, 0],
          width: 2.5,
          height: 1,
          bgUrl: '/images/deviceNameplate.png',
          labelList: [
            {
              property: '🐛',
              value: '调试标签',
              labelPosition: { x: 20, y: 25 },
              propertyStyle: { color: '#fff', weight: 'bold', size: '18px' },
              valueStyle: { color: '#00ff00', size: '18px' },
            },
            {
              property: '检查',
              value: '控制台日志',
              labelPosition: { x: 20, y: 45 },
              propertyStyle: { color: '#fff' },
              valueStyle: { color: '#ffff00' },
            },
            {
              property: '验证',
              value: '无循环调用',
              labelPosition: { x: 20, y: 60 },
              propertyStyle: { color: '#fff', size: '12px' },
              valueStyle: { color: '#ff6600', size: '12px' },
            },
          ],
        },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          '此示例用于验证 clearLabels 循环调用问题的修复。打开浏览器控制台查看是否有重复的清理调用。',
      },
    },
  },
};
