import React, { useMemo, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { Object3D, Box3, Vector3 } from 'three';
import styled from '@emotion/styled';
import globalData from '@/store/globalData';

// 移除这些固定宽高，让容器自适应
const containerHeight = 272;
// const containerWidth = 100;

// Styled Components
const BubbleContainer = styled.div<{ opacity: number }>`
  position: relative;
  /* 移除固定宽度，让其根据内容自适应 */
  height: ${containerHeight}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* transform: translate(-50%, -100%); */
  pointer-events: none;
  opacity: ${({ opacity }) => opacity};
`;

const TopBubbleContainer = styled.div<{ height: number }>`
  display: flex;
  height: ${({ height }) => height}px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 50%; /* 保持圆形背景，但实际大小会是矩形 */
  padding: 8px;
  min-width: 60px; /* 最小宽度，防止内容过少时太窄 */
  box-sizing: border-box; /* 包含 padding 在计算宽度内 */
  text-align: center; /* 文本居中 */

  & span {
    z-index: 10;
    white-space: nowrap;
  }
`;

const MiddleLine = styled.div`
  width: 4px;
  flex-grow: 1;
  background:
    radial-gradient(
      63.02% 100% at 50% 100%,
      #ffffff 0%,
      rgba(255, 255, 255, 0) 100%
    ),
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 29.03%,
      rgba(11, 228, 222, 0.65) 100%
    );
  /* transform: matrix(-1, 0, 0, 1, 0, 0); // 这一行看起来是用于翻转渐变，如果需要请保留 */
`;

const BottomBall = styled.div`
  background: linear-gradient(180deg, #ffffff 30.56%, #0be4de 100%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
`;

const TitleSpan = styled.span`
  font-family: 'Alibaba PuHuiTi 3.0';
  font-weight: 400;
  /* font-style: 55 Regular; // 这是一个无效的CSS属性 */
  font-size: 10px; /* 使用固定像素值，或者根据设计稿调整 */
  letter-spacing: 0%;
  text-align: center;
  color: #ffffff;
  user-select: none;
  /* white-space: nowrap; */
`;

const ContentSpan = styled.span`
  font-family: 'Roboto';
  font-weight: 700;
  /* font-style: Bold; // 这是一个无效的CSS属性 */
  font-size: 8px; /* 使用固定像素值，或者根据设计稿调整 */
  letter-spacing: 0%;
  color: #ffffff;
  text-align: center;
  user-select: none;
  white-space: nowrap;
`;

const BubbleImage = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  height: 100%;
  object-fit: contain;
  transform: translate(-50%, -50%);
  z-index: 5; /* 确保图片在文字下方 */
`;

interface BubbleTitleProps {
  title: string;
  content: string;
  model: Object3D;
  offset?: number; // 在模型上方的偏移距离
}

const BubbleTitle: React.FC<BubbleTitleProps> = ({
  title = '',
  content = '',
  model,
  offset = 0,
}) => {
  const topBubbleRef = useRef<globalThis.HTMLDivElement>(null);
  const [bubbleWidth, setBubbleWidth] = useState<number | null>(null);

  // 计算模型的包围盒和位置
  const calculateModelPosition = useMemo(() => {
    const box = new Box3().setFromObject(model);
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

  const { position, size } = calculateModelPosition;

  if (bubbleWidth === null && topBubbleRef.current) {
    setBubbleWidth(topBubbleRef.current.offsetWidth);
  }

  return (
    <Html
      position={[position.x, position.y + size.y / 2 + offset, position.z]}
      // center
      distanceFactor={10}
      zIndexRange={[50, 0]}
      style={{
        // pointerEvents: "none",
        transform: 'translate(-50%, -100%)',
        width: 0,
      }}
    >
      <BubbleContainer opacity={bubbleWidth === null ? 0 : 1}>
        <TopBubbleContainer height={bubbleWidth ?? 0} ref={topBubbleRef}>
          <BubbleImage
            src={`${globalData.app?.publicPath}/images/bubble.svg`}
            alt='sensor-title-icon'
          />
          <TitleSpan>{title}</TitleSpan>
          <ContentSpan>{content}</ContentSpan>
        </TopBubbleContainer>
        <div
          style={{
            marginTop: '5px',
            marginBottom: '5px',
          }} /* 调整箭头与上下内容的间距 */
        >
          <img
            src={`${globalData.app?.publicPath}/images/arrowDownDouble.svg`}
            alt='arrowDownDouble'
          />
        </div>
        <MiddleLine />
        <BottomBall />
      </BubbleContainer>
    </Html>
  );
};

export default BubbleTitle;
