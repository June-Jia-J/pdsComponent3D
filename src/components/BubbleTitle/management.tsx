import React from 'react';
import BubbleTitle from './index';
import useVisibleModelsInRange from '@/hooks/useVisibleModel';

// 气泡标题配置接口
export interface BubbleTitleConfig {
  name: string; // 模型名称
  title: string; // 标题
  content: string; // 显示的内容
  offset?: number; // 可选的偏移距离
}

// 管理组件属性接口
export interface BubbleTitleManagementProps {
  titleList: BubbleTitleConfig[];
  defaultOffset?: number;
}

/**
 * 气泡标题管理组件
 * 用于批量创建和管理多个气泡标题
 *
 * @param titleList - 气泡标题配置列表
 * @param defaultOffset - 默认偏移距离
 */
const BubbleTitleManagement: React.FC<BubbleTitleManagementProps> = ({
  titleList,
  defaultOffset = 0,
}) => {
  const { visibleModels } = useVisibleModelsInRange(
    20,
    titleList.map(item => item.name)
  );

  return (
    <>
      {visibleModels.map((model, index) => {
        const config = titleList.find(item => item.name === model.name)!;
        const { content, offset, title } = config;

        return (
          <BubbleTitle
            key={`${content}-${index}`}
            title={title}
            content={content}
            model={model}
            offset={offset ?? defaultOffset}
          />
        );
      })}
    </>
  );
};

export default BubbleTitleManagement;
