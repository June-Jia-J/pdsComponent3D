import { useState, FC, useCallback, useRef, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import globalData from '@/store/globalData';
import { Box3, Object3D, Vector3 } from 'three';
import { Html } from '@react-three/drei';

export interface StatusItem {
  id: string;
  label: string;
  value?: string;
  icon?: string;
  unit?: string;
  color?: string;
  type: 'panel' | 'circle';
  onClick?: () => void;
}

export interface DeviceStatusPanelProps {
  leftItems?: StatusItem[];
  rightItems?: StatusItem[];
  selectedId?: string;
  model?: Object3D;
  // eslint-disable-next-line no-unused-vars
  onItemClick?: (id: string) => void;
  onClose?: () => void;
}

const itemSize = 80;
const itemSpacing = 10;

const StatusPanelContainer = styled.div<{
  displayState: 'none' | 'block';
  position: 'left' | 'right';
}>`
  position: absolute;
  display: ${props => props.displayState || 'block'};
  ${props => (props.position === 'left' ? 'left: -180px' : 'right: -110px')};
  top: 50%;
  transform: translateY(-50%);
  width: ${props => (props.position === 'left' ? '140px' : '80px')};
  height: auto;
  z-index: 1000;
  transition: all 0.3s ease;
`;

const ItemContainer = styled.div<{
  type: 'panel' | 'circle';
  isSelected?: boolean;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: ${itemSize}px;
  height: ${itemSize}px;
  margin-bottom: ${itemSpacing}px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  line-height: 1.4;
  border: ${props =>
    props.isSelected ? '4px solid rgba(255, 255, 255, 1)' : 'none'};
  transform: ${props => (props.isSelected ? 'scale(1.02)' : 'scale(1)')};

  ${props =>
    props.type === 'panel'
      ? `
        background: ${props.isSelected ? 'rgba(29, 83, 86, 0.85)' : 'rgba(52, 56, 59, 0.9)'};
        border-radius: 1px;
        padding: 8px;
        ${!props.isSelected ? 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);' : ''}
      `
      : `
        background: ${props.isSelected ? 'rgba(29, 83, 86, 0.85)' : 'rgba(52, 56, 59, 0.9)'};
        border-radius: 50%;
        ${!props.isSelected ? 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);' : ''}
      `}

  &:hover {
    transform: ${props => (props.isSelected ? 'scale(1.02)' : 'scale(1.05)')};
    ${props =>
      !props.isSelected &&
      `
      border-color: rgba(0, 160, 233, 0.8);
      box-shadow: 0 6px 16px rgba(0, 160, 233, 0.3);
    `}
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const LeftPanelRow = styled.div`
  display: flex;
  margin-bottom: ${itemSpacing}px;
  justify-content: flex-end;

  &:last-child {
    margin-bottom: 0;
  }
`;

const LeftPanelItem = styled.div<{ hasRightBorder?: boolean }>`
  position: relative;
  border-right: 1px solid rgba(255, 255, 255, 0.4);

  ${props =>
    props.hasRightBorder &&
    `
    border-right: 2px solid rgba(43, 255, 0, 0.8);
  `}
`;

const ItemIcon = styled.img<{ isActive: boolean }>`
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
`;

const ItemLabel = styled.div<{
  isActive: boolean;
  type: 'panel' | 'circle';
  isSelected?: boolean;
}>`
  font-size: ${props => (props.type === 'panel' ? '14px' : '18px')};
  color: ${props => {
    if (props.isSelected) return '#0be4de'; // 选中状态：蓝绿色
    return props.isActive ? '#0be4de' : '#FFFFFF'; // 悬停状态：蓝绿色，默认：白色
  }};
  text-align: center;
  white-space: nowrap;
  transition: all 0.3s ease;
  text-shadow: ${props =>
    props.isActive || props.isSelected
      ? '0 0 8px rgba(0, 160, 233, 0.5)'
      : 'none'};
  font-weight: ${props => (props.isActive || props.isSelected ? '600' : '400')};
`;

const ItemValue = styled.div<{
  isActive: boolean;
  color?: string;
  isSelected?: boolean;
}>`
  font-size: 12px;
  color: ${props => {
    if (props.isSelected) return '#0be4de'; // 选中状态：蓝绿色
    return props.color || (props.isActive ? '#0be4de' : '#FFFFFF'); // 悬停状态：蓝绿色，默认：白色
  }};
  text-align: center;
  font-weight: 600;
  transition: all 0.3s ease;
  text-shadow: ${props =>
    props.isActive || props.isSelected
      ? '0 0 8px rgba(0, 160, 233, 0.5)'
      : 'none'};
`;

// const ItemUnit = styled.div<{ isActive: boolean }>`
//   font-size: 10px;
//   color: ${(props) => (props.isActive ? "#0be4de" : "#CCCCCC")};
//   text-align: center;
//   transition: all 0.3s ease;
// `;

const StatusPanel: FC<DeviceStatusPanelProps> = ({ onClose, model }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<globalThis.HTMLDivElement>(null);
  const [leftItems, setLeftItems] = useState<StatusItem[]>([]);
  const [rightItems, setRightItems] = useState<StatusItem[]>([]);
  const [containerDisplay, setContainerDisplay] = useState<'none' | 'block'>(
    'none'
  );
  const [selectedStatusId, setSelectedStatusId] = useState<string | null>('ae'); // 默认选中AE状态项

  // 默认左侧方形面板配置
  const defaultLeftItems = useMemo(() => {
    return [
      {
        id: 'battery',
        label: '电池电压',
        value: '3371',
        unit: 'mV',
        icon: `${globalData.app.publicPath}/images/statusPanel/electricity04.svg`,
        type: 'panel' as const,
        color: '#FFFFFF',
      },
      {
        id: 'signal',
        label: '信号强度',
        value: '-42',
        unit: 'dBm',
        icon: `${globalData.app.publicPath}/images/statusPanel/signal05.svg`,
        type: 'panel' as const,
        color: '#FFFFFF',
      },
      {
        id: 'snr',
        label: '信噪比',
        value: '7',
        unit: 'dB',
        icon: `${globalData.app.publicPath}/images/statusPanel/SNR.svg`,
        type: 'panel' as const,
        color: '#FFFFFF',
      },
    ];
  }, []);

  // 默认右侧圆形指示器配置
  const defaultRightItems = useMemo(() => {
    return [
      {
        id: 'ae',
        label: 'AE',
        value: '',
        // icon: `${globalData.app.publicPath}/images/ae.svg`,
        type: 'circle' as const,
        color: '#0be4de',
      },
      {
        id: 'tev',
        label: 'TEV',
        value: '',
        // icon: `${globalData.app.publicPath}/images/tev.svg`,
        type: 'circle' as const,
        color: '#FFFFFF',
      },
      {
        id: 'temperature',
        label: '温度',
        value: '35',
        unit: '°C',
        // icon: `${globalData.app.publicPath}/images/temperature.svg`,
        type: 'circle' as const,
        color: '#0be4de',
      },
    ];
  }, []);

  const handleItemClick = useCallback(
    (id: string) => {
      console.log('StatusPanel: 点击事件触发', { id, model, containerDisplay });

      // 如果点击的是已选中的项，则取消选中；否则选中该项
      if (selectedStatusId === id) {
        setSelectedStatusId(null);
        console.log(`StatusPanel: 取消选中状态项 "${id}"`);
      } else {
        setSelectedStatusId(id);
        console.log(`StatusPanel: 选中状态项 "${id}"`);
      }

      // 即使没有 selectedMonitorModel 也允许点击，只是记录日志
      if (model) {
        console.log('StatusPanel: 执行点击回调', { id, model });
        try {
          // 检查外部回调是否存在，如果不存在则使用默认处理
          if (globalData.app?.onStatusPanelClick) {
            globalData.app.onStatusPanelClick(id, model);
          } else {
            // 默认点击处理逻辑
            console.log(`StatusPanel: 默认处理点击事件 - ${id}`);
          }
          setSelectedId(id);
        } catch (error) {
          console.error('StatusPanel: 点击回调执行失败', error);
        }
      } else {
        // 即使没有选中模型，也提供基本的点击反馈
        console.log(`StatusPanel: 状态项 "${id}" 被点击（无选中模型）`);
      }

      // 添加点击反馈
      console.log(`StatusPanel: 状态项 "${id}" 被点击`);
    },
    [model, containerDisplay, selectedStatusId]
  );

  const handleMouseEnter = useCallback((id: string) => {
    setHoveredId(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  const closeHandler = useCallback(() => {
    // 先执行外部关闭回调
    if (onClose) {
      onClose();
    }

    globalData.app?.onStatusPanelClose?.();
  }, [onClose]);

  // 初始化数据
  // useEffect(() => {
  //   const newLeftItems = globalData.app?.getStatusPanelLeftItems?.(model) || [];
  //   const newRightItems =
  //     globalData.app?.getStatusPanelRightItems?.(model) || [];

  //   setLeftItems(newLeftItems.length > 0 ? newLeftItems : defaultLeftItems);
  //   setRightItems(newRightItems.length > 0 ? newRightItems : defaultRightItems);

  //   globalThis.setTimeout(() => {
  //     setContainerDisplay("block");
  //   }, 300);
  // }, [model, defaultLeftItems, defaultRightItems]);

  useEffect(() => {
    const newLeftItems = globalData.app?.getStatusPanelLeftItems?.(model) || [];
    const newRightItems =
      globalData.app?.getStatusPanelRightItems?.(model) || [];

    setLeftItems(newLeftItems.length > 0 ? newLeftItems : defaultLeftItems);
    setRightItems(newRightItems.length > 0 ? newRightItems : defaultRightItems);

    globalThis.setTimeout(() => {
      setContainerDisplay('block');
    }, 300);
    return () => {
      onClose?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 计算模型的包围盒和位置
  const calculateModelPosition = useMemo(() => {
    const box = model ? new Box3().setFromObject(model) : new Box3();
    const center = new Vector3();
    box.getCenter(center);

    // 获取模型的高度
    const size = new Vector3();
    box.getSize(size);

    // 返回模型中心位置和高度
    return {
      position: center,
      size: size,
    };
  }, [model]);

  const { position } = calculateModelPosition;

  // 渲染单个状态项
  const renderStatusItem = useCallback(
    (item: StatusItem) => {
      const isActive = selectedId === item.id || hoveredId === item.id;
      const isSelected = selectedStatusId === item.id; // 使用 selectedStatusId 判断选中状态

      return (
        <ItemContainer
          key={`${item.type}-${item.id}`}
          type={item.type}
          onClick={() => handleItemClick(item.id)}
          onMouseEnter={() => handleMouseEnter(item.id)}
          onMouseLeave={handleMouseLeave}
          isSelected={isSelected} // 传递选中状态
        >
          <ItemLabel
            isActive={isActive}
            type={item.type}
            isSelected={isSelected}
          >
            {item.label}
          </ItemLabel>
          {item.value && (
            <ItemValue
              isActive={isActive}
              color={item.color}
              isSelected={isSelected}
            >
              {item.value}
              {item.unit}
            </ItemValue>
          )}
          {/* {item.unit && (
            <ItemUnit isActive={isActive}>
              {item.unit}
            </ItemUnit>
          )} */}
          {item.icon && (
            <ItemIcon src={item.icon} alt={item.label} isActive={isActive} />
          )}
        </ItemContainer>
      );
    },
    [
      selectedId,
      hoveredId,
      handleItemClick,
      handleMouseEnter,
      handleMouseLeave,
      selectedStatusId,
    ]
  );

  useEffect(() => {
    return () => {
      closeHandler();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Html
      position={[position.x, position.y, position.z]}
      // center
      distanceFactor={5}
      zIndexRange={[50, 0]}
      style={{
        // pointerEvents: "none",
        transform: 'translate(-50%, -100%)',
        width: 0,
      }}
    >
      {/* 左侧方形面板 */}
      <StatusPanelContainer
        displayState={containerDisplay}
        position='left'
        ref={containerRef}
      >
        {/* 第一行：电池电压 */}
        {leftItems[0] && (
          <LeftPanelRow>
            <LeftPanelItem hasRightBorder={true}>
              {renderStatusItem(leftItems[0])}
            </LeftPanelItem>
          </LeftPanelRow>
        )}

        {/* 第二行：信号强度和信噪比并排 */}
        {leftItems[1] && leftItems[2] && (
          <LeftPanelRow>
            <LeftPanelItem>{renderStatusItem(leftItems[1])}</LeftPanelItem>
            <LeftPanelItem hasRightBorder={true}>
              {renderStatusItem(leftItems[2])}
            </LeftPanelItem>
          </LeftPanelRow>
        )}
      </StatusPanelContainer>

      {/* 右侧圆形指示器 */}
      <StatusPanelContainer displayState={containerDisplay} position='right'>
        {rightItems.map(item => renderStatusItem(item))}
      </StatusPanelContainer>
    </Html>
  );
};

export default StatusPanel;
