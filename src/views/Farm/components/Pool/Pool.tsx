import React from 'react'
import * as R from 'ramda';

import './Pool.css';

// Import components
import FarmCard from '../FarmCard'
import Countdown from '../Countdown/Countdown'

interface CoinInterface {
  icon: string,
  emoticon?: string
  title: string
  name: string,
  pct: number,
  poolName?: string,
  coinName?: string,
}

interface PoolProps {
  title: string,
  description?: any,
  coins: CoinInterface[],
  disabled?: boolean,
  percentageToDistribute: number,
  percentageDistributed?: number
  timestampStartDistribution: number,
  timestampEndDistribution: number,
  duration?: number
}

const Pool: React.FC<PoolProps> = ({
  title,
  description,
  coins,
  disabled,
  percentageToDistribute,
  percentageDistributed,
  timestampStartDistribution,
  timestampEndDistribution,
  duration
}) => {
  return (
    <div>
      <h1 className="Pool-title mt-8 mb-2">
        {title}
      </h1>
      <Countdown
        timestampStartDistribution={timestampStartDistribution}
        timestampEndDistribution={timestampEndDistribution}
        percentageDistributed={percentageDistributed}
        percentageToDistribute={percentageToDistribute}
        />
      <div className="Pools-info-text text-sm text-center">
        {description}
      </div>
      <div className="Pool-coins flex flex-wrap justify-center">
        {R.map((coin: CoinInterface) => {
          return <FarmCard
                  key={coin.name}
                  emoticon={coin.emoticon}
                  icon={coin.icon}
                  title={coin.title}
                  pct={coin.pct}
                  name={coin.name}
                  poolName={coin.poolName}
                  coinName={coin.coinName}
                  disabled={disabled == true}
                  />
        }, coins)}
      </div>
    </div>
  )
}

export default Pool
