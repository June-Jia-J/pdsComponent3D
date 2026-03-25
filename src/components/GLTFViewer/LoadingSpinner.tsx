import React from 'react';

interface LoadingSpinnerProps {
  progress: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ progress }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      {/* 旋转加载器 */}
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />

      {/* 进度条 */}
      <div
        style={{
          width: '200px',
          height: '4px',
          backgroundColor: '#f3f3f3',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#3498db',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* 进度文本 */}
      <div
        style={{
          fontSize: '14px',
          color: '#666',
        }}
      >
        加载中... {Math.round(progress)}%
      </div>

      <style>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
