import React from 'react'

import './AppFooter.css';

interface AppFooterProps {
}

const AppFooter: React.FC<AppFooterProps> = ({}) => {
  return (
    <div className="App-footer">
      <footer className="App-footer-super-mises">
        <img src="/views/Home/super-mises-moon-noback-optimized.png" alt="SuperMises image" />
      </footer>
    </div>
  )
}

export default AppFooter
