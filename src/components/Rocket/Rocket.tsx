import React, {useCallback, useState, useEffect} from 'react'
import useFarming from '../../hooks/useFarming'
import numeral from 'numeral'
import {createClient} from 'contentful'
import moment from 'moment';

import Rebase from 'views/Home/components/Rebase'
import RelativeVelocity from 'views/Landing/components/RelativeVelocity'
import TotalLockedValue from 'views/Landing/components/TotalLockedValue'
import TotalSupply from 'views/Landing/components/TotalSupply'
import RocketFlame from './RocketFlame'

import './Rocket.css';

// import Logo from 'components/Logo'
// import MenuIcon from 'components/icons/Menu'

// import Nav from './components/Nav'
// import WalletButton from './components/WalletButton'

interface RocketProps {
  // param: () => void
}

interface RocketData {
  'relativeVelocity': number,
  'lockedInPools': number,
  'vloPrice': number,
  'delutedMarketCap': number,
  'circulatingSupply': number,
  'maxVloSupply': number,
}

const client = createClient({
  space: 'adq9qdsxjgw7',
  accessToken: 'n-7-zCo1GiwVHr2fRjX9V6LMTyj3c8rFFI1HCwVJLPs'
})

const Rocket: React.FC<RocketProps> = () => {
  const [rocketData, setRocketData] = useState<RocketData>()

  const {
    totalSupply,
    price,
    poolInfo,
    nextRebaseTimestamp,
    lastRebaseTimestamp
  } = useFarming()

  const getValueInTokens = (number: any, decimals = 18) => {
    return Number(number) / Math.pow(10, decimals)
  }

  const formatValue = useCallback((value?: any) => {
    if (value) {
      return numeral(value).format('0.00a')
    } else {
      return '--'
    }
  }, [])

  const getDelutedMarketCap = useCallback((price: any, totalSupply: any) => {
    const veloPrice = getVloPrice(price);
    return getValueInTokens(totalSupply) * veloPrice;
  }, [price, poolInfo])

  const getCirculatingMarketCap = useCallback((price: any, totalSupply: any) => {
    const circulatingSupply = getCirculatingSupply(price, totalSupply);
    const veloPrice = getVloPrice(price);
    return circulatingSupply * veloPrice;
  }, [price, poolInfo])

  const getCirculatingSupply = useCallback((price: any, totalSupply: any) => {
    if(! poolInfo || ! totalSupply) return 0;
    const vloPrice = getVloPrice(price);
    let sumVloStillInPools = 0;
    for(let poolName in poolInfo) {
      sumVloStillInPools += getValueInTokens(poolInfo[poolName].vloBalance);
    }
    if(sumVloStillInPools <= 0) return 0;
    const vloInCirculation = getValueInTokens(totalSupply) - sumVloStillInPools;
    return vloInCirculation;
  }, [price, poolInfo])

  const getVloPrice = useCallback((price: any) => {
    if(! price) return 0;
    if(price.VLO_WETH && price.WETH_DAI) {
      return Number(price.VLO_WETH) * Number(price.WETH_DAI);
    }
    return 0;
  }, [price])

  const fetchRocketData = async () => {
    const rocketDataFromContentful: any = await client.getEntry('4tExdtqS5PoXitC15X6utV');
    if(rocketDataFromContentful && rocketDataFromContentful.fields) {
      setRocketData(rocketDataFromContentful.fields);
      return rocketDataFromContentful.fields;
    }
    return {};
  }

  useEffect(() => {
    fetchRocketData()
    return () => {}
  }, [
  ])

  return (
    <div className="
      Rocket
      p-8
    ">
      <div className="Rocket-illustration">
        <Rebase />
        <div className="Rocket-data-list">
          <div>
            <label>Relative velocity</label>
            <div className="Rocket-data-list-stat">
              {rocketData && <RelativeVelocity value={rocketData ? rocketData['relativeVelocity'] : null} />}
            </div>
          </div>
          <div>
            <label>Locked in pools</label>
            <div className="Rocket-data-list-stat">
              {rocketData && <TotalLockedValue value={rocketData? rocketData['lockedInPools'] : null} />}
            </div>
          </div>
          <div>
            <label>Price VLO</label>
            <div className="Rocket-data-list-stat" style={{color: '#f00'}}>
              $ {getVloPrice(price) <= 0 ? Number(rocketData ? rocketData['vloPrice'] : 0).toFixed(4) : getVloPrice(price).toFixed(4)}
            </div>
          </div>
          <div>
            <label>Deluted Market Cap</label>
            <div className="Rocket-data-list-stat" style={{color: '#f00'}}>
              $ {getDelutedMarketCap(price, totalSupply) ? formatValue(getDelutedMarketCap(price, totalSupply)) : formatValue(rocketData ? rocketData['delutedMarketCap'] : 0)}
            </div>
          </div>
          <div>
            <label>Circulating supply</label>
            <div className="Rocket-data-list-stat">
              {getCirculatingSupply(price, totalSupply) ? formatValue(getCirculatingSupply(price, totalSupply)) : formatValue(rocketData ? rocketData['circulatingSupply'] : 0)}
            </div>
          </div>
          <div>
            <label>Max VLO supply</label>
            <div className="Rocket-data-list-stat">
              {rocketData && <TotalSupply value={rocketData ? rocketData['maxVloSupply'] : null} />}
            </div>
          </div>
        </div>
      </div>
      <div className={`
        Rocket-fire-wrapper
        animate__animated
        ${nextRebaseTimestamp > 0 && nextRebaseTimestamp < moment().unix() ? 'animate__shakeY animate__repeat-3' : 'animate__swing'}
      `} style={{
        position: 'relative',
        top: '-120px'
      }}>
        <RocketFlame />
      </div>
    </div>
  )
}

export default Rocket;
