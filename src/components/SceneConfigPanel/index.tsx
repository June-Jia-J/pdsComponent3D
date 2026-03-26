import React, { useState, useEffect, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { sceneConfigApiAtom, sceneConfigStateAtom } from '../../atoms/sceneConfig';
import styled from '@emotion/styled';
const PanelContainer = styled.div`
 position: absolute;
 top: 20px;
 right: 20px;
 width: 380px;
 max-height: calc(100vh - 40px);
 overflow-y: auto;
 background: rgba(30, 30, 40, 0.95);
 border-radius: 12px;
 box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
 color: white;
 font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
 z-index: 1000;
 backdrop-filter: blur(10px);
 border: 1px solid rgba(255, 255, 255, 0.1);
`;
const PanelHeader = styled.div`
 padding: 16px 20px;
 border-bottom: 1px solid rgba(255, 255, 255, 0.1);
 display: flex;
 justify-content: space-between;
 align-items: center;
 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
 border-radius: 12px 12px 0 0;
 h2 {
 margin: 0;
 font-size: 18px;
 font-weight: 600;
 }
`;
const TabContainer = styled.div`
 display: flex;
 padding: 4px;
 background: rgba(255, 255, 255, 0.05);
 margin: 12px;
 border-radius: 8px;
`;
const Tab = styled.button<{ active: boolean }>`
 flex: 1;
 padding: 8px 12px;
 border: none;
 background: ${props => props.active ? 'rgba(102, 126, 234, 0.8)' : 'transparent'};
 color: white;
 font-size: 12px;
 font-weight: 500;
 cursor: pointer;
 border-radius: 6px;
 transition: all 0.2s;
 &:hover {
 background: ${props => props.active ? 'rgba(102, 126, 234, 1)' : 'rgba(255, 255, 255, 0.1)'};
 }
`;
const InfoText = styled.p`
 margin: 0;
 color: #a0aec0;
 font-size: 13px;
 line-height: 1.5;
`;
const Section = styled.div`
 padding: 12px 20px;
 border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;
const SectionTitle = styled.h3`
 margin: 0 0 12px 0;
 font-size: 14px;
 font-weight: 600;
 color: #a0aec0;
 display: flex;
 align-items: center;
 gap: 8px;
`;
const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' | 'success' }>`
 padding: 10px 16px;
 border: none;
 border-radius: 8px;
 font-size: 13px;
 font-weight: 500;
 cursor: pointer;
 transition: all 0.2s;
 display: flex;
 align-items: center;
 justify-content: center;
 gap: 8px;
 background: ${props => {
 switch (props.variant) {
 case 'primary': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
 case 'danger': return 'linear-gradient(135deg, #f56565 0%, #c53030 100%)';
 case 'success': return 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
 default: return 'rgba(255, 255, 255, 0.1)';
 }
 }};
 color: white;
 &:hover {
 transform: translateY(-1px);
 box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
 }
 &:active {
 transform: translateY(0);
 }
 &:disabled {
 opacity: 0.5;
 cursor: not-allowed;
 transform: none;
 }
`;
const Input = styled.input`
 width: 100%;
 padding: 10px 12px;
 background: rgba(255, 255, 255, 0.05);
 border: 1px solid rgba(255, 255, 255, 0.1);
 border-radius: 8px;
 color: white;
 font-size: 13px;
 box-sizing: border-box;
 &:focus {
 outline: none;
 border-color: #667eea;
 }
 &::placeholder {
 color: rgba(255, 255, 255, 0.4);
 }
`;
const Select = styled.select`
 width: 100%;
 padding: 10px 12px;
 background: rgba(255, 255, 255, 0.05);
 border: 1px solid rgba(255, 255, 255, 0.1);
 border-radius: 8px;
 color: white;
 font-size: 13px;
 cursor: pointer;
 &:focus {
 outline: none;
 border-color: #667eea;
 }
 option {
 background: #1e1e28;
 color: white;
 }
`;
const ItemCard = styled.div<{ active?: boolean }>`
 padding: 12px;
 background: ${props => props.active ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.03)'};
 border: 1px solid ${props => props.active ? 'rgba(102, 126, 234, 0.5)' : 'rgba(255, 255, 255, 0.05)'};
 border-radius: 8px;
 margin-bottom: 8px;
 transition: all 0.2s;
 &:hover {
 background: ${props => props.active ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.08)'};
 }
`;
const ItemHeader = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 8px;
`;
const ItemName = styled.span`
 font-size: 13px;
 font-weight: 500;
`;
const ItemActions = styled.div`
 display: flex;
 gap: 6px;
`;
const IconButton = styled.button`
 padding: 4px 8px;
 background: rgba(255, 255, 255, 0.1);
 border: none;
 border-radius: 4px;
 color: white;
 font-size: 11px;
 cursor: pointer;
 transition: all 0.2s;
 &:hover {
 background: rgba(255, 255, 255, 0.2);
 }
`;
const InfoRow = styled.div`
 display: flex;
 justify-content: space-between;
 font-size: 12px;
 color: #a0aec0;
 margin-bottom: 4px;
 span:last-child {
 color: #e2e8f0;
 font-family: 'Monaco', 'Consolas', monospace;
 }
`;
const Grid = styled.div<{ columns?: number }>`
 display: grid;
 grid-template-columns: repeat(${props => props.columns || 2}, 1fr);
 gap: 10px;
`;
const Badge = styled.span<{ color?: string }>`
 padding: 2px 8px;
 background: ${props => props.color || 'rgba(102, 126, 234, 0.3)'};
 border-radius: 12px;
 font-size: 11px;
 font-weight: 500;
`;
type TabType = 'coordinate' | 'bookmarks' | 'lighting' | 'export';

// 场景配置访问 Hook - 通过 jotai atom 访问（确保跨 React 树可用）
const useSceneConfig = () => {
  // 从 jotai atom 获取状态（确保 Hook 调用顺序完全一致）
  const api = useAtomValue(sceneConfigApiAtom);
  const state = useAtomValue(sceneConfigStateAtom);
  
  // 如果 API 还未准备好，返回 null
  if (!api) {
    return null;
  }
  
  // 构建与 Context 兼容的对象
  return {
    api,
    pickedMesh: state.pickedMesh,
    bookmarks: state.bookmarks,
    lightingPresets: state.lightingPresets,
    activePresetId: state.activePresetId,
    anchors: state.anchors,
    isTransitioning: state.isTransitioning,
    controlsRef: { current: null },
    saveSceneConfig: () => api.config.save(),
    loadSceneConfig: (config: any) => api.config.load(config),
    exportSceneConfig: () => api.config.export(),
    importSceneConfig: (json: string) => api.config.import(json),
    flyTo: (position: [number, number, number], target: [number, number, number], options?: any) => api.camera.flyToPosition(position, target, options),
    applyLightingPreset: (id: string) => api.lighting.applyPreset(id),
    restoreViewBookmark: (id: string, options?: any) => api.camera.restoreBookmark(id, options),
  };
};

export const SceneConfigPanel: React.FC = () => {
 const [activeTab, setActiveTab] = useState<TabType>('coordinate');
 const [bookmarkName, setBookmarkName] = useState('');
 const [selectedPresetId, setSelectedPresetId] = useState<string>('');
 const context = useSceneConfig();
 
 // 如果 API 未就绪，显示加载状态
 if (!context || !context.api) {
   return (
     <PanelContainer>
       <PanelHeader>
         <h2>🎮 场景配置系统</h2>
         <Badge>v1.0</Badge>
       </PanelHeader>
       <Section>
         <SectionTitle>⏳ 正在初始化...</SectionTitle>
         <InfoText>等待 3D 场景加载完成</InfoText>
       </Section>
     </PanelContainer>
   );
 }
 
 const { pickedMesh, bookmarks, lightingPresets, activePresetId, api, isTransitioning, saveSceneConfig, exportSceneConfig, applyLightingPreset, restoreViewBookmark, } = context;
 useEffect(() => {
 if (activePresetId) {
 setSelectedPresetId(activePresetId);
 }
 }, [activePresetId]);
 const handleSaveBookmark = useCallback(() => {
 if (!bookmarkName.trim())
 return;
 const bookmark = api.camera.saveBookmark(bookmarkName);
 console.log('书签已保存:', bookmark);
 setBookmarkName('');
 }, [api.camera, bookmarkName]);
 const handleRestoreBookmark = useCallback(async (id: string) => {
 try {
 await restoreViewBookmark(id, { duration: 1500, easing: 'easeInOut' });
 console.log('视角已恢复');
 }
 catch (error) {
 console.error('恢复视角失败:', error);
 }
 }, [restoreViewBookmark]);
 const handleDeleteBookmark = useCallback((id: string) => {
 api.camera.removeBookmark(id);
 }, [api.camera]);
 const handleApplyPreset = useCallback((id: string) => {
 applyLightingPreset(id);
 }, [applyLightingPreset]);
 const handleExportConfig = useCallback(() => {
 const config = exportSceneConfig();
 const blob = new Blob([config], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `scene-config-${Date.now()}.json`;
 a.click();
 URL.revokeObjectURL(url);
 console.log('配置已导出');
 }, [exportSceneConfig]);
 const handleExportLightingPresets = useCallback(() => {
 const presets = api.lighting.exportAllPresets();
 const blob = new Blob([presets], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `lighting-presets-${Date.now()}.json`;
 a.click();
 URL.revokeObjectURL(url);
 console.log('光影预设已导出');
 }, [api.lighting]);
 const handleExportBookmarks = useCallback(() => {
 const bookmarksJson = JSON.stringify(bookmarks, null, 2);
 const blob = new Blob([bookmarksJson], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `view-bookmarks-${Date.now()}.json`;
 a.click();
 URL.revokeObjectURL(url);
 console.log('视角书签已导出');
 }, [bookmarks]);
 const formatVector = (vec: [
 number,
 number,
 number
 ] | undefined) => {
 if (!vec)
 return 'N/A';
 return `X: ${vec[0].toFixed(2)}, Y: ${vec[1].toFixed(2)}, Z: ${vec[2].toFixed(2)}`;
 };
 const currentView = api.camera.getCurrentView();
 return (<PanelContainer>
 <PanelHeader>
 <h2>🎮 场景配置系统</h2>
 <Badge>v1.0</Badge>
 </PanelHeader>

 <TabContainer>
 <Tab active={activeTab === 'coordinate'} onClick={() => setActiveTab('coordinate')}>
 📍 坐标拾取
 </Tab>
 <Tab active={activeTab === 'bookmarks'} onClick={() => setActiveTab('bookmarks')}>
 📸 视角书签
 </Tab>
 <Tab active={activeTab === 'lighting'} onClick={() => setActiveTab('lighting')}>
 💡 光影预设
 </Tab>
 <Tab active={activeTab === 'export'} onClick={() => setActiveTab('export')}>
 📤 导出配置
 </Tab>
 </TabContainer>

 {activeTab === 'coordinate' && (<>
 <Section>
 <SectionTitle>🎯 当前拾取信息</SectionTitle>
 {pickedMesh ? (<ItemCard active>
 <ItemHeader>
 <ItemName>{pickedMesh.meshName || '未命名对象'}</ItemName>
 <Badge color="rgba(72, 187, 120, 0.3)">已选中</Badge>
 </ItemHeader>
 <InfoRow>
 <span>网格 ID:</span>
 <span>{pickedMesh.meshId}</span>
 </InfoRow>
 <InfoRow>
 <span>距离相机:</span>
 <span>{pickedMesh.distance.toFixed(2)}m</span>
 </InfoRow>
 <InfoRow>
 <span>世界坐标:</span>
 <span>{formatVector(pickedMesh.point.point.world)}</span>
 </InfoRow>
 <InfoRow>
 <span>局部坐标:</span>
 <span>{formatVector(pickedMesh.point.point.local)}</span>
 </InfoRow>
 <InfoRow>
 <span>归一化坐标:</span>
 <span>{formatVector(pickedMesh.point.point.normalized)}</span>
 </InfoRow>
 <InfoRow>
 <span>包围盒中心:</span>
 <span>{formatVector(pickedMesh.boundingBox.center)}</span>
 </InfoRow>
 <InfoRow>
 <span>包围盒尺寸:</span>
 <span>{formatVector(pickedMesh.boundingBox.size)}</span>
 </InfoRow>
 </ItemCard>) : (<div style={{
 padding: '20px',
 textAlign: 'center',
 color: '#a0aec0',
 fontSize: '13px',
 }}>
 点击场景中的模型以查看坐标信息
 </div>)}
 </Section>

 <Section>
 <SectionTitle>📊 当前视角</SectionTitle>
 <InfoRow>
 <span>相机位置:</span>
 <span>{formatVector(currentView.position)}</span>
 </InfoRow>
 <InfoRow>
 <span>目标点:</span>
 <span>{formatVector(currentView.target)}</span>
 </InfoRow>
 <div style={{ marginTop: '12px' }}>
 <Button variant="secondary" onClick={() => {
 console.log('当前视角状态:', api.camera.getCurrentView());
 }} style={{ width: '100%' }}>
 📋 打印视角到控制台
 </Button>
 </div>
 </Section>
 </>)}

 {activeTab === 'bookmarks' && (<>
 <Section>
 <SectionTitle>✨ 保存新书签</SectionTitle>
 <div style={{ marginBottom: '12px' }}>
 <Input type="text" placeholder="输入书签名称..." value={bookmarkName} onChange={(e) => setBookmarkName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSaveBookmark()}/>
 </div>
 <Button variant="primary" onClick={handleSaveBookmark} disabled={!bookmarkName.trim() || isTransitioning} style={{ width: '100%' }}>
 💾 保存当前视角
 </Button>
 </Section>

 <Section>
 <SectionTitle>📑 视角书签列表 ({bookmarks.length})</SectionTitle>
 {bookmarks.length === 0 ? (<div style={{
 padding: '20px',
 textAlign: 'center',
 color: '#a0aec0',
 fontSize: '13px',
 }}>
 暂无保存的视角书签
 </div>) : (bookmarks.map((bookmark) => (<ItemCard key={bookmark.id}>
 <ItemHeader>
 <ItemName>{bookmark.name}</ItemName>
 <ItemActions>
 <IconButton onClick={() => handleRestoreBookmark(bookmark.id)} disabled={isTransitioning} title="恢复视角">
 {isTransitioning ? '⏳' : '🎬'}
 </IconButton>
 <IconButton onClick={() => handleDeleteBookmark(bookmark.id)} title="删除">
 🗑️
 </IconButton>
 </ItemActions>
 </ItemHeader>
 <InfoRow>
 <span>位置:</span>
 <span style={{ fontSize: '10px' }}>{formatVector(bookmark.position)}</span>
 </InfoRow>
 <InfoRow>
 <span>创建时间:</span>
 <span>{new Date(bookmark.createdAt).toLocaleTimeString()}</span>
 </InfoRow>
 {bookmark.description && (<InfoRow>
 <span>描述:</span>
 <span>{bookmark.description}</span>
 </InfoRow>)}
 </ItemCard>)))}
 </Section>

 {bookmarks.length > 0 && (<Section>
 <SectionTitle>📤 导出入</SectionTitle>
 <Grid>
 <Button variant="secondary" onClick={handleExportBookmarks}>
 📥 导出书签
 </Button>
 <Button variant="secondary" onClick={() => {
 const input = document.createElement('input');
 input.type = 'file';
 input.accept = '.json';
 input.onchange = (e) => {
 const file = (e.target as HTMLInputElement).files?.[0];
 if (file) {
 const reader = new FileReader();
 reader.onload = (event) => {
 const content = event.target?.result as string;
 api.camera.importBookmarks(content);
 };
 reader.readAsText(file);
 }
 };
 input.click();
 }}>
 📤 导入书签
 </Button>
 </Grid>
 </Section>)}
 </>)}

 {activeTab === 'lighting' && (<>
 <Section>
 <SectionTitle>🎨 光影预设列表</SectionTitle>
 <div style={{ marginBottom: '16px' }}>
 <Select value={selectedPresetId} onChange={(e) => setSelectedPresetId(e.target.value)}>
 <option value="">选择光影预设...</option>
 {lightingPresets.map((preset) => (<option key={preset.id} value={preset.id}>
 {preset.name} {preset.category ? `(${preset.category})` : ''}
 </option>))}
 </Select>
 </div>
 <Button variant="primary" onClick={() => selectedPresetId && handleApplyPreset(selectedPresetId)} disabled={!selectedPresetId} style={{ width: '100%' }}>
 ✨ 应用光影预设
 </Button>
 </Section>

 <Section>
 <SectionTitle>📋 预设详情</SectionTitle>
 {lightingPresets.map((preset) => (<ItemCard key={preset.id} active={preset.id === activePresetId}>
 <ItemHeader>
 <ItemName>{preset.name}</ItemName>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 {preset.category && (<Badge>{preset.category}</Badge>)}
 {preset.id === activePresetId && (<Badge color="rgba(72, 187, 120, 0.3)">当前</Badge>)}
 </div>
 </ItemHeader>
 {preset.description && (<p style={{
 fontSize: '12px',
 color: '#a0aec0',
 margin: '8px 0',
 }}>
 {preset.description}
 </p>)}
 <InfoRow>
 <span>光源数量:</span>
 <span>{Object.keys(preset.lights).length}</span>
 </InfoRow>
 <InfoRow>
 <span>HDR 环境:</span>
 <span>{preset.environment.enabled ? '启用' : '禁用'}</span>
 </InfoRow>
 <InfoRow>
 <span>阴影:</span>
 <span>{preset.shadows.enabled ? '启用' : '禁用'}</span>
 </InfoRow>
 <div style={{ marginTop: '12px' }}>
 <Button variant="secondary" onClick={() => handleApplyPreset(preset.id)} style={{ width: '100%', padding: '8px 12px', fontSize: '12px' }}>
 应用此预设
 </Button>
 </div>
 </ItemCard>))}
 </Section>

 <Section>
 <SectionTitle>📤 导出预设</SectionTitle>
 <Button variant="secondary" onClick={handleExportLightingPresets} style={{ width: '100%' }}>
 💾 导出所有光影预设
 </Button>
 </Section>
 </>)}

 {activeTab === 'export' && (<>
 <Section>
 <SectionTitle>💾 完整场景配置</SectionTitle>
 <p style={{
 fontSize: '12px',
 color: '#a0aec0',
 marginBottom: '16px',
 }}>
 导出包含视角书签、光影预设、锚点等所有配置的完整场景文件
 </p>
 <Grid>
 <Button variant="success" onClick={handleExportConfig}>
 📥 导出配置 JSON
 </Button>
 <Button variant="secondary" onClick={() => {
 const input = document.createElement('input');
 input.type = 'file';
 input.accept = '.json';
 input.onchange = (e) => {
 const file = (e.target as HTMLInputElement).files?.[0];
 if (file) {
 const reader = new FileReader();
 reader.onload = (event) => {
 const content = event.target?.result as string;
 api.config.import(content);
 };
 reader.readAsText(file);
 }
 };
 input.click();
 }}>
 📤 导入配置
 </Button>
 </Grid>
 </Section>

 <Section>
 <SectionTitle>📊 配置统计</SectionTitle>
 <InfoRow>
 <span>视角书签数量:</span>
 <span>{bookmarks.length}</span>
 </InfoRow>
 <InfoRow>
 <span>光影预设数量:</span>
 <span>{lightingPresets.length}</span>
 </InfoRow>
 <InfoRow>
 <span>当前光影预设:</span>
 <span>{lightingPresets.find((p) => p.id === activePresetId)?.name || '无'}</span>
 </InfoRow>
 <InfoRow>
 <span>锚点数量:</span>
 <span>{context.anchors.length}</span>
 </InfoRow>
 </Section>

 <Section>
 <SectionTitle>🔧 快捷操作</SectionTitle>
 <Grid>
 <Button variant="secondary" onClick={() => {
 const config = saveSceneConfig();
 console.log('场景配置:', config);
 }}>
 📋 打印配置
 </Button>
 <Button variant="danger" onClick={() => {
 if (confirm('确定要重置所有配置吗？')) {
 api.config.reset();
 console.log('配置已重置');
 }
 }}>
 🔄 重置配置
 </Button>
 </Grid>
 </Section>
 </>)}
 </PanelContainer>);
};

