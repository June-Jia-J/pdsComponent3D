import { useState, FC, useCallback, useRef, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import { useAtom, useAtomValue } from 'jotai';
import { selectedModelAtom } from '@/atoms/selectModel';
import globalData from '@/store/globalData';
import { selectedIdAtom } from '@/atoms/rouletteModel';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  PieController,
  ChartOptions,
  ChartData,
} from 'chart.js';

// 注册Chart.js组件
ChartJS.register(ArcElement, Tooltip, Legend, PieController);

interface RouletteOption {
  id: string;
  label: string;
  icon?: string;
  onClick?: () => void;
}

interface ChartRouletteProps {
  options?: RouletteOption[];
  selectedId?: string;
  // eslint-disable-next-line no-unused-vars
  onSelect?: (id: string) => void;
  onClose?: () => void;
}

const containerWidth = 150;

const RouletteContainer = styled.div<{
  displayState: 'none' | 'block';
}>`
  position: relative;
  display: ${props => props.displayState || 'block'};
  transform: translate(-50%, -50%);
  width: ${containerWidth}px;
  height: ${containerWidth}px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
`;

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
`;

const Canvas = styled.canvas`
  width: 100% !important;
  height: 100% !important;
`;

const CloseButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: rgba(35, 35, 40, 1);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    background: rgba(255, 255, 255, 1);
  }

  &:before,
  &:after {
    content: '';
    position: absolute;
    width: 16px;
    height: 2px;
    background: rgba(35, 35, 40, 1);
    transition: all 0.3s ease;
  }

  &:before {
    transform: rotate(45deg);
  }

  &:after {
    transform: rotate(-45deg);
  }

  &:hover:before,
  &:hover:after {
    background: #00a0e9;
  }
`;

const OptionLabel = styled.div<{ isActive: boolean }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(52, 56, 59, 0.8);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: ${props => (props.isActive ? '#10CECA' : '#FFFFFF')};
  white-space: nowrap;
  transition: all 0.3s ease;
  transform: scale(${props => (props.isActive ? 1.1 : 1)});
  text-shadow: ${props =>
    props.isActive ? '0 0 10px rgba(0, 160, 233, 0.5)' : 'none'};
  z-index: ${props => (props.isActive ? 3 : 2)};
  pointer-events: none;
`;

const OptionIcon = styled.img<{ isActive: boolean }>`
  width: 16px;
  height: 16px;
  margin-right: 4px;
  transition: all 0.3s ease;
  transform: scale(${props => (props.isActive ? 1.1 : 1)});
  filter: ${props =>
    props.isActive
      ? `brightness(0) saturate(100%) invert(56%) sepia(83%) saturate(461%) hue-rotate(140deg) brightness(95%) contrast(101%)`
      : `brightness(0) saturate(100%) invert(100%)`};
