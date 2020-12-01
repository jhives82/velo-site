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
      <div className="
        mx-auto my-4 flex justify-around
      " style={{
        transform: 'scale(1.2)',
        width: '200px',
        opacity: '0.8',
        margin: '40px auto'
      }}>

        <a
          href="https://info.uniswap.org/pair/0x259E558892783fd8941EBBeDa694318C1C3d9263"
          rel="external"
          target="_blank"
          className="text-white"
          title="Trade VLO at UniSwap"
          >
          <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png" />
        </a>

        <a
          href="https://sushiswap.fi/pair/0xd9DdFF07eBdCF5595998F9F195EDd705D1bD1AbC"
          rel="external"
          target="_blank"
          className="text-white"
          title="Trade VLO at SushiSwap"
          style={{
            width: '58px',
            height: '58px',
            background: '#fff',
            borderRadius: '100%',
            justifyContent: 'center',
            flexDirection: 'column',
            display: 'flex',
            fontSize: '30px'
          }}
          >
          🍣
        </a>

      </div>
    </div>
  )
}

export default SocialIcons
