import React from 'react';
import ReactDOM from 'react-dom/client';
import OperationPanel from './components/OperationPanel';
import './styles.css';

const Sidepanel = () => {
  return (
    <div className="h-full">
      <OperationPanel />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Sidepanel />);
