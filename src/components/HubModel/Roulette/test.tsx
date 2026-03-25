import React from 'react';
import ChartRoulette from './ChartRoulette';

const TestChartRoulette: React.FC = () => {
  const handleClick = (id: string) => {
    console.log('ChartRoulette clicked:', id);
  };

  const handleClose = () => {
    console.log('ChartRoulette closed');
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ChartRoulette onSelect={handleClick} onClose={handleClose} />
    </div>
  );
};

export default TestChartRoulette;
