import React from 'react';
import StatusPanel from './index';

// 测试新的左侧面板布局
const TestLayout: React.FC = () => {
  return (
    <div style={{ 
      position: 'relative', 
      width: '800px', 
      height: '600px', 
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc'
    }}>
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: '100px',
        height: '100px',
        backgroundColor: '#ddd',
        border: '2px solid #00a0e9',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        textAlign: 'center'
      }}>
        中央设备<br/>模型
      </div>
      
      <StatusPanel
        onClose={() => console.log('测试关闭')}
      />
    </div>
  );
};

export default TestLayout; 