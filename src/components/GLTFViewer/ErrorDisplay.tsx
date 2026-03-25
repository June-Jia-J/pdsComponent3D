import React from 'react';

interface ErrorDisplayProps {
  error: Error;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '48px',
          color: '#e74c3c',
          marginBottom: '16px',
        }}
      >
        ⚠️
      </div>

      <h3
        style={{
          margin: '0 0 8px 0',
          color: '#e74c3c',
          fontSize: '18px',
        }}
      >
        模型加载失败
      </h3>

      <p
        style={{
          margin: '0',
          color: '#666',
          fontSize: '14px',
          maxWidth: '300px',
        }}
      >
        {error.message || '无法加载3D模型，请检查文件路径或网络连接'}
      </p>
    </div>
  );
};

export default ErrorDisplay;
