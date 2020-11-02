import React from 'react'

import './SocialIcons.css';

interface SocialIconsProps {
}

const SocialIcons: React.FC<SocialIconsProps> = () => {
  return (
    <div className="SocialIcons">
      <div className="SocialIcons-social-channels">
        <a rel="noopener noreferrer" href="https://twitter.com/SuperMises" target="_blank">
          <img src="/views/Home/social-media-elements-twitter.svg" alt="Twitter icon" />
        </a>
        <a rel="noopener noreferrer" href="https://medium.com/@SuperMises" target="_blank">
          <img src="/views/Home/social-media-elements-medium.svg" alt="Medium icon" />
        </a>
        <a rel="noopener noreferrer" href="https://discord.gg/rGnnKTR" target="_blank" style={{
          opacity: 0.45,
          marginTop: '3px'
        }}>
          <img src="/views/Home/discord-logo.svg" alt="Discord icon" />
        </a>
        <a rel="noopener noreferrer" href="https://github.com/velo-finance/velo-protocol" target="_blank">
          <img src="/views/Home/github.png" alt="Github icon" className="SocialIcons-github-image" />
        </a>
        <a rel="noopener noreferrer" href="https://t.me/Velotoken" target="_blank">
          <img src="/views/Home/social-media-elements-telegram.svg" alt="Telegram icon" />
        </a>
      </div>
    </div>
  )
}

export default SocialIcons
