# GLTFViewer 组件

## 概述

GLTFViewer是一个基于React Three Fiber的3D模型查看器组件，支持GLTF/GLB格式的3D模型加载、显示和交互。

## 主要功能

### 1. 视角控制

#### 相机配置

- **视野角度**: 50度
- **近裁剪面**: 0.1
- **远裁剪面**: 1000
- **初始位置**: 可配置，默认 [0, 0, 5]
- **目标点**: 可配置，默认 [0, 0, 0]

#### 交互控制

- **左键**: 平移 (TRUCK)
- **中键**: 缩放 (DOLLY)
- **右键**: 旋转 (ROTATE)
- **滚轮**: 缩放 (DOLLY)

#### 触摸支持

- **单指**: 旋转
- **双指**: 缩放+平移
- **三指**: 缩放+平移

### 2. 视角限制

#### 距离限制

```typescript
setCameraLimit = {
  minDistance: 3, // 最小距离
  maxDistance: 20, // 最大距离
};
```

#### 角度限制

```typescript
setPolarAngle = {
  min: Math.PI / 6, // 最小垂直角度 (30°)
  max: Math.PI / 2.1, // 最大垂直角度 (约86°)
};
```

#### 平移边界限制 ⭐ **新增功能**

```typescript
setCameraLimit = {
  panLimit: {
    margin: {
      x: 5, // X轴偏移值（正值扩展边界）
      y: 3, // Y轴偏移值（正值扩展边界）
      z: 4, // Z轴偏移值（正值扩展边界）
    },
  },
};
```

**偏移值说明**:

- 正值：扩展边界，允许相机移动到场景外更远
- 负值：收缩边界，限制相机移动范围
- 不配置：自动使用场景最大尺寸的20%作为默认偏移

### 3. 智能功能

- **智能灯光**: 根据相机位置自动调整光照
- **智能视角**: 自动调整视角以获得最佳观察效果
- **自适应像素密度**: 根据性能自动调整渲染质量

## 平移边界限制实现

### 核心逻辑

1. **场景包围盒计算**: 基于模型场景创建包围盒，获取场景尺寸和中心点
2. **偏移值应用**: 根据`panLimit.margin`配置添加偏移值，扩展相机边界
3. **智能边界生成**: 使用`setFromCenterAndSize`方法创建精确的相机边界
4. **相机限制**: 调用`controls.setBoundary()`设置平移边界

### 偏移值计算方式

- **自定义偏移**: 当配置`panLimit.margin`时，使用配置的偏移值
- **默认偏移**: 未配置时，自动使用场景最大尺寸的20%作为偏移值
- **边界扩展**: 偏移值会向场景中心点两侧扩展，确保相机有足够的移动空间

### 代码实现

```typescript
// 设置相机边界
const setupCameraBoundary = useCallback(() => {
  if (controlsRef.current && modelScene) {
    try {
      // 创建场景包围盒
      const sceneBoundary = new Box3();
      sceneBoundary.setFromObject(modelScene);

      // 计算场景尺寸和中心点
      const sceneSize = sceneBoundary.getSize(new Vector3());
      const sceneCenter = sceneBoundary.getCenter(new Vector3());

      // 创建相机边界（基于场景包围盒）
      const cameraBoundary = new Box3();

      // 应用panLimit配置的偏移值
      if (setCameraLimit.panLimit?.margin) {
        const margin = setCameraLimit.panLimit.margin;

        // 计算偏移后的边界
        const offsetX = Math.abs(margin.x || 0);
        const offsetY = Math.abs(margin.y || 0);
        const offsetZ = Math.abs(margin.z || 0);

        // 设置相机边界，添加偏移值
        cameraBoundary.setFromCenterAndSize(
          sceneCenter,
          new Vector3(
            sceneSize.x + offsetX * 2,
            sceneSize.y + offsetY * 2,
            sceneSize.z + offsetZ * 2
          )
        );
      } else {
        // 如果没有配置偏移值，使用默认的扩展边界
        const defaultOffset =
          Math.max(sceneSize.x, sceneSize.y, sceneSize.z) * 0.2;
        cameraBoundary.copy(sceneBoundary);
        cameraBoundary.expandByScalar(defaultOffset);
      }

      // 设置相机边界
      controlsRef.current.setBoundary(cameraBoundary);

      console.log('📐 相机边界已设置:', {
        sceneBoundary: {
          min: sceneBoundary.min.toArray(),
          max: sceneBoundary.max.toArray(),
          size: sceneSize.toArray(),
          center: sceneCenter.toArray(),
        },
        cameraBoundary: {
          min: cameraBoundary.min.toArray(),
          max: cameraBoundary.max.toArray(),
        },
        panLimit: setCameraLimit.panLimit?.margin,
        defaultOffset: setCameraLimit.panLimit?.margin
          ? 'custom'
          : '20% of max dimension',
      });
    } catch (error) {
      console.warn('⚠️ 设置相机边界失败:', error);
    }
  }
}, [modelScene, setCameraLimit.panLimit]);
```

### 触发时机

1. **模型加载完成**: 通过`handleModelLoad`设置`modelScene`
2. **相机控制器初始化**: 在`CameraControls`的`ref`回调中触发
3. **延迟执行**: 使用100ms延迟确保控制器完全初始化

## 使用示例

```typescript
<GLTFViewer
  modelList={[{ id: 'model1', url: '/path/to/model.gltf' }]}
  setCameraLimit={{
    minDistance: 3,
    maxDistance: 20,
    panLimit: {
      margin: { x: 5, y: 3, z: 4 }  // 正值扩展边界，负值收缩边界
    }
  }}
  setPolarAngle={{
    min: Math.PI / 6,
    max: Math.PI / 2.1
  }}
/>

// 或者不配置panLimit，使用默认的20%偏移
<GLTFViewer
  modelList={[{ id: 'model1', url: '/path/to/model.gltf' }]}
  setCameraLimit={{
    minDistance: 3,
    maxDistance: 20
    // 不配置panLimit，将自动使用默认偏移
  }}
/>
```

## 注意事项

1. **边界设置**: 平移边界限制只在模型加载完成后生效
2. **性能影响**: 边界计算在模型加载时执行一次，不影响运行时性能
3. **错误处理**: 边界设置失败时会输出警告，不影响其他功能
4. **兼容性**: 需要Three.js的Box3和CameraControls支持

## 版本历史

- **v1.0**: 基础视角控制功能
- **v2.0**: 添加智能灯光和智能视角
- **v3.0**: ⭐ 新增平移边界限制功能，防止相机移动到场景外

## 作者

jiajing(jiajing@pdstars.com)

## 更新日志

- **2024-01-XX**: 实现平移边界限制功能
  - 添加Box3导入
  - 实现setupCameraBoundary函数
  - 在相机控制器初始化后自动设置边界
  - 支持panLimit配置参数