`;

const ChartRoulette: FC<ChartRouletteProps> = ({ options = [], onClose }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useAtom(selectedModelAtom);
  const selectedId = useAtomValue(selectedIdAtom);
  const containerRef = useRef<globalThis.HTMLDivElement>(null);
  const canvasRef = useRef<globalThis.HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS<'pie'> | null>(null);
  const [containerDisplay, setContainerDisplay] = useState<'none' | 'block'>(
    'none'
  );

  const defaultOptions = [
    {
      id: 'monitoring',
      label: '监测数据',
      icon: `${globalData.app.publicPath}/images/monitoringData.svg`,
    },
    {
      id: 'compare',
      label: '数据对比',
      icon: `${globalData.app.publicPath}/images/compare.svg`,
    },
    {
      id: 'info',
      label: '设备信息',
      icon: `${globalData.app.publicPath}/images/detail.svg`,
    },
    {
      id: 'diagnosis',
      label: '诊断结论',
      icon: `${globalData.app.publicPath}/images/diagnosis.svg`,
    },
  ];

  const finalOptions = options.length ? options : defaultOptions;

  // 生成颜色数组
  const generateColors = (count: number) => {
    const baseColors = [
      'rgba(0, 160, 233, 0.6)',
      'rgba(11, 228, 222, 0.6)',
      'rgba(0, 160, 233, 0.6)',
      'rgba(11, 228, 222, 0.6)',
    ];

    const hoverColors = [
      'rgba(0, 160, 233, 0.8)',
      'rgba(11, 228, 222, 0.8)',
      'rgba(0, 160, 233, 0.8)',
      'rgba(11, 228, 222, 0.8)',
    ];

    return {
      background: baseColors.slice(0, count),
      hover: hoverColors.slice(0, count),
    };
  };

  const colors = useMemo(
    () => generateColors(finalOptions.length),
    [finalOptions.length]
  );

  // 准备图表数据
  const getChartData = (): ChartData<'pie'> => {
    // 根据选项数量调整数据分布
    let dataValues: number[] = [];

    if (finalOptions.length === 2) {
      // 二宫格：左右各占一半
      dataValues = [1, 1];
    } else if (finalOptions.length === 3) {
      // 三宫格：上方占1/3，下方两个各占1/3
      dataValues = [1, 1, 1];
    } else {
      // 四宫格：四个方向各占1/4
      dataValues = [1, 1, 1, 1];
    }

    return {
      labels: finalOptions.map(option => option.label),
      datasets: [
        {
          data: dataValues,
          backgroundColor: finalOptions.map((option, index) => {
            const isActive =
              selectedId === option.id || hoveredId === option.id;
            return isActive ? colors.hover[index] : colors.background[index];
          }),
          borderWidth: 2,
          borderColor: finalOptions.map(option => {
            const isActive =
              selectedId === option.id || hoveredId === option.id;
            return isActive
              ? 'rgba(255, 255, 255, 0.3)'
              : 'rgba(255, 255, 255, 0.1)';
          }),
          hoverBackgroundColor: colors.hover,
          hoverBorderColor: 'rgba(255, 255, 255, 0.3)',
          hoverBorderWidth: 3,
        },
      ],
    };
  };

  // 图表配置
  const getChartOptions = (): ChartOptions<'pie'> => ({
    responsive: true,
    maintainAspectRatio: false,
    rotation: -90, // 从正上方开始
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    animation: {
      duration: 300,
      easing: 'easeInOutQuart',
    },
    elements: {
      arc: {
        borderWidth: 2,
      },
    },
    onClick: (_event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const option = finalOptions[index];
        if (option) {
          handleClick(option.id)();
        }
      }
    },
    onHover: (_event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const option = finalOptions[index];
        if (option) {
          setHoveredId(option.id);
        }
      } else {
        setHoveredId(null);
      }
    },
  });

  const handleClick = useCallback(
    (id: string) => () => {
      if (selectedModel) {
        console.log('onSelect: ', id, 'selectedModel: ', selectedModel);
        globalData.app?.onRouletteClick?.(id, selectedModel);
      }
    },
    [selectedModel]
  );

  const closeHandler = useCallback(() => {
    let result = null;
    if (onClose) result = onClose();
    if (!result) {
      setSelectedModel(null);
      globalData.app?.onRouletteClose?.();
    }
  }, [onClose, setSelectedModel]);

  // 初始化图表
  useEffect(() => {
    if (canvasRef.current && !chartRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        chartRef.current = new ChartJS(ctx, {
          type: 'pie',
          data: getChartData(),
          options: getChartOptions(),
        });
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 更新图表数据
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.data = getChartData();
      chartRef.current.options = getChartOptions();
      chartRef.current.update();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalOptions, selectedId, hoveredId]);

  useEffect(() => {
    globalThis.setTimeout(() => {
      setContainerDisplay('block');
    }, 300);
  }, []);

  // 计算标签位置
  const getLabelPosition = (index: number, total: number) => {
    let angle = 0;

    if (total === 2) {
      // 二宫格：正左边与正右边
      angle = index === 0 ? 180 : 0; // 左边180度，右边0度
    } else if (total === 3) {
      // 三宫格：正上方、左下方、右下方
      if (index === 0) {
        angle = -90; // 正上方
      } else if (index === 1) {
        angle = 150; // 左下方
      } else {
        angle = 30; // 右下方
      }
    } else {
      // 四宫格：正上、正右、正下、正左
      angle = index * 90 - 90; // 0, 90, 180, 270度
    }

    const radius = containerWidth * 0.45; // 增加半径，让标签离中心更远
    const radian = (angle * Math.PI) / 180;

    const x = Math.cos(radian) * radius + containerWidth / 2;
    const y = Math.sin(radian) * radius + containerWidth / 2;

    return { x, y };
  };

  return (
    <RouletteContainer displayState={containerDisplay} ref={containerRef}>
      <ChartContainer>
        <Canvas ref={canvasRef} />

        {/* 选项标签 */}
        {finalOptions.map((option, index) => {
          const isActive = selectedId === option.id || hoveredId === option.id;
          const position = getLabelPosition(index, finalOptions.length);

          return (
            <OptionLabel
              key={`label-${option.id}`}
              isActive={isActive}
              style={{
                left: position.x,
                top: position.y,
                transform: `translate(-50%, -50%) scale(${isActive ? 1.1 : 1})`,
              }}
            >
              {option.icon && (
                <OptionIcon
                  src={option.icon}
                  alt={option.label}
                  isActive={isActive}
                />
              )}
              {option.label}
            </OptionLabel>
          );
        })}
      </ChartContainer>

      <CloseButton onClick={closeHandler} />
    </RouletteContainer>
  );
};

export default ChartRoulette;
